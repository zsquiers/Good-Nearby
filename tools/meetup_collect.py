# Search Meetup for in-person meditation, mindfulness, yoga, sound, walking and book groups near our towns.
# Usage: python3 tools/meetup_collect.py data/events-meetup.js
#
# Reads Meetup's public search pages (no account needed). Keeps upcoming events already in the file,
# drops past ones, adds new finds, skips anything another data file already lists, and prints what's new.
import datetime, html, json, os, re, subprocess, sys, time, urllib.parse, urllib.request

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
SEARCH_TOWNS = ["Franklin", "Framingham", "Natick", "Needham", "Boston", "Quincy", "Hingham", "Plymouth"]
KEYWORDS = ["meditation", "mindfulness", "yoga nidra", "sound bath", "breathwork", "tai chi", "hiking", "book club"]

RULES = [
    ("sound",      r"sound ?bath|sound healing|gong|singing bowl|spiritdrum|drum circle|kirtan"),
    ("breathwork", r"breathwork|pranayama"),
    ("tai-chi",    r"tai chi|qigong|qi gong"),
    ("meditation", r"meditat|mindful|\bzen\b|dharma|sangha|buddhis|vipassana|nidra|contemplat"),
    ("yoga",       r"\byoga\b"),
    ("hike",       r"\bhike|hiking|trail"),
    ("walk",       r"\bwalk"),
    ("book",       r"book (club|group|discussion)|readers"),
]
SKIP = (r"dating|singles|speed|networking|business|entrepreneur|invest|crypto|real estate|happy hour|wine|beer|trivia|"
        r"psychic|medium|tarot|online|zoom|virtual|webinar|\bkids?\b|children|toddler|teen|cancel+ed|postponed|"
        r"hot yoga|power yoga|bootcamp|hiit|10k|half marathon|bone casting|readings?\b|empowerment")

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=40).read().decode("utf-8", "ignore")

def clean(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()

def search(town, kw):
    url = ("https://www.meetup.com/find/?" + urllib.parse.urlencode(
        {"keywords": kw, "location": f"us--ma--{town}", "source": "EVENTS", "eventType": "inPerson"}))
    page = get(url)
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', page, re.S)
    ap = json.loads(m.group(1))["props"]["pageProps"].get("__APOLLO_STATE__", {}) if m else {}
    ref = lambda v: ap.get(v["__ref"], {}) if isinstance(v, dict) and "__ref" in v else (v or {})
    for k, e in ap.items():
        if not k.startswith("Event:") or not e.get("title") or e.get("eventType") != "PHYSICAL":
            continue
        venue, group, photo = ref(e.get("venue")), ref(e.get("group")), ref(e.get("featuredEventPhoto"))
        yield {"id": e["id"], "title": clean(e["title"]), "start": e.get("dateTime", ""), "url": e.get("eventUrl", ""),
               "desc": clean(e.get("description", "")), "venue": venue.get("name", ""), "address": venue.get("address", ""),
               "city": venue.get("city", ""), "state": venue.get("state", ""), "group": group.get("name", ""),
               "image": photo.get("highResUrl", "")}

def main():
    out = sys.argv[1]
    data_dir = os.path.dirname(out) or "."
    today = datetime.date.today()
    towns_js = open(os.path.join(data_dir, "towns.js")).read()
    towns = {n.lower(): (float(a), float(b)) for n, a, b in re.findall(r'name: "([^"]+)",\s*lat: ([\d.-]+), lng: ([\d.-]+)', towns_js)}

    found = {}
    for town in SEARCH_TOWNS:
        for kw in KEYWORDS:
            try:
                for e in search(town, kw): found.setdefault(e["id"], e)
            except Exception as err:
                print("ERR", town, kw, err, file=sys.stderr)
            time.sleep(0.8)
        print(f"{town}: {len(found)} so far", file=sys.stderr)

    # What other files already list (same day + similar title, or the same regular weekly/monthly session).
    norm = lambda t: re.sub(r"[^a-z]", "", (t or "").lower())
    js = ("global.window={};const fs=require('fs'),d=process.argv[1];for(const f of fs.readdirSync(d))"
          "if(f!=='" + os.path.basename(out) + "')require(require('path').resolve(d,f));"
          "console.log(JSON.stringify((window.GOOD_NEARBY_EVENTS||[]).map(e=>[e.title,e.start||'',e.venue||'',e.host||'',"
          "(e.weekly||e.monthly||{}).day||'',(e.weekly||e.monthly||{}).time||'',e.address||''])))")
    try:
        others = json.loads(subprocess.run(["node", "-e", js, data_dir], capture_output=True, text=True, check=True).stdout)
    except Exception as err:
        print("note: couldn't read other files:", err, file=sys.stderr); others = []
    dated = [(norm(t), s[:10]) for t, s, *_ in others if s]
    addr = lambda a: re.sub(r"[^a-z0-9]", "", (a or "").lower())[:8]   # "13 Common Street" ≈ "13 Common St"
    key = lambda v: norm(v)[:15]          # "Common Street Spiritual Center · Moon Room" ≈ "Common Street Spiritual Center"
    regular = {(k, d, tm) for _, _, v, h, d, tm, a in others if d for k in (key(v), key(h), addr(a)) if k}
    same_slot = {(k, s[:16]) for _, s, v, h, d, tm, a in others if len(s) >= 16 for k in (key(v), addr(a)) if k}
    DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    rows, seen = [], set()
    for e in found.values():
        if (norm(e["title"]), e["start"][:16]) in seen: continue          # the same event posted twice
        seen.add((norm(e["title"]), e["start"][:16]))
        title, low = e["title"], (e["title"] + " " + e["desc"][:400]).lower()
        if e["state"] != "MA" or e["city"].lower() not in towns: continue           # only our towns
        if re.search(SKIP, title.lower() + " " + e["group"].lower()): continue
        cat = next((c for c, p in RULES if re.search(p, title.lower())), None) or next((c for c, p in RULES if re.search(p, low)), None)
        if not cat or not e["start"] or e["start"][:10] < today.isoformat(): continue
        start = e["start"][:16]
        d = datetime.date.fromisoformat(start[:10])
        if any(dt == start[:10] and (n[:12] in norm(title) or norm(title)[:12] in n) for n, dt in dated): continue
        ks = {key(e["venue"]), addr(e["venue"]), addr(e["address"])} - {""}
        if any((k, DAYS[d.weekday()], start[11:16]) in regular or (k, start) in same_slot for k in ks): continue
        lat, lng = towns[e["city"].lower()]
        street = e["address"].split(",")[0] if e["address"] else ""
        rows.append({
            "id": f"mu-{e['id']}", "title": title, "category": cat, "start": start,
            "venue": e["venue"] or e["group"], "address": street, "city": f"{e['city']}, MA",
            "lat": lat, "lng": lng, "price": None, "priceNote": "Free to join on Meetup — some events ask a small fee",
            "host": e["group"] or e["venue"],
            "description": (e["desc"][:300] + ("…" if len(e["desc"]) > 300 else "")) or "See the Meetup page for details.",
            "url": e["url"], "source": "Meetup", **({"image": e["image"]} if e["image"] else {}),
            "tags": ["come-alone"],
        })

    existing = []
    if os.path.exists(out):
        txt = open(out).read()
        existing = json.loads(txt[txt.index(".concat(") + 8: txt.rindex(");")])
    fresh = {r["id"]: r for r in rows}
    kept = [fresh.get(r["id"], r) for r in existing if r["start"][:10] >= today.isoformat()]
    have = {r["id"] for r in kept}
    new = [r for r in rows if r["id"] not in have]
    merged = sorted(kept + new, key=lambda r: r["start"])
    hdr = ("// In-person meditation, mindfulness, yoga, sound, walking and book groups found on Meetup near our towns.\n"
           "// Made by tools/meetup_collect.py; re-run it rather than editing by hand.\n")
    open(out, "w").write(hdr + "window.GOOD_NEARBY_EVENTS = (window.GOOD_NEARBY_EVENTS || []).concat("
                         + json.dumps(merged, indent=1, ensure_ascii=False) + ");\n")
    print(f"kept {len(kept)}, dropped {len(existing) - len(kept)} past, added {len(new)} new")
    for r in new: print(f"NEW  {r['start']}  {r['category']:<10} {r['title'][:60]}  ({r['city']})")

if __name__ == "__main__":
    main()
