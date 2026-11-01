// Builds plain HTML pages that Google can read: regions, towns, topics and one page per listing.
// The app itself (index.html + app.js) is untouched; these pages use the same styles and link into it.
//
// Usage:  node tools/build_pages.js            build every eligible page + sitemap.xml
//         node tools/build_pages.js --sample   build only the four sample pages (no sitemap changes)
//
// Everything comes from data/*.js. Eventbrite and Meetup listings are left out (collection from those
// sites is paused), and so is anything without a verifiable date, place or host page.
// Pages are rebuilt from scratch each time, so listings that have ended disappear on their own.
"use strict";
process.env.TZ = "America/New_York";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://findgoodnearby.com";
const SAMPLE = process.argv.includes("--sample");
const NOW = process.env.BUILD_DATE ? new Date(`${process.env.BUILD_DATE}T08:00`) : new Date();

// ---------- data ----------
global.window = {};
for (const f of fs.readdirSync(path.join(ROOT, "data")).filter((f) => f.endsWith(".js")).sort()) require(path.join(ROOT, "data", f));
const AREAS = window.GOOD_NEARBY_TOWNS;
const ALL_TOWNS = AREAS.flatMap((a) => a.towns.map((t) => ({ ...t, areaId: a.id })));
const STYLE_V = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/styles\.css\?v=(\d+)/) || [])[1] || "1";

// ---------- dates (same rules as app.js) ----------
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_MS = 86400000;
const pad = (n) => String(n).padStart(2, "0");
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const parseLocal = (s) => new Date(s.includes("T") ? s : `${s}T00:00`);
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmt = (d, o) => new Intl.DateTimeFormat("en-US", o).format(d);
const timeText = (d) => fmt(d, { hour: "numeric", minute: d.getMinutes() ? "2-digit" : undefined });
const dayText = (d) => fmt(d, { weekday: "short", month: "short", day: "numeric" });
const longDay = (d) => fmt(d, { weekday: "long", month: "long", day: "numeric" });
// "2026-12-20T18:30:00-05:00": a local time with Boston's offset, for structured data
function isoLocal(d) {
  const off = -d.getTimezoneOffset();
  return `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${off < 0 ? "-" : "+"}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
}
const span = (s) => `${timeText(s.start)}–${timeText(s.end)}`.replace(/ (AM|PM)–(.*) \1$/, "–$2 $1");

function normalize(e) {
  const out = { ...e, sessions: null };
  if (e.weekly) {
    const w = e.weekly, dow = DAYS.indexOf(w.day), skip = new Set(w.skip || []);
    let d = w.from ? parseLocal(w.from) : startOfDay(NOW);
    while (d.getDay() !== dow) d = addDays(d, 1);
    const last = w.until ? parseLocal(w.until) : addDays(startOfDay(NOW), 120);
    out.sessions = [];
    for (; d <= last; d = addDays(d, 7)) {
      const day = ymd(d);
      if (!skip.has(day)) out.sessions.push({ start: parseLocal(`${day}T${w.time}`), end: parseLocal(`${day}T${w.endTime || w.time}`) });
    }
    out.repeat = `Every ${w.day}`;
  } else if (e.monthly) {
    const m = e.monthly, dow = DAYS.indexOf(m.day);
    out.sessions = [];
    for (let k = 0; k < 5; k++) {
      const first = new Date(NOW.getFullYear(), NOW.getMonth() + k, 1);
      const d = addDays(first, ((dow - first.getDay() + 7) % 7) + (m.week - 1) * 7);
      if (d.getMonth() === first.getMonth()) out.sessions.push({ start: parseLocal(`${ymd(d)}T${m.time}`), end: parseLocal(`${ymd(d)}T${m.endTime || m.time}`) });
    }
    out.repeat = `The ${["first", "second", "third", "fourth", "fifth"][m.week - 1]} ${m.day} of each month`;
  } else if (e.start && e.end && e.start.includes("T") && parseLocal(e.end) - parseLocal(e.start) > 6 * DAY_MS) {
    if (parseLocal(e.end) < NOW) return null;
    out.series = true;                       // a course with only first and last dates: no single date to promise
    out.schedule = `Several dates through ${fmt(parseLocal(e.end), { month: "long", day: "numeric" })}`;
  } else if (e.start) {
    out.allDay = !e.start.includes("T");
    const start = parseLocal(e.start);
    let end = e.end ? parseLocal(e.end) : null;
    if (out.allDay) end = addDays(end || start, 1);
    out.hasEnd = Boolean(e.end);
    out.sessions = [{ start, end: end || new Date(start.getTime() + 3600000) }];
  }
  if (out.sessions) {
    out.sessions = out.sessions.filter((s) => s.end > NOW);
    if (!out.sessions.length) return null;
    out.next = out.sessions[0];
  }
  return out;
}

function miles(a, b) {
  const R = 3958.8, rad = (x) => (x * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const townName = (e) => (e.city || "").replace(/, (MA|RI)$/, "").trim();
const state = (e) => ((e.city || "").match(/, (MA|RI)$/) || [, "MA"])[1];
function areaOf(e) {
  const t = ALL_TOWNS.find((x) => x.name.toLowerCase() === townName(e).toLowerCase());
  if (t) return t.areaId;
  if (e.lat == null) return null;
  let best = null, bestMi = Infinity;
  for (const x of ALL_TOWNS) { const mi = miles(e, x); if (mi < bestMi) { best = x; bestMi = mi; } }
  return best && bestMi <= 15 ? best.areaId : null;
}

// Listings eligible for a page of their own: not from paused Eventbrite/Meetup collection,
// with a town, an area, a host page to send people to, and not already over.
const listings = (window.GOOD_NEARBY_EVENTS || [])
  .filter((e) => !/eventbrite|meetup/i.test(`${e.source || ""} ${e.url || ""}`))
  .filter((e) => e.city && e.url && e.title)
  .map(normalize).filter(Boolean)
  .map((e) => ({ ...e, area: areaOf(e), town: townName(e) }))
  .filter((e) => e.area);

// ---------- topics ----------
const CARE = ["massage", "reiki", "acupuncture", "herbal", "breathwork", "salt", "sound"];
const LABEL = {
  yoga: "Yoga", meditation: "Meditation", sound: "Sound bath", massage: "Massage", reiki: "Reiki & energy", "tai-chi": "Tai chi",
  breathwork: "Breathwork", workshop: "Workshop", expo: "Expo & fair", acupuncture: "Acupuncture", salt: "Salt cave", run: "Community run",
  walk: "Walk", trail: "Trail & path", hike: "Hike", movement: "Movement & dance", shop: "Holistic shop", cafe: "Cozy café",
  craft: "Creative class", herbal: "Herbal & plant class", book: "Book group", bakery: "Cozy bakery",
};
const TOPICS = [
  { slug: "sound-baths", name: "Sound baths", tag: "Sound Baths", short: "sound baths", app: "/#/m/calm",
    test: (e) => e.category === "sound" || /sound bath|sound healing|singing bowl|gong/i.test(e.title),
    intro: "A sound bath is about as low-effort as self-care gets: you lie down, close your eyes and let singing bowls, gongs or gentle music wash over you. Most are an hour or so, no experience is needed, and many hosts bring mats and blankets. Some are paired with yoga, acupuncture or a candlelit room; a few are free at local libraries." },
  { slug: "yoga", name: "Yoga", tag: "Yoga", short: "yoga classes", app: "/#/m/move", test: (e) => e.category === "yoga",
    intro: "Gentle, restorative and beginner-friendly yoga, from drop-in studio classes to special evening series. If you're new, look for classes marked beginner-friendly, and arrive a few minutes early to borrow a mat." },
  { slug: "meditation", name: "Meditation & mindfulness", tag: "Meditation", short: "meditation groups", app: "/#/m/calm", test: (e) => ["meditation", "breathwork"].includes(e.category),
    intro: "Sitting groups, guided meditations and mindfulness evenings where you can simply show up and be quiet with others. Many are free or by donation, and nearly all welcome complete beginners." },
  { slug: "reiki-massage-acupuncture", name: "Reiki, massage & acupuncture", tag: "Reiki & Massage", short: "reiki, massage and acupuncture", app: "/#/m/care",
    test: (e) => ["reiki", "massage", "acupuncture"].includes(e.category),
    intro: "Places to be cared for: massage, reiki and acupuncture practitioners, plus group sessions that pair them with meditation or sound. These are listed for information only. Check with your doctor first if you have a health condition." },
  { slug: "salt-caves", name: "Salt caves", tag: "Salt Caves", short: "salt caves", app: "/#/m/calm", test: (e) => e.category === "salt",
    intro: "Salt caves and salt rooms are quiet, dim spaces lined with Himalayan salt where you sit back and rest for 45 minutes or so. Several also host yoga, sound baths and meditation inside the cave." },
  { slug: "creative-classes", name: "Creative classes", tag: "Creative Classes", short: "creative classes", app: "/#/m/make", test: (e) => ["craft", "herbal"].includes(e.category),
    intro: "Pottery, painting, flower arranging, fiber arts, cooking and herbal classes: hands-on ways to make something good and lose track of time. Many library classes are free; studio workshops usually include materials." },
  { slug: "book-groups", name: "Book groups", tag: "Book Groups", short: "book groups", app: "/#/m/people", test: (e) => e.category === "book",
    intro: "Friendly book groups, mostly at local libraries, where newcomers are welcome to drop in. It's an easy way to meet people without having to make small talk from scratch." },
  { slug: "trails-and-walks", name: "Trails & walks", tag: "Trails", short: "trails and walks", app: "/#/outside", test: (e) => ["trail", "walk", "hike", "run"].includes(e.category),
    intro: "Rail trails, wildlife sanctuaries, state forests and community walks, from flat paved paths to wooded loops. Most are free and open every day from dawn to dusk." },
  { slug: "cafes-and-bakeries", name: "Cozy cafés & bakeries", tag: "Cafés", short: "cozy cafés and bakeries", app: "/#/wander", test: (e) => ["cafe", "bakery", "shop"].includes(e.category),
    intro: "Independent cafés, bakeries and little shops worth a slow visit: a good coffee, something warm from the oven and a calm corner to sit in." },
];

const REGIONS = {
  "metrowest": { name: "MetroWest", slug: "metrowest",
    intro: "MetroWest stretches west of Boston along the Route 9 and Mass Pike corridor, from Wellesley and Needham out through Natick, Framingham and Sudbury. It's rich in quiet places to slow down: spiritual centers with weekly yoga and meditation, rail trails around Lake Cochituate, Mass Audubon sanctuaries and well-loved local libraries with free classes and book groups." },
  "franklin-area": { name: "Franklin & nearby", slug: "franklin-area",
    intro: "Franklin and its neighbors (Medway, Norfolk, Wrentham, Bellingham, Medfield, Walpole and Foxborough) mix small-town downtowns with state forests and rail trails. You'll find studio yoga and sound baths, a mindfulness sangha, cozy bakeries and the long, flat SNETT Rail Trail." },
  "boston-area": { name: "Boston area", slug: "boston-area",
    intro: "In and around Boston (Cambridge, Somerville, Jamaica Plain, Brookline and nearby) there's always something calm going on: free meditation, walks through Mount Auburn and the Arnold Arboretum, riverside paths and community classes." },
  "south-shore": { name: "South Shore", slug: "south-shore",
    intro: "From Hingham and Scituate down through Marshfield, Duxbury, Pembroke and Plymouth, the South Shore pairs ocean air with a growing wellness community: salt caves, a nonprofit with mostly free programs, restorative yoga series and coastal walks." },
};
const TOWN_NOTES = {
  "Franklin": "Downtown Franklin keeps several good things within a few blocks of each other: a bakery, an acupuncture studio and holistic boutique on East Central Street, and a yoga studio out on West Central. The SNETT Rail Trail and DelCarte's ponds are a few minutes away when you want to be outside.",
};

// ---------- URLs ----------
const slugify = (s) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70).replace(/-$/, "");
const townSlug = (t) => `${slugify(t)}-ma`;
const urls = new Map();       // listing id → path
const used = new Set();
for (const e of [...listings].sort((a, b) => (a.id < b.id ? -1 : 1))) {
  const dated = e.sessions && !e.repeat;
  let p = dated ? `/events/${slugify(`${e.title} ${e.town}`)}-${ymd(e.next.start)}/` : `/places/${slugify(`${e.title} ${e.town}`)}/`;
  if (used.has(p)) p = p.replace(/\/$/, `-${slugify(e.id).slice(-8)}/`);
  used.add(p); urls.set(e.id, p);
}

// ---------- HTML helpers ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clip = (s, n) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, "")}…`);
const SUN = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/<svg class="brand-mark"[\s\S]*?<\/svg>/) || [""])[0];
const priceText = (e) => (e.price === 0 ? "Free" : typeof e.price === "number" ? `$${e.price}` : "");

function whenShort(e) {
  if (e.repeat) return `${e.repeat.replace("The ", "")}`;
  if (e.next) return e.allDay ? dayText(e.next.start) : `${dayText(e.next.start)} · ${timeText(e.next.start)}`;
  return e.schedule || "Open most days";
}
function row(e, showTown = true) {
  const meta = [e.venue && e.venue !== e.title && !e.title.startsWith(e.venue) ? e.venue : "", showTown ? e.town : "", priceText(e)].filter(Boolean).map(esc).join(" · ");
  const time = e.next && !e.repeat ? `${fmt(e.next.start, { month: "short", day: "numeric" })}<span class="sub">${e.allDay ? "All day" : timeText(e.next.start)}</span>`
    : e.weekly ? `Weekly<span class="sub">${esc(e.weekly.day.slice(0, 3))}s</span>`
    : e.monthly ? `Monthly<span class="sub">${["1st", "2nd", "3rd", "4th", "5th"][e.monthly.week - 1]} ${esc(e.monthly.day.slice(0, 3))}</span>` : ongoing(e);
  return `<li><a class="row" href="${urls.get(e.id)}">
      <span class="row-time small">${time}</span>
      <span class="row-main"><span class="row-title">${esc(e.title)}</span><span class="row-meta">${meta}</span><span class="row-cat">${esc(LABEL[e.category] || e.category)}</span></span>
      <span class="row-arrow" aria-hidden="true">›</span></a></li>`;
}
// What to show in the time column for places and classes without a date.
function ongoing(e) {
  const s = e.schedule || "";
  if (e.series) return `Series<span class="sub">see dates</span>`;
  if (/appointment|appt/i.test(s)) return `By appt.<span class="sub">book ahead</span>`;
  if (e.hours || /daily|dawn|every day/i.test(s)) return `Open<span class="sub">most days</span>`;
  return `Ongoing<span class="sub">see times</span>`;
}
// Dated things in the next 4 months, then recurring, then places and ongoing classes.
function sections(items, opts = {}) {
  const soon = addDays(NOW, 120);
  const dated = items.filter((e) => e.next && !e.repeat && e.next.start < soon).sort((a, b) => a.next.start - b.next.start);
  const regular = items.filter((e) => e.repeat).sort((a, b) => a.next.start - b.next.start);
  const open = items.filter((e) => !e.sessions).sort((a, b) => a.title.localeCompare(b.title));
  const block = (title, list, limit) => list.length ? `<section class="slot"><h3>${title}<span>${list.length}</span></h3><ul class="rows">${list.slice(0, limit).map((e) => row(e, opts.showTown !== false)).join("")}</ul>${list.length > limit ? `<p class="hint-static">Showing ${limit} of ${list.length}.${opts.more ? ` ${opts.more}` : ""}</p>` : ""}</section>` : "";
  return block("Coming up", dated, opts.limit || 24) + block("Every week or month", regular, opts.limit || 24) + block("Places & ongoing classes", open, opts.limit || 24);
}

function page({ path: p, title, description, h1, eyebrow, crumbs, body, jsonld = [], ogType = "website" }) {
  const url = SITE + p;
  const crumbLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: SITE + c.path })) };
  const ld = [crumbLd, ...jsonld].map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n  ");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="only light" />
  <meta name="darkreader-lock" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="Good Nearby" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE}/assets/brand/good-nearby-share-site.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/assets/sunflower.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <meta name="theme-color" content="#f7f1e7">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&family=Jost:wght@300&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css?v=${STYLE_V}" />
  <link rel="stylesheet" href="/pages.css?v=${STYLE_V}" />
  ${ld}
</head>
<body data-screen="page">
  <div class="backdrop" aria-hidden="true"></div>
  <header class="topbar">
    <a href="/" class="brand" aria-label="Good Nearby — home">${SUN}<span>Good Nearby</span></a>
  </header>
  <main id="app">
    <nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map((c, i) => i === crumbs.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${c.path}">${esc(c.name)}</a></li>`).join("")}</ol></nav>
    <article class="day-card seo-card">
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ""}
      <h1>${esc(h1)}</h1>
      ${body}
    </article>
  </main>
  <footer class="footer">
    <a href="/">Find something good near you</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/#/submit">Know something good? Share it here</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="https://www.instagram.com/findgoodnearby/" target="_blank" rel="noopener">@findgoodnearby</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/privacy.html">Privacy</a>
    <p class="fine">We don't run these events, and details can change, so check with the host before you go. Listings are for information only and aren't medical advice.</p>
  </footer>
</body>
</html>
`;
}

const home = { name: "Home", path: "/" };
const regionCrumb = (id) => ({ name: REGIONS[id].name, path: `/${REGIONS[id].slug}/` });
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const listJoin = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
const towns = (items) => Object.entries(items.reduce((m, e) => ((m[e.town] = (m[e.town] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);
const linkList = (links) => `<ul class="explore-links">${links.map((l) => `<li><a href="${l.path}">${esc(l.name)}</a>${l.count ? ` <span>${l.count}</span>` : ""}</li>`).join("")}</ul>`;
const townPages = new Set();     // filled in by the full build; the sample build links only to pages it makes
const topicLinks = (items, suffix = "") => TOPICS.map((t) => ({ t, n: items.filter(t.test).length })).filter((x) => x.n)
  .map((x) => ({ name: `${x.t.name}${suffix}`, tag: x.t.tag, short: x.t.short, path: `/${x.t.slug}/`, count: x.n }));

// ---------- page builders ----------
function regionPage(id) {
  const r = REGIONS[id], items = listings.filter((e) => e.area === id);
  const tw = towns(items).filter(([t]) => townPages.has(t));
  const free = items.filter((e) => e.price === 0).length;
  const body = `
      <p class="lede">${esc(r.intro)}</p>
      <p class="seo-facts">${plural(items.length, "listing", "listings")} right now${free ? `, ${free} of them free` : ""}, all checked against the host's own website. <a href="/#/day/${id}">Browse ${esc(r.name)} by day in Good Nearby →</a></p>
      ${tw.length ? `<h2 class="seo-h2">Towns in ${esc(r.name)}</h2>${linkList(tw.map(([t, n]) => ({ name: `${t}, MA`, path: `/towns/${townSlug(t)}/`, count: n })))}` : ""}
      <h2 class="seo-h2">By what you're in the mood for</h2>${linkList(topicLinks(items))}
      ${sections(items, { more: `<a href="/#/day/${id}">See them all in Good Nearby</a>.` })}
      <h2 class="seo-h2">Other areas</h2>${linkList(Object.keys(REGIONS).filter((k) => k !== id).map((k) => ({ name: REGIONS[k].name, path: `/${REGIONS[k].slug}/` })))}`;
  const cats = topicLinks(items).sort((a, b) => b.count - a.count).slice(0, 3).map((l) => l.short);
  return page({
    path: `/${r.slug}/`,
    title: `Wellness & Feel-Good Things to Do in ${r.name}, MA | Good Nearby`,
    description: clip(`Calm things to do in ${r.name}, MA: ${cats.join(", ")} and more${free ? `, many of them free` : ""}. With dates, prices and directions.`, 158),
    h1: `Feel-good things to do in ${r.name}`, eyebrow: "Massachusetts",
    crumbs: [home, { name: r.name, path: `/${r.slug}/` }], body,
  });
}

function townPage(town) {
  const items = listings.filter((e) => e.town === town);
  const area = items[0].area, r = REGIONS[area];
  const tl = topicLinks(items).sort((a, b) => b.count - a.count);
  const kinds = tl.slice(0, 3).map((l) => l.tag.toLowerCase());
  const highlights = items.filter((e) => !e.sessions).slice(0, 3).map((e) => e.title);
  const generated = `${town} has ${plural(items.length, "good thing", "good things")} listed on Good Nearby right now, including ${listJoin(kinds)}${highlights.length ? `. Regulars include ${listJoin(highlights)}` : ""}.`;
  const nearby = ALL_TOWNS.filter((t) => t.areaId === area && t.name !== town && townPages.has(t.name));
  const body = `
      <p class="lede">${esc(TOWN_NOTES[town] || generated)}</p>
      ${TOWN_NOTES[town] ? `<p class="seo-facts">${esc(generated)}</p>` : ""}
      <p class="seo-facts"><a href="/#/day/${area}">Browse ${esc(r.name)} by day in Good Nearby →</a></p>
      ${sections(items, { showTown: false })}
      <h2 class="seo-h2">More in ${esc(r.name)}</h2>${linkList([{ name: `All of ${r.name}`, path: `/${r.slug}/` }, ...nearby.map((t) => ({ name: `${t.name}, MA`, path: `/towns/${townSlug(t.name)}/` }))])}
      <h2 class="seo-h2">By topic</h2>${linkList(tl)}`;
  return page({
    path: `/towns/${townSlug(town)}/`,
    title: `Things to Do in ${town}, MA: ${tl.slice(0, 2).map((l) => l.tag).join(", ")} and More | Good Nearby`,
    description: clip(`Feel-good things to do in ${town}, Massachusetts: ${listJoin(kinds)}. Dates, prices, directions and links to each host.`, 158),
    h1: `Feel-good things to do in ${town}, MA`, eyebrow: r.name,
    crumbs: [home, regionCrumb(area), { name: `${town}, MA`, path: `/towns/${townSlug(town)}/` }], body,
  });
}

function topicPage(t) {
  const items = listings.filter(t.test);
  const byArea = Object.keys(REGIONS).map((id) => ({ id, list: items.filter((e) => e.area === id) })).filter((x) => x.list.length);
  const tw = towns(items).slice(0, 8).map(([x]) => x);
  const body = `
      <p class="lede">${esc(t.intro)}</p>
      <p class="seo-facts">${plural(items.length, "listing", "listings")} across ${listJoin(byArea.map((x) => REGIONS[x.id].name))}, in ${listJoin(tw)}${towns(items).length > tw.length ? " and more" : ""}. <a href="${t.app}">Find ${esc(t.short)} near you in Good Nearby →</a></p>
      ${byArea.map((x) => `<h2 class="seo-h2">${esc(t.name)}: ${esc(REGIONS[x.id].name)}</h2>${sections(x.list, { limit: 12 })}`).join("")}
      <h2 class="seo-h2">Other things that feel good</h2>${linkList(TOPICS.filter((o) => o !== t && listings.some(o.test)).map((o) => ({ name: o.name, path: `/${o.slug}/` })))}`;
  return page({
    path: `/${t.slug}/`,
    title: `${t.name} near Boston, MetroWest & the South Shore | Good Nearby`,
    description: clip(`${t.name} in ${tw.slice(0, 4).join(", ")} and nearby towns in Massachusetts. Upcoming dates, prices and directions for each one.`, 158),
    h1: `${t.name} near you`, eyebrow: "Greater Boston · MetroWest · South Shore",
    crumbs: [home, { name: t.name, path: `/${t.slug}/` }], body,
  });
}

// Event structured data only for single events with an exact date, time, place and host page.
function eventLd(e) {
  if (!e.next || e.series || e.allDay || !e.address || !e.venue) return null;
  const s = e.next;
  const ld = {
    "@context": "https://schema.org", "@type": "Event", name: e.title,
    startDate: isoLocal(s.start),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: e.venue.split(" · ")[0], address: { "@type": "PostalAddress", streetAddress: e.address, addressLocality: e.town, addressRegion: state(e), addressCountry: "US" },
      ...(e.lat != null ? { geo: { "@type": "GeoCoordinates", latitude: e.lat, longitude: e.lng } } : {}) },
    organizer: { "@type": "Organization", name: e.venue.split(" · ")[0], url: new URL(e.url).origin },
    url: e.url,
  };
  if (e.hasEnd !== false && s.end > s.start) ld.endDate = isoLocal(s.end);
  if (e.description) ld.description = e.description;
  if (typeof e.price === "number") ld.offers = { "@type": "Offer", price: e.price, priceCurrency: "USD", url: e.url };
  return ld;
}

function listingPage(e) {
  const r = REGIONS[e.area], topic = TOPICS.find((t) => t.test(e));
  const where = [e.venue, e.address, `${e.town}, ${state(e)}`].filter(Boolean);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where.join(", "))}`;
  let when;
  if (e.repeat) when = `${e.repeat}, ${span(e.next)}<br><span class="sub">Next: ${longDay(e.next.start)}</span>`;
  else if (e.next) when = e.allDay ? longDay(e.next.start) : `${longDay(e.next.start)}<br><span class="sub">${e.hasEnd ? span(e.next) : timeText(e.next.start)}</span>`;
  else when = esc(e.schedule || "Open most days — check the host's page for hours");
  const DK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], DN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = e.hours ? `<table class="hours">${DK.map((k, i) => `<tr><th>${DN[i]}</th><td>${e.hours[k] ? e.hours[k].split("-").map((t) => timeText(parseLocal(`2026-01-01T${t}`))).join("–") : "Closed"}</td></tr>`).join("")}</table>` : "";
  const tags = [e.price === 0 && "Free", (e.tags || []).includes("come-alone") && "Easy to go solo", (e.tags || []).includes("beginner") && "Beginner-friendly"].filter(Boolean);
  const facts = [
    ["When", when],
    ["Where", `${where.map(esc).join("<br>")}<br><a href="${maps}" target="_blank" rel="noopener">Directions</a>`],
    priceText(e) || e.priceNote ? ["Price", esc([priceText(e), e.priceNote].filter(Boolean).join(" · "))] : null,
    e.host && e.host !== e.venue ? ["Host", esc(e.host)] : null,
    e.trail && e.miles ? ["Trail", esc(`${e.miles} miles${e.surface ? ` · ${e.surface}` : ""}`)] : null,
    e.phone ? ["Phone", `<a href="tel:${esc(e.phone.replace(/[^\d+]/g, ""))}">${esc(e.phone)}</a>`] : null,
  ].filter(Boolean);
  const sameTown = listings.filter((x) => x.id !== e.id && x.town === e.town).slice(0, 4);
  const sameTopic = topic ? listings.filter((x) => x.id !== e.id && x.area === e.area && topic.test(x) && x.town !== e.town).slice(0, 4) : [];
  const body = `
      ${e.description ? `<p class="lede">${esc(e.description)}</p>` : ""}
      ${CARE.includes(e.category) ? `<p class="care-note">For relaxation, not medical treatment. Check with your doctor if you have a health condition.</p>` : ""}
      ${tags.length ? `<p class="row-tags">${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join(" ")}</p>` : ""}
      <dl class="seo-facts-list">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
      ${hours}
      <div class="seo-actions">
        <a class="btn btn-dark" href="${esc(e.url)}" target="_blank" rel="noopener">${e.sessions ? "Details & sign-up on the host's site" : "Visit their website"} ↗</a>
        <a class="btn btn-soft" href="/#/e/${encodeURIComponent(e.id)}">Save it or add it to your calendar</a>
      </div>
      <p class="hint-static">Details come from the host's own website. Things can change, so check with them before you go.</p>
      ${sameTown.length && townPages.has(e.town) ? `<h2 class="seo-h2">More in ${esc(e.town)}</h2><ul class="rows">${sameTown.map((x) => row(x, false)).join("")}</ul><p class="seo-facts"><a href="/towns/${townSlug(e.town)}/">Everything in ${esc(e.town)}, MA →</a></p>` : ""}
      ${topic && sameTopic.length ? `<h2 class="seo-h2">More ${esc(topic.short)} in ${esc(r.name)}</h2><ul class="rows">${sameTopic.map((x) => row(x)).join("")}</ul>` : ""}
      ${topic ? `<p class="seo-facts"><a href="/${topic.slug}/">All ${esc(topic.short)} →</a> · <a href="/${r.slug}/">Everything in ${esc(r.name)} →</a></p>` : ""}`;
  const whenDesc = e.repeat ? `${e.repeat}, ${span(e.next)}` : e.next ? `${longDay(e.next.start)}${e.allDay ? "" : `, ${e.hasEnd ? span(e.next) : timeText(e.next.start)}`}` : e.schedule || "";
  const desc = [whenDesc ? `${whenDesc} at ${e.venue || e.title} in ${e.town}, ${state(e)}.` : `${e.venue || e.title} in ${e.town}, ${state(e)}.`, priceText(e) ? `${priceText(e)}.` : "", e.description || ""].filter(Boolean).join(" ");
  const dateBit = e.next && !e.repeat ? ` · ${fmt(e.next.start, { month: "short", day: "numeric" })}` : "";
  const place = ` · ${e.town}, ${state(e)}${dateBit}`;
  let title = `${e.title}${place} | Good Nearby`;
  if (title.length > 70) title = `${clip(e.title, 80 - place.length)}${place}`;
  const ev = eventLd(e);
  const crumbs = [home, regionCrumb(e.area), ...(townPages.has(e.town) ? [{ name: `${e.town}, MA`, path: `/towns/${townSlug(e.town)}/` }] : []), { name: e.title, path: urls.get(e.id) }];
  return page({ path: urls.get(e.id), title, description: clip(desc, 158), h1: e.title,
    eyebrow: `${LABEL[e.category] || e.category} · ${e.town}, ${state(e)}`, crumbs, body, jsonld: ev ? [ev] : [] });
}

// ---------- write ----------
function write(p, html) {
  const file = path.join(ROOT, p, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return p;
}

if (SAMPLE) {
  ["Franklin"].forEach((t) => townPages.add(t));
  const ev = listings.find((e) => e.id === "acupunkture-winter-solstice");
  const out = [
    write(`/${REGIONS.metrowest.slug}/`, regionPage("metrowest")),
    write(`/towns/${townSlug("Franklin")}/`, townPage("Franklin")),
    write("/sound-baths/", topicPage(TOPICS.find((t) => t.slug === "sound-baths"))),
    write(urls.get(ev.id), listingPage(ev)),
  ];
  console.log(`Sample pages:\n${out.map((p) => `  ${SITE}${p}`).join("\n")}`);
}
