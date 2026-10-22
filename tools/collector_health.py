# The alarm for the monthly search: did any collector quietly stop working?
# Usage: python3 tools/collector_health.py        (run after all the collectors)
#
# Compares each data file with the last run (saved in sources/collector-counts.json) and writes
# sources/health.md. It warns when a collector found nothing new, when a file shrank a lot,
# when the next two weeks look thin, or when Eventbrite / Meetup photos stop loading.
# Then it saves this run's numbers for next month.
import datetime, json, os, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVED = os.path.join(ROOT, "sources", "collector-counts.json")
REPORT = os.path.join(ROOT, "sources", "health.md")
# Files filled by a collector — these should find something new every month.
COLLECTED = {
    "events-eventbrite.js": "Eventbrite (tools/eventbrite_collect.py + eventbrite_to_js.py)",
    "events-meetup.js": "Meetup (tools/meetup_collect.py)",
    "events-libraries.js": "Library calendars (tools/library_collect.py)",
    "events-calendars.js": "Venue calendars (tools/calendar_collect.py)",
}
PHOTO_HOSTS = {"img.evbuc.com": "Eventbrite", "secure.meetupstatic.com": "Meetup"}
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

def listings():
    js = ("global.window={};const fs=require('fs'),p=require('path'),d=process.argv[1],out={};"
          "for(const f of fs.readdirSync(d)){const before=(window.GOOD_NEARBY_EVENTS||[]).length;"
          "require(p.resolve(d,f));out[f]=(window.GOOD_NEARBY_EVENTS||[]).slice(before)"
          ".map(e=>({id:e.id,start:e.start||'',ongoing:!!(e.weekly||e.monthly||!e.start),image:e.image||''}))}"
          "console.log(JSON.stringify(out))")
    run = subprocess.run(["node", "-e", js, os.path.join(ROOT, "data")], capture_output=True, text=True, check=True)
    return json.loads(run.stdout)

def photo_ok(url):
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": UA, "Referer": "https://findgoodnearby.com/"})
        return urllib.request.urlopen(req, timeout=20).status == 200
    except Exception:
        return False

def main():
    today = datetime.date.today().isoformat()
    soon = (datetime.date.today() + datetime.timedelta(days=14)).isoformat()
    files = listings()
    last = json.load(open(SAVED)) if os.path.exists(SAVED) else {}
    last_files = last.get("files", {})

    warnings, rows = [], []
    for f, items in sorted(files.items()):
        if not items:
            continue
        upcoming = [e for e in items if e["ongoing"] or e["start"][:10] >= today]
        ids = {e["id"] for e in upcoming}
        before = last_files.get(f, {})
        new = len(ids - set(before.get("ids", [])))
        rows.append(f"| {f} | {before.get('count', '—')} | {len(ids)} | {new if before else '—'} |")
        if f in COLLECTED and before:
            if new == 0:
                warnings.append(f"**{COLLECTED[f]} found nothing new this month.** It has probably stopped working "
                                "(the site may have changed or started blocking it). Run it by hand and read its output.")
            if before.get("count", 0) >= 10 and len(ids) < before["count"] * 0.6:
                warnings.append(f"**{f} shrank from {before['count']} to {len(ids)} listings.** Check {COLLECTED[f]}.")

    everything = [e for items in files.values() for e in items]
    next_two_weeks = sum(1 for e in everything if not e["ongoing"] and today <= e["start"][:10] <= soon)
    if next_two_weeks < 40:
        warnings.append(f"**Only {next_two_weeks} dated events in the next two weeks** (usually 100+). The site will feel empty.")

    for host, name in PHOTO_HOSTS.items():
        sample = next((e["image"] for e in everything if host in e["image"]), None)
        if sample and not photo_ok(sample):
            warnings.append(f"**{name} photos aren't loading** (tried {sample}). Cards will show the plain gradient "
                            "instead; consider downloading photos into assets/ or dropping them.")

    lines = [f"# Collector health — {today}", ""]
    lines += ["## ⚠️ Needs a look", ""] + [f"- {w}" for w in warnings] if warnings else ["✅ All collectors look healthy."]
    lines += ["", f"Dated events in the next two weeks: **{next_two_weeks}**", "",
              "| File | Last run | Now | New since last run |", "| --- | --- | --- | --- |"] + rows
    if not last:
        lines += ["", "_First run: saved as the baseline, so next month can compare._"]
    open(REPORT, "w").write("\n".join(lines) + "\n")

    json.dump({"date": today, "files": {f: {"count": len({e['id'] for e in items if e['ongoing'] or e['start'][:10] >= today}),
                                            "ids": sorted({e['id'] for e in items if e['ongoing'] or e['start'][:10] >= today})}
                                        for f, items in files.items() if items}},
              open(SAVED, "w"), indent=1)
    print("\n".join(lines))
    return 0

if __name__ == "__main__":
    sys.exit(main())
