# Turn raw Eventbrite results into listings, merged into data/events-eventbrite.js.
# Usage: python3 tools/eventbrite_to_js.py raw.json data/events-eventbrite.js
# Keeps every upcoming event already in the file, drops ones that have passed, adds new finds,
# skips anything already listed by hand in the other data files, and prints what's new.
import datetime, glob, json, os, re, sys
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
today = datetime.date.today().isoformat()
SKIP = [r"wine", r"tasting", r"game night", r"\brpg\b", r"comedy", r"wrestling", r"s[ée]ance", r"spirit medium", r"messages from (heaven|above)",
        r"tarot", r"master your intuition", r"mini golf", r"fundraiser", r"coffee & connections", r"conference", r"summit", r"labor and birth",
        r"making marriage", r"couples workshop", r"book launch", r"curated cuisine", r"after5boston", r"sip mask", r"glow and grow", r"serenity breakfast",
        r"sparkle social", r"ninjutsu", r"salsa", r"bachata", r"tango", r"latin dance", r"bular[ií]as", r"buler[ií]as", r"fiesta", r"workout party", r"strength class", r"power boost",
        r"train f\.a\.s\.t", r"cardio dance", r"bbb moves", r"fit fete", r"nutre", r"7-day energized", r"her next chapter", r"grandparents", r"poetry",
        r"writing group", r"ink painting", r"experience of the senses", r"love from above", r"por inteiro", r"entheogenic", r"yung pueblo", r"hygge",
        r"shejumps", r"zoom", r"20th anniversary", r"sparkler mini-retreat", r"sunday 11am meditation", r"embracing black healing", r"reiki for dogs",
        r"united voice", r"rethinking mental health", r"beyond nursing", r"women's health summit", r"life design retreat"]
RULES = [("walk", r"\bwalk"), ("tai-chi", r"tai chi|qigong"), ("sound", r"sound ?bath|sound healing|soundscape|gong|singing bowl|crystal bowl|kirtan|spiritdrum|frequency"),
         ("acupuncture", r"acupuncture"), ("reiki", r"reiki"), ("breathwork", r"breath|pranayama"), ("yoga", r"yoga|yin\b|flow\b|stretch"),
         ("movement", r"pilates|barre|dance|5rhythms|bollyx|joy movement|ride\b|fitness|moves"),
         ("meditation", r"meditat|zen|mindful|dharma|retreat|nidra|mantra|buddh|vajrasattva|nondual|whirling|dervish|cacao|stillpoint|tangle")]
# Skip anything already listed by hand in the other data files (same day, similar title).
main = "".join(open(f).read() for f in glob.glob(os.path.join(os.path.dirname(out) or ".", "*.js"))
               if os.path.abspath(f) != os.path.abspath(out))
norm = lambda t: re.sub(r"[^a-z]", "", t.lower())
hand = [(norm(t), dt) for t, dt in re.findall(r'title: "([^"]+)",[\s\S]{0,120}?start: "(\d{4}-\d{2}-\d{2})', main)]
def dup(name, date):
    n = norm(name)
    return any(dt == date and (h[:14] in n or n[:14] in h) for h, dt in hand)
seen = set(); rows = []
for e in sorted(d, key=lambda x: (x["start_date"], x["start_time"] or "")):
    name = e["name"].strip(); low = (name + " " + e["summary"]).lower()
    if any(re.search(p, name.lower()) for p in SKIP): continue
    key = (re.sub(r"\W+", "", name.lower())[:40], e["start_date"])
    if key in seen: continue
    seen.add(key)
    cat = next((c for c, p in RULES if re.search(p, name.lower())), None) or next((c for c, p in RULES if re.search(p, low)), "workshop")
    if dup(name, e["start_date"]): continue
    start = f'{e["start_date"]}T{e["start_time"]}' if e["start_time"] else e["start_date"]
    end = f'{e["end_date"]}T{e["end_time"]}' if e.get("end_time") and e.get("end_date") else None
    if end and end <= start: end = None
    if e["is_free"]: price, note = 0, None
    elif e["min_price"]:
        lo, hi = e["min_price"] / 100, (e["max_price"] or e["min_price"]) / 100
        price, note = round(lo), (f"${lo:.0f}–${hi:.0f}" if hi > lo else None)
    else: price, note = None, "Tickets & price on Eventbrite"
    city = (e["city"] or "").strip() + (", " + e["region"] if e["region"] else "")
    rows.append({
        "id": "eb-" + e["url"].rstrip("/").split("-")[-1],
        "title": name, "category": cat, "start": start, **({"end": end} if end else {}),
        "venue": e["venue"] or "See event page", "address": e["street"], "city": city,
        "lat": round(float(e["lat"]), 4), "lng": round(float(e["lng"]), 4),
        "price": price, **({"priceNote": note} if note else {}),
        "host": e["organizer"] or e["venue"] or "See event page",
        "description": (e["summary"] or "See the event page for details.").strip(),
        "url": e["url"], "source": "Eventbrite",
    })
# Merge with what's already listed: keep upcoming events, drop past ones, add new finds.
existing = []
if os.path.exists(out):
    txt = open(out).read()
    existing = json.loads(txt[txt.index(".concat(") + 8: txt.rindex(");")])
def upcoming(r): return (r.get("end") or r["start"])[:10] >= today
kept = [r for r in existing if upcoming(r)]
have = {r["id"] for r in kept}
new = [r for r in rows if r["id"] not in have and upcoming(r)]
merged = sorted(kept + new, key=lambda r: r["start"])
hdr = ("// Wellness events found on Eventbrite across Greater Boston, MetroWest, the South Shore and the Franklin area.\n"
       "// Made by tools/eventbrite_to_js.py — re-run it rather than editing by hand (add unwanted titles to SKIP).\n")
open(out, "w").write(hdr + "window.GOOD_NEARBY_EVENTS = (window.GOOD_NEARBY_EVENTS || []).concat(" + json.dumps(merged, indent=1, ensure_ascii=False) + ");\n")
print(f"kept {len(kept)} upcoming, dropped {len(existing) - len(kept)} past, added {len(new)} new")
for r in new: print(f"NEW  {r['start'][:16]}  {r['category']:<11} {r['title'][:70]}  ({r['city']})")
