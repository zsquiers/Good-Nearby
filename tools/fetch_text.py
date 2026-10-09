# Fetch a web page and save it as plain text.  Usage: python3 tools/fetch_text.py URL OUT.txt
import sys, re, html, urllib.request
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
url, out = sys.argv[1], sys.argv[2]
try:
    raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=40).read().decode("utf-8", "ignore")
except Exception as e:
    print("ERR", url, e); sys.exit(0)
s = re.sub(r"(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>", " ", raw)
t = html.unescape(re.sub(r"<[^>]+>", "\n", s))
t = re.sub(r"[ \t]+", " ", t); t = re.sub(r"\n\s*\n+", "\n", t)
open(out, "w").write(t)
print("OK", url, len(t))
