# Read venue calendars built with "The Events Calendar" (a common WordPress calendar) and keep the good stuff.
# Usage: python3 tools/calendar_collect.py data/events-calendars.js
#
# Many community centers, studios and churches use this calendar. It has a public data feed
# (/wp-json/tribe/events/v1/events), so one reader works for all of them. To add a venue, add it to SITES.
# Classes that repeat on the same weekday and time become one weekly listing. The venue's calendar is the
# source of truth, so each run rewrites the file from scratch and prints the list.
import datetime, html, json, os, re, sys, urllib.request

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

# site id: where the calendar lives, and the venue's details (used when an event doesn't name its own)
SITES = {
    "commonstreet": {
        "url": "https://commonstreet.org",
        "venue": "Common Street Spiritual Center", "address": "13 Common St", "city": "Natick, MA",
        "lat": 42.2843, "lng": -71.3497,
    },
    "mountauburn": {
        "url": "https://mountauburn.org",
        "venue": "Mount Auburn Cemetery", "address": "580 Mount Auburn St", "city": "Cambridge, MA",
        "lat": 42.3708, "lng": -71.1446,
    },
}

# What we list, checked against the title first. First match wins.
RULES = [
    ("sound",      r"sound bath|sound healing|gong|singing bowl|spiritdrum|drum circle"),
    ("meditation", r"meditat|mindful|\bzen\b|vipassana|dharma|buddhis|kirtan|chant|whirling|dervish"),
    ("breathwork", r"breathwork|pranayama"),
    ("yoga",       r"\byoga\b"),
    ("tai-chi",    r"tai chi|qigong|qi gong"),
    ("walk",       r"walking tour|nature walk|\bwalk\b"),
    ("movement",   r"ballet|biodanza|dance|5rhythms|embodiment"),
    ("herbal",     r"herbal|\bherbs?\b|tea blend|apothecary"),
    ("craft",      r"craft circle|art sanctuary|pottery|watercolou?r|painting|knit|crochet|sewing|wreath|centerpiece"),
    ("book",       r"book (club|group|discussion)"),
]
SKIP = (r"devotion|tarot|oracle|open mic|#?letstalktech|support group|constellation|standout|blessing bags|showing|"
        r"\bkids?\b|children|toddler|teen|cancel+ed|postponed|private|rental|meeting$|board meeting|zoom|online|virtual")

def get_json(url):
    return json.loads(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read())

def clean(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()

def collect(today, until):
    found = []
    for sid, site in SITES.items():
        url = (f"{site['url']}/wp-json/tribe/events/v1/events?per_page=50"
               f"&start_date={today.isoformat()}&end_date={until.isoformat()}")
        while url:
            try:
                d = get_json(url)
            except Exception as e:
                print("ERR", url, e, file=sys.stderr); break
            for e in d.get("events", []):
                found.append((sid, site, e))
            url = d.get("next_rest_url")
        print(f"{site['venue']}: {sum(1 for x in found if x[0] == sid)} events", file=sys.stderr)
    return found

def to_listing(sid, site, e):
    title = clean(e["title"])
    if re.search(SKIP, title.lower()) or e.get("is_virtual") or e.get("all_day"):
        return None
    cats = " ".join(c["name"] for c in e.get("categories", [])).lower()
    if "children" in cats and not re.search(r"\badult", title.lower()):
        return None
    cat = next((c for c, p in RULES if re.search(p, title.lower())), None)
    if not cat: return None
    v = e.get("venue") if isinstance(e.get("venue"), dict) else {}
    room = clean(v.get("venue", ""))
    cost = clean(e.get("cost", ""))
    price = 0 if re.match(r"(?i)free", cost) else None
    m = re.search(r"\$\s*(\d+)", cost)
    if m and price is None: price = int(m.group(1))
    desc = clean(e.get("description", ""))
    return {
        "id": f"cal-{sid}-{e['id']}",
        "title": title, "category": cat,
        "start": e["start_date"][:16].replace(" ", "T"), "end": e["end_date"][:16].replace(" ", "T"),
        "venue": site["venue"] + (f" · {room.split('@')[0].strip()}" if room and room != site["venue"] and "@" in room else ""),
        "address": site["address"], "city": site["city"], "lat": site["lat"], "lng": site["lng"],
        "price": price, **({"priceNote": cost} if cost and price is None else {}),
        "host": site["venue"],
        "description": (desc[:300] + ("…" if len(desc) > 300 else "")) or "See the event page for details.",
        "url": e["url"], "source": "Venue calendar",
        **({"tags": ["free"]} if price == 0 else {}),
    }

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def group_weekly(rows):
    # Same title, weekday and time on 2+ dates → one weekly listing (an occasional missed week becomes a skip).
    groups = {}
    for r in rows:
        d = datetime.date.fromisoformat(r["start"][:10])
        groups.setdefault((r["title"], d.weekday(), r["start"][11:16]), []).append((d, r))
    out = []
    for (title, wd, t), items in groups.items():
        items.sort(key=lambda x: x[0])
        if len(items) < 2:
            out.append(items[0][1]); continue
        first, last = items[0][0], items[-1][0]
        dates = {d for d, _ in items}
        skip = [(first + datetime.timedelta(weeks=k)).isoformat() for k in range((last - first).days // 7 + 1)
                if first + datetime.timedelta(weeks=k) not in dates]
        if len(skip) > len(items) // 2:      # monthly or irregular: keep each date as its own listing
            out.extend(r for _, r in items); continue
        r = dict(items[0][1])
        r["id"] = re.sub(r"-\d+$", "", r["id"]) + "-" + re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:40] + f"-{DAYS[wd][:3].lower()}"
        r["weekly"] = {"day": DAYS[wd], "time": t, "endTime": r["end"][11:16], "from": first.isoformat(), "until": last.isoformat(),
                       **({"skip": skip} if skip else {})}
        r.pop("start"); r.pop("end")
        r["url"] = re.sub(r"/\d{4}-\d{2}-\d{2}/?$", "/", r["url"])
        out.append(r)
    return sorted(out, key=lambda r: r.get("start") or r["weekly"]["from"])

def main():
    out = sys.argv[1]
    today = datetime.date.today()
    rows = [r for r in (to_listing(*x) for x in collect(today, today + datetime.timedelta(days=60))) if r]
    listings = group_weekly(rows)
    hdr = ("// Meditation, sound, yoga and gentle classes from venues' own calendars (see SITES in tools/calendar_collect.py).\n"
           "// Made by tools/calendar_collect.py; re-run it rather than editing by hand.\n")
    open(out, "w").write(hdr + "window.GOOD_NEARBY_EVENTS = (window.GOOD_NEARBY_EVENTS || []).concat("
                         + json.dumps(listings, indent=1, ensure_ascii=False) + ");\n")
    print(f"{len(rows)} sessions → {len(listings)} listings")
    for r in listings:
        when = f"every {r['weekly']['day']} {r['weekly']['time']}" if "weekly" in r else r["start"]
        print(f"  {when:<22} {r['category']:<10} {r['title'][:60]}")

if __name__ == "__main__":
    main()
