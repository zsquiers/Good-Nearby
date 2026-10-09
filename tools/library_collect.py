# Read local library calendars and pull out book groups, creative classes and wellness programs for adults.
# Usage: python3 tools/library_collect.py data/events-libraries.js
#
# Many Massachusetts libraries use the same calendar system (assabetinteractive.com), so one reader
# covers them all. Keeps upcoming events already in the file, drops past ones, adds new finds and
# prints what's new for a person to review. To add a library, add a line to LIBRARIES.
import datetime, html, json, os, re, sys, time, urllib.request

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

# calendar id: (library name, town, lat, lng) — locations are approximate
LIBRARIES = {
    "medwaylib":          ("Medway Public Library",        "Medway",      42.1395, -71.3960),
    "fiskelib":           ("Fiske Public Library",         "Wrentham",    42.0655, -71.3290),
    "norfolkpl":          ("Norfolk Public Library",       "Norfolk",     42.1190, -71.3250),
    "millislibrary":      ("Millis Public Library",        "Millis",      42.1670, -71.3580),
    "bellinghamlibrary":  ("Bellingham Public Library",    "Bellingham",  42.0870, -71.4740),
    "boydenlibrary":      ("Boyden Library",               "Foxborough",  42.0650, -71.2480),
    "milfordtownlibrary": ("Milford Town Library",         "Milford",     42.1400, -71.5160),
    "hollistonlibrary":   ("Holliston Public Library",     "Holliston",   42.2000, -71.4250),
    "hopkintonlibrary":   ("Hopkinton Public Library",     "Hopkinton",   42.2285, -71.5225),
    "framinghamlibrary":  ("Framingham Public Library",    "Framingham",  42.2790, -71.4160),
    "goodnowlibrary":     ("Goodnow Library",              "Sudbury",     42.3835, -71.4160),
    "norwoodlibrary":     ("Morrill Memorial Library",     "Norwood",     42.1945, -71.1995),
    "ventresslibrary":    ("Ventress Memorial Library",    "Marshfield",  42.0920, -70.7055),
}

# What we list, checked against the title first, then the description. First match wins.
RULES = [
    ("book",       r"book (club|group|discussion|talk group)|readers?'? (circle|group)|page turners|cookbook club|read it and eat"),
    ("craft",      r"pottery|clay|ceramic|watercolou?r|acrylic|oil paint|painting|paint night|floral|flower arrang|bouquet|wreath|"
                   r"knit|crochet|sewing|quilt|embroider|needle|candle|terrarium|macram|calligraph|drawing|sketch|collage|"
                   r"journal(ing)? workshop|art class|art workshop|craft night|crafternoon|adult craft|make (and|&) take|cooking class|cooking demo"),
    ("yoga",       r"\byoga\b"),
    ("tai-chi",    r"tai chi|qigong"),
    ("meditation", r"meditat|mindful"),
    ("sound",      r"sound bath|sound healing"),
    ("breathwork", r"breathwork"),
]
SKIP = r"\bkids?\b|children|toddler|preschool|storytime|tween|teen|grades? \d|ages? \d|baby|family|virtual|zoom|online|cancel+ed|postponed|book sale|homeschool|hang show|reception|exhibit|gallery|opening|sensory-friendly|bighelp"

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=40).read().decode("utf-8", "ignore")

def clean(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

def to24(t, ampm):
    h, m = (t.split(":") + ["00"])[:2]
    h = int(h) % 12 + (12 if ampm.upper() == "PM" else 0)
    return f"{h:02d}:{m}"

def times(s):
    # "6:30—8:00 PM", "10:00 AM—12:00 PM", "11:00—11:45 AM", "All Day"
    m = re.match(r"(\d{1,2}(?::\d\d)?)\s*(AM|PM)?\s*[—–-]\s*(\d{1,2}(?::\d\d)?)\s*(AM|PM)", s, re.I)
    if m:
        a1 = m.group(2) or m.group(4)
        start, end = to24(m.group(1), a1), to24(m.group(3), m.group(4))
        if not m.group(2) and start > end:  # "11:30—12:30 PM" means 11:30 AM
            start = to24(m.group(1), "AM")
        return start, end
    m = re.match(r"(\d{1,2}(?::\d\d)?)\s*(AM|PM)", s, re.I)
    return (to24(m.group(1), m.group(2)), None) if m else (None, None)

def collect(today):
    months = [today.replace(day=1), (today.replace(day=1) + datetime.timedelta(days=32)).replace(day=1)]
    found = {}
    for lib, (name, town, lat, lng) in LIBRARIES.items():
        for mo in months:
            url = f"https://{lib}.assabetinteractive.com/calendar/{mo:%Y}-{mo:%B}/".lower()
            try:
                page = get(url)
            except Exception as e:
                print("ERR", url, e, file=sys.stderr); continue
            # Each day cell holds its events; the cell's class carries the date.
            for day, body in re.findall(r'class="day [^"]*day-(\d{4}-\d\d-\d\d)[^"]*"(.*?)(?=<div class="day |</main>|$)', page, re.S):
                for cls, block in re.findall(r'<div class="listing-event ([^"]*)"(.*?)(?=<div class="listing-event |$)', body, re.S):
                    m = re.search(r'<h3><a href="([^"]+)"[^>]*>(.*?)</a>', block, re.S)
                    if not m: continue
                    link, title = m.group(1), clean(m.group(2))
                    when = clean((re.search(r'class="event-time">(.*?)</span>', block, re.S) or [None, ""])[1])
                    room = clean((re.search(r'class="event-location-location">(.*?)</span>', block, re.S) or [None, ""])[1])
                    addr = clean((re.search(r'class="event-location-address">(.*?)</span>', block, re.S) or [None, ""])[1])
                    desc = clean((re.search(r'class="event-description-excerpt">(.*?)<a [^>]*event-description-excerpt-more', block, re.S)
                                  or re.search(r'class="event-description-excerpt">(.*?)</div>', block, re.S) or [None, ""])[1])
                    found[(link, day)] = dict(lib=lib, library=name, town=town, lat=lat, lng=lng, date=day, when=when,
                                             room=room, address=addr, title=title, desc=desc, url=link, cls=cls)
            time.sleep(0.5)
        print(f"{name}: {sum(1 for v in found.values() if v['lib'] == lib)} events", file=sys.stderr)
    return list(found.values())

def to_listing(e):
    text = e["title"].lower()
    if re.search(SKIP, text + " " + e["cls"]) or "category-children" in e["cls"] or "category-teen" in e["cls"]:
        return None
    cat = next((c for c, p in RULES if re.search(p, text)), None)
    if not cat and "category-adult" in e["cls"]:
        cat = next((c for c, p in RULES[:2] if re.search(p, e["desc"].lower())), None)
    if not cat: return None
    start, end = times(e["when"])
    if not start: return None
    street = e["address"].split(",")[0] if e["address"] else ""
    # "McAuliffe - Yarn Social" → "Yarn Social" (the branch is already the venue); drop "NEW DATE:" notes
    title = re.sub(r"^(new date|rescheduled|updated)\s*:\s*", "", re.sub(r"^(McAuliffe|Main)\s*-\s*", "", e["title"]), flags=re.I)
    venue = e["library"] + (" (McAuliffe Branch)" if e["title"].startswith("McAuliffe") else "")
    return {
        "id": "lib-" + e["lib"] + "-" + e["url"].rstrip("/").split("/")[-1] + "-" + e["date"],
        "title": title, "category": cat,
        "start": f'{e["date"]}T{start}', **({"end": f'{e["date"]}T{end}'} if end else {}),
        "venue": venue, "address": street, "city": f'{e["town"]}, MA',
        "lat": e["lat"], "lng": e["lng"],
        "price": 0, "host": e["library"],
        "description": (e["desc"][:300] or "See the library's page for details."),
        "url": e["url"], "source": "Library",
        "tags": ["free", "come-alone"],
    }

def main():
    out = sys.argv[1]
    today = datetime.date.today()
    rows = [r for r in (to_listing(e) for e in collect(today)) if r]
    existing = []
    if os.path.exists(out):
        txt = open(out).read()
        existing = json.loads(txt[txt.index(".concat(") + 8: txt.rindex(");")])
    upcoming = lambda r: r["start"][:10] >= today.isoformat()
    kept = [r for r in existing if upcoming(r)]
    have = {r["id"] for r in kept}
    new = [r for r in rows if r["id"] not in have and upcoming(r)]
    merged = sorted(kept + new, key=lambda r: r["start"])
    hdr = ("// Book groups, creative classes and wellness programs at local libraries — free and open to all.\n"
           "// Made by tools/library_collect.py; re-run it rather than editing by hand.\n")
    open(out, "w").write(hdr + "window.GOOD_NEARBY_EVENTS = (window.GOOD_NEARBY_EVENTS || []).concat("
                         + json.dumps(merged, indent=1, ensure_ascii=False) + ");\n")
    print(f"kept {len(kept)} upcoming, dropped {len(existing) - len(kept)} past, added {len(new)} new")
    for r in new: print(f"NEW  {r['start']}  {r['category']:<10} {r['title'][:60]}  ({r['venue']})")

if __name__ == "__main__":
    main()
