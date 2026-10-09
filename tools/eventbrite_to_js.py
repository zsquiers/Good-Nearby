# Turn raw Eventbrite results into listings, merged into data/events-eventbrite.js.
# Usage: python3 tools/eventbrite_to_js.py raw.json data/events-eventbrite.js
#        python3 tools/eventbrite_to_js.py raw-make.json data/events-eventbrite.js --make     (creative classes)
#        python3 tools/eventbrite_to_js.py raw-herbal.json data/events-eventbrite.js --herbal (herbalism)
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
MAKE = "--make" in sys.argv or "--herbal" in sys.argv   # both are hands-on classes
HERBAL = "--herbal" in sys.argv
# Creative classes: no chains, nothing for kids, nothing without a real place, and only near our towns.
MAKE_SKIP = [r"pinot'?s palette", r"paint ?nite", r"yaymaker", r"muse paintbar", r"board (&|and) brush", r"eataly", r"color me mine",
             r"\bkids?\b", r"children", r"toddler", r"\bteens?\b", r"family", r"ages? \d", r"parent", r"bachelorette", r"private event",
             r"location provided after booking", r"\bpub\b", r"\bbar\b", r"distillery", r"cocktail", r"mahjong", r"trivia", r"bingo",
             r"\bsip\b", r"byob", r"martini", r"margarita", r"booze", r"naked", r"boob", r"inebri", r"classpop", r"\buno\b", r"couple",
             r"no.school.day", r"high school", r"storytime", r"release party", r"festival", r"\bfest\b", r"\bfair\b", r"restaurant week",
             r"template", r"3d print", r"plasma", r"sandblast", r"metalwork", r"\bcnc\b", r"\bai\b", r"photography", r"sold out",
             r"halloween after dark", r"stein", r"pro.range", r"steam", r"bootcamp", r"tavern",
             r"building romance", r"paint the block", r"paint-a-ghost", r"drop in crafternoon"]
HERBAL_ONLY = (r"herbal|herbalism|\bherbs?\b|tea blend|salve|tincture|forag|apothecary|plant medicine|plant walk|"
               r"aromatherapy|flower essence|medicinal|wild edible|mushroom walk")
HERBAL_SKIP = [r"tea blending series with the boston school", r"essential oils? (party|business)", r"doterra", r"young living", r"cannabis", r"\bcbd\b", r"psilocybin", r"ayahuasca"]
# A creative class has to say what you'll make.
MAKE_ONLY = (r"pottery|clay|ceramic|kintsugi|wheel throwing|watercolou?r|painting|\bpaint\b|oil|acrylic|drawing|sketch|floral|flower|bouquet|"
             r"wreath|centerpiece|candle|terrarium|succulent|moss|bonsai|planter|knit|crochet|sew|mend|darn|embroider|weav|basket|macram|"
             r"print|mosaic|soap|cook|baking|bread|sourdough|pasta|gnocchi|dim sum|macaron|truffle|cake|cookie|tufting|marbling|stamp|"
             r"journal|collage|mixed media|bead|fiber|textile|garland|resin")
towns_js = open(os.path.join(os.path.dirname(out) or ".", "towns.js")).read()
TOWNS = [(float(a), float(b)) for a, b in re.findall(r"lat: ([\d.-]+), lng: ([\d.-]+)", towns_js)]
def near_us(lat, lng, miles=6):
    return any(((lat - a) * 69) ** 2 + ((lng - b) * 51) ** 2 <= miles ** 2 for a, b in TOWNS)
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
    if MAKE:
        if e.get("online") or not e.get("lat") or not near_us(float(e["lat"]), float(e["lng"])): continue
        if any(re.search(p, (name + " " + (e["venue"] or "") + " " + (e["organizer"] or "")).lower()) for p in MAKE_SKIP): continue
        if HERBAL:
            if not re.search(HERBAL_ONLY, name.lower()) or any(re.search(p, low) for p in HERBAL_SKIP): continue
        elif not re.search(MAKE_ONLY, name.lower()): continue
    key = (re.sub(r"\W+", "", name.lower())[:40], e["start_date"])
    if key in seen: continue
    seen.add(key)
    cat = "herbal" if HERBAL else "craft" if MAKE else (next((c for c, p in RULES if re.search(p, name.lower())), None)
                                or next((c for c, p in RULES if re.search(p, low)), "workshop"))
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
