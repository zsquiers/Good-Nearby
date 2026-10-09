# Search Eventbrite for wellness events around each area and save the raw results.
# Usage: python3 tools/eventbrite_collect.py raw.json             wellness search (takes ~5 minutes)
#        python3 tools/eventbrite_collect.py raw.json --make      creative classes: pottery, painting, floral, cooking…
#        python3 tools/eventbrite_collect.py raw.json --herbal    herbalism: herbal workshops, tea blending, foraging walks…
import json, re, sys, time, urllib.request
OUT = sys.argv[1]
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
towns = ["franklin", "framingham", "natick", "needham", "boston", "quincy", "hingham", "plymouth"]
terms = ["meditation", "sound-bath", "yoga", "breathwork", "reiki", "wellness", "mindfulness", "tai-chi"]
if "--make" in sys.argv:
    terms = ["pottery-class", "painting-class", "floral-workshop", "cooking-class", "candle-making", "watercolor", "wreath-workshop", "terrarium"]
if "--herbal" in sys.argv:
    terms = ["herbalism", "herbal-workshop", "herbal-medicine", "tea-blending", "foraging", "apothecary", "plant-medicine", "salve"]
found = {}
def walk(o):
    if isinstance(o, dict):
        if "start_time" in o and "name" in o and "url" in o: yield o
        for v in o.values(): yield from walk(v)
    elif isinstance(o, list):
        for v in o: yield from walk(v)
for t in towns:
    for q in terms:
        for page in (1, 2):
            url = f"https://www.eventbrite.com/d/ma--{t}/{q}/" + (f"?page={page}" if page > 1 else "")
            try:
                body = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=40).read().decode("utf-8", "ignore")
                i = body.index("__SERVER_DATA__ = ") + len("__SERVER_DATA__ = ")
                data, _ = json.JSONDecoder().raw_decode(body[i:])
            except Exception as e:
                print("ERR", url, e, file=sys.stderr); continue
            n0 = len(found)
            for e in walk(data):
                u = e["url"].split("?")[0]
                if u in found: found[u]["terms"].add(q); continue
                v = e.get("primary_venue") or {}
                a = v.get("address") or {}
                ta = e.get("ticket_availability") or {}
                mn = (ta.get("minimum_ticket_price") or {}).get("value")
                mx = (ta.get("maximum_ticket_price") or {}).get("value")
                found[u] = dict(name=e["name"], start_date=e.get("start_date"), start_time=e.get("start_time"),
                    end_date=e.get("end_date"), end_time=e.get("end_time"), tz=e.get("timezone"),
                    online=e.get("is_online_event"), series=e.get("is_series"), summary=(e.get("summary") or "")[:400],
                    venue=v.get("name", ""), street=a.get("address_1", ""), city=a.get("city", ""), region=a.get("region", ""),
                    lat=a.get("latitude"), lng=a.get("longitude"), is_free=ta.get("is_free"),
                    min_price=mn, max_price=mx, sold_out=ta.get("is_sold_out"),
                    organizer=(e.get("primary_organizer") or {}).get("name", ""), url=u, terms={q})
            print(f"{t}/{q} p{page}: +{len(found)-n0} = {len(found)}", file=sys.stderr)
            time.sleep(0.6)
            if len(found) == n0: break
for v in found.values(): v["terms"] = sorted(v["terms"])
json.dump(list(found.values()), open(OUT, "w"), indent=1)
