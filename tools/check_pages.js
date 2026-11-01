// Technical SEO check for every page tools/build_pages.js makes, plus the home page.
// Usage: node tools/check_pages.js     (exits with an error if anything needs fixing)
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://findgoodnearby.com";
const state = JSON.parse(fs.readFileSync(path.join(ROOT, "sources", "pages-state.json"), "utf8"));
const errors = [], warnings = [];
const err = (p, m) => errors.push(`${p}: ${m}`);
const warn = (p, m) => warnings.push(`${p}: ${m}`);
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const fileFor = (p) => (p.endsWith("/") ? path.join(ROOT, p, "index.html") : path.join(ROOT, p));
const pages = { "/": { index: true }, "/404.html": { index: false }, ...state.pages };
const titles = new Map(), descs = new Map(), inbound = new Map();
const robots = fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8");
const blocked = [...robots.matchAll(/^Disallow:\s*(\S+)/gm)].map((m) => m[1]);

for (const [p, info] of Object.entries(pages)) {
  const f = fileFor(p);
  if (!fs.existsSync(f)) { err(p, "file missing"); continue; }
  const h = fs.readFileSync(f, "utf8");
  const one = (re) => (h.match(re) || [])[1];
  const title = one(/<title>([^<]*)<\/title>/), desc = one(/<meta name="description" content="([^"]*)"/);
  const canon = one(/<link rel="canonical" href="([^"]*)"/), noindex = /<meta name="robots" content="noindex/.test(h);
  if ((h.match(/<title>/g) || []).length !== 1) err(p, "needs exactly one <title>");
  if (!title) err(p, "no title"); else if (info.index) {
    if (titles.has(title)) err(p, `same title as ${titles.get(title)}`); titles.set(title, p);
    if (decode(title).length > 80) warn(p, `long title (${decode(title).length})`);
  }
  if (!desc) err(p, "no meta description"); else if (info.index) {
    if (descs.has(desc)) err(p, `same description as ${descs.get(desc)}`); descs.set(desc, p);
    if (decode(desc).length > 160 || decode(desc).length < 70) warn(p, `description length ${decode(desc).length}`);
  }
  if (info.index) {
    if (noindex) err(p, "indexable page is marked noindex");
    if (canon !== SITE + p) err(p, `canonical is ${canon}`);
    if (blocked.some((b) => p.startsWith(b))) err(p, "blocked by robots.txt");
  } else if (!noindex) err(p, "should be noindex");
  if ((h.match(/<h1[\s>]/g) || []).length !== 1) err(p, "needs exactly one <h1>");
  if (!/<meta name="viewport"/.test(h)) err(p, "no viewport tag");
  if (!/<html lang="en">/.test(h)) err(p, "no lang");
  for (const img of h.match(/<img\b[^>]*>/g) || []) if (!/\balt=/.test(img)) err(p, `image without alt: ${img.slice(0, 60)}`);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let ld; try { ld = JSON.parse(m[1]); } catch (e) { err(p, "structured data doesn't parse"); continue; }
    if (ld["@type"] === "Event") {
      if (!info.index) err(p, "Event data on a page that isn't indexed");
      for (const k of ["name", "startDate", "location", "eventStatus", "eventAttendanceMode"]) if (!ld[k]) err(p, `Event missing ${k}`);
      if (!/T\d\d:\d\d:00[-+]\d\d:\d\d$/.test(ld.startDate || "")) err(p, "Event startDate needs a time and offset");
      if (new Date(ld.endDate || ld.startDate) < new Date()) err(p, "Event has already ended");
      if (!ld.location || !ld.location.address || !ld.location.address.streetAddress) err(p, "Event needs a street address");
    }
    if (ld["@type"] === "BreadcrumbList") for (const it of ld.itemListElement) if (!pages[it.item.replace(SITE, "")] && it.item.replace(SITE, "") !== "/") err(p, `breadcrumb points to missing page ${it.item}`);
  }
  for (const m of h.matchAll(/href="(\/[^"#]*)"/g)) {
    const href = m[1].split("?")[0];
    if (/^\/(assets|styles\.css|pages\.css|privacy\.html|manifest)/.test(href)) { if (!fs.existsSync(fileFor(href))) err(p, `broken link ${href}`); continue; }
    if (href === "/") continue;
    if (!pages[href]) { err(p, `link to a page that doesn't exist: ${href}`); continue; }
    if (href !== p) inbound.set(href, (inbound.get(href) || 0) + 1);
  }
}
// Sitemap: every indexable page, nothing else.
const sm = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const inMap = new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, "")));
for (const [p, info] of Object.entries(pages)) {
  if (info.index && !inMap.has(p)) err(p, "not in sitemap.xml");
  if (!info.index && inMap.has(p)) err(p, "in sitemap.xml but not indexable");
  if (info.index && p !== "/" && !inbound.get(p)) err(p, "no other page links to it");
}
for (const p of inMap) if (p !== "/privacy.html" && !pages[p]) err(p, "in sitemap.xml but missing");
if (!/Sitemap: https:\/\/findgoodnearby\.com\/sitemap\.xml/.test(robots)) err("robots.txt", "doesn't point to the sitemap");

// Hand-written intros may only name places that are current listings.
const m = require("./build_pages.js");
for (const [id, r] of Object.entries(m.REGIONS)) for (const n of r.named)
  if (!m.listings.some((e) => e.area === id && `${e.title} ${e.venue || ""} ${e.host || ""}`.includes(n))) err(`region ${id}`, `intro names "${n}", which is no longer listed`);
for (const [t, r] of Object.entries(m.TOWN_NOTES)) for (const n of r.named)
  if (m.townPages.has(t) && !m.listings.some((e) => e.town === t && `${e.title} ${e.venue || ""} ${e.host || ""}`.includes(n))) err(`town ${t}`, `intro names "${n}", which is no longer listed`);

const n = Object.keys(pages).length;
console.log(`Checked ${n} pages and sitemap.xml (${inMap.size} URLs).`);
warnings.forEach((w) => console.log(`  note: ${w}`));
if (errors.length) { errors.forEach((e) => console.log(`  ✗ ${e}`)); console.log(`${errors.length} problem(s).`); process.exit(1); }
console.log("✓ No problems found.");
