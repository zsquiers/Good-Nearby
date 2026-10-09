# Check every source in sources/sources.csv and report what's new since last time.
# Usage: python3 tools/check_sources.py            (checks the sources that are due)
#        python3 tools/check_sources.py --all      (checks everything)
#
# For each source it saves the page as text in sources/snapshots/ and compares it with the
# previous copy. The report (sources/report.md) lists:
#   - pages that couldn't be reached (the place may have closed or moved its page)
#   - pages that changed, with the new lines that mention a date or time — usually new events
# A person (or Claude) then reads the report and decides what to add. Nothing is added automatically.
import csv, datetime, hashlib, html, json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "sources", "sources.csv")
SNAP = os.path.join(ROOT, "sources", "snapshots")
STATE = os.path.join(ROOT, "sources", "last-check.json")
REPORT = os.path.join(ROOT, "sources", "report.md")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
EVERY = {"monthly": 25, "every 3 months": 80}  # days between checks

DATEISH = re.compile(r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.? \d{1,2}\b|\b\d{1,2}/\d{1,2}\b"
                     r"|\b(mon|tues?|wed|thur?s?|fri|sat|sun)[a-z]*day\b|\b\d{1,2}(:\d\d)? ?(am|pm)\b", re.I)

def fetch_text(url):
    raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=40).read().decode("utf-8", "ignore")
    s = re.sub(r"(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>", " ", raw)
    t = html.unescape(re.sub(r"<[^>]+>", "\n", s))
    lines = [re.sub(r"\s+", " ", l).strip() for l in t.split("\n")]
    return "\n".join(l for l in lines if l) + "\n"

def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60]

def main():
    check_all = "--all" in sys.argv
    today = datetime.date.today()
    state = json.load(open(STATE)) if os.path.exists(STATE) else {}
    os.makedirs(SNAP, exist_ok=True)
    unreachable, changed, same, skipped = [], [], [], 0
    for row in csv.DictReader(open(SRC)):
        url, name = row["url"].strip(), row["name"].strip()
        if not url or row["look_for"].strip() in ("eventbrite", "libraries"):
            continue  # these have their own tools (see sources/README.md)
        last = state.get(url, {}).get("checked")
        due = EVERY.get(row["how_often"].strip(), 25)
        if not check_all and last and (today - datetime.date.fromisoformat(last)).days < due:
            skipped += 1; continue
        path = os.path.join(SNAP, slug(name + "-" + url.split("//")[-1]) + ".txt")
        try:
            text = fetch_text(url)
        except Exception as e:
            unreachable.append((row, str(e)[:80]))
            state[url] = {**state.get(url, {}), "checked": today.isoformat(), "error": str(e)[:80]}
            continue
        old = open(path).read() if os.path.exists(path) else None
        open(path, "w").write(text)
        h = hashlib.sha1(text.encode()).hexdigest()[:12]
        if old is not None and hashlib.sha1(old.encode()).hexdigest()[:12] == h:
            same.append(row)
        else:
            seen = set(old.split("\n")) if old else set()
            lines = text.split("\n")
            # Show each new dated line with its neighbours, so "Oct 17" comes with the event's name.
            fresh = list(dict.fromkeys(" · ".join(lines[max(0, i - 2): i + 2])
                                       for i, l in enumerate(lines) if l and l not in seen and DATEISH.search(l)))
            changed.append((row, fresh[:40], old is None))
        state[url] = {"checked": today.isoformat(), "hash": h}
        print(f"{'changed' if changed and changed[-1][0] is row else 'same   '}  {name}", file=sys.stderr)
    json.dump(state, open(STATE, "w"), indent=1, sort_keys=True)

    out = [f"# Source check — {today:%B %-d, %Y}", "",
           f"{len(changed)} changed · {len(same)} unchanged · {len(unreachable)} couldn't be reached · {skipped} not due yet", ""]
    if unreachable:
        out += ["## Couldn't reach — check whether these moved or closed", "",
                "(403 or 429 usually means the site blocks robots, not that the place closed — check it in a browser.)", ""]
        out += [f"- **{r['name']}** ({r['area']}) — {r['url']} — {err}" for r, err in unreachable] + [""]
    if changed:
        out += ["## Changed since last check", "", "New lines that mention a date or time (often new events):", ""]
        for r, fresh, first in changed:
            out.append(f"### {r['name']} ({r['area']}) — {r['look_for']}")
            out.append(f"{r['url']}" + ("  ·  first check, so everything is new" if first else ""))
            out += [f"- {l[:240]}" for l in fresh] or ["- (changed, but no new dated lines — probably just layout)"]
            out.append("")
    open(REPORT, "w").write("\n".join(out))
    print("\n".join(out[:3]))
    print(f"Full report: {os.path.relpath(REPORT, ROOT)}")

if __name__ == "__main__":
    main()
