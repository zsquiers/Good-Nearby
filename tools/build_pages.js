// Builds plain HTML pages that Google can read: regions, towns, topics and (stage 2) one page per listing.
// The app itself (index.html + app.js) keeps working exactly as before; these pages share its styles
// and link into it. Run it whenever data/*.js changes:
//
//   node tools/build_pages.js           build pages, the "Explore" links on the home page and sitemap.xml
//   node tools/build_pages.js --stats   just print what would be built
//   node tools/check_pages.js           then check every page (titles, links, structured data, sitemap)
//
// Only verified listings are used: Eventbrite and Meetup listings are left out (collection from those
// sites is paused), and so is anything without a town or a link to the host's own page.
//
// Expired listings (stage 2): a listing page that has ended is kept for 180 days as a "this has passed"
// page that points to what's coming up instead (not indexed, not in the sitemap), then removed. Hub pages
// only ever show what's still ahead, and a tiny script hides anything that ends between rebuilds.
"use strict";
process.env.TZ = "America/New_York";
const fs = require("fs");
const path = require("path");

const BUILD = {
  listingPages: process.env.LISTING_PAGES === "1",  // stage 2 turns this on for good: one page per place, class and event
  keepPassedDays: 180,       // how long a passed listing keeps its "this has passed" page
  minTownListings: 5,        // a town gets its own page with at least this many listings
  minTopicListings: 5,
};

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://findgoodnearby.com";
const STATE_FILE = path.join(ROOT, "sources", "pages-state.json");
const NOW = process.env.BUILD_DATE ? new Date(`${process.env.BUILD_DATE}T08:00`) : new Date();

// ---------- data ----------
global.window = {};
for (const f of fs.readdirSync(path.join(ROOT, "data")).filter((f) => f.endsWith(".js")).sort()) require(path.join(ROOT, "data", f));
const AREAS = window.GOOD_NEARBY_TOWNS;
const ALL_TOWNS = AREAS.flatMap((a) => a.towns.map((t) => ({ ...t, areaId: a.id })));
const INDEX_HTML = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const STYLE_V = (INDEX_HTML.match(/styles\.css\?v=(\d+)/) || [])[1] || "1";
const SUN = (INDEX_HTML.match(/<svg class="brand-mark"[\s\S]*?<\/svg>/) || [""])[0];

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
const longDay = (d) => fmt(d, { weekday: "long", month: "long", day: "numeric" });
const shortDay = (d) => fmt(d, { month: "short", day: "numeric" });
// "2026-12-20T18:30:00-05:00": local time with Boston's offset, for structured data and the expiry script
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
    out.seriesEnd = parseLocal(e.end);
    out.schedule = `Several dates through ${fmt(out.seriesEnd, { month: "long", day: "numeric" })}`;
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
const stateOf = (e) => ((e.city || "").match(/, (MA|RI)$/) || [, "MA"])[1];
function areaOf(e) {
  const n = townName(e).toLowerCase();
  const t = ALL_TOWNS.find((x) => x.name.toLowerCase() === n || (x.aliases || []).some((a) => a.toLowerCase() === n));
  if (t) return t.areaId;
  if (e.lat == null) return null;
  let best = null, bestMi = Infinity;
  for (const x of ALL_TOWNS) { const mi = miles(e, x); if (mi < bestMi) { best = x; bestMi = mi; } }
  return best && bestMi <= 15 ? best.areaId : null;
}

const listings = (window.GOOD_NEARBY_EVENTS || [])
  .filter((e) => !/eventbrite|meetup/i.test(`${e.source || ""} ${e.url || ""}`))
  .filter((e) => e.city && e.url && e.title)
  .map(normalize).filter(Boolean)
  .map((e) => ({ ...e, area: areaOf(e), town: townName(e), st: stateOf(e) }))
  .filter((e) => e.area);

// ---------- topics & regions ----------
const CARE = ["massage", "reiki", "acupuncture", "herbal", "breathwork", "salt", "sound"];
const LABEL = {
  yoga: "Yoga", meditation: "Meditation", sound: "Sound bath", massage: "Massage", reiki: "Reiki & energy", "tai-chi": "Tai chi",
  breathwork: "Breathwork", workshop: "Workshop", expo: "Expo & fair", acupuncture: "Acupuncture", salt: "Salt cave", run: "Community run",
  walk: "Walk", trail: "Trail & path", hike: "Hike", movement: "Movement & dance", shop: "Holistic shop", cafe: "Cozy café",
  craft: "Creative class", herbal: "Herbal & plant class", book: "Book group", bakery: "Cozy bakery",
};
// Each intro says only what's true of every listing type it covers; the numbers come from the data.
const TOPICS = [
  { slug: "sound-baths", name: "Sound baths", tag: "Sound Baths", short: "sound baths", app: "/#/m/calm",
    test: (e) => e.category === "sound" || /sound bath|sound healing|singing bowl|gong/i.test(e.title),
    intro: "At a sound bath you lie down, close your eyes and listen while singing bowls, gongs, drums or gentle music fill the room. No experience is needed. Some here are paired with yoga, acupuncture or reiki, and some are drum circles you join in on." },
  { slug: "yoga", name: "Yoga", tag: "Yoga", short: "yoga classes", app: "/#/m/move", test: (e) => e.category === "yoga",
    intro: "Studio classes, weekly community yoga and special series, from restorative and yin to vinyasa flow. If you're new, look for listings marked beginner-friendly." },
  { slug: "meditation", name: "Meditation & mindfulness", tag: "Meditation", short: "meditation groups", app: "/#/m/calm", test: (e) => ["meditation", "breathwork"].includes(e.category),
    intro: "Sitting groups, guided meditations and mindfulness evenings where you can simply show up and be quiet with other people." },
  { slug: "reiki-massage-acupuncture", name: "Reiki, massage & acupuncture", tag: "Reiki & Massage", short: "reiki, massage and acupuncture", app: "/#/m/care",
    test: (e) => ["reiki", "massage", "acupuncture"].includes(e.category),
    intro: "Places to be cared for: massage, reiki and acupuncture by appointment, plus group sessions that pair them with meditation or sound. Listed for relaxation, not medical treatment. Check with your doctor first if you have a health condition." },
  { slug: "salt-caves", name: "Salt caves", tag: "Salt Caves", short: "salt caves", app: "/#/m/calm", test: (e) => e.category === "salt",
    intro: "Salt caves and salt rooms are quiet, dim spaces lined with salt where you sit back and rest. Some also hold yoga or sound sessions inside the cave." },
  { slug: "creative-classes", name: "Creative classes", tag: "Creative Classes", short: "creative classes", app: "/#/m/make", test: (e) => ["craft", "herbal"].includes(e.category),
    intro: "Hands-on classes where you make something: pottery, painting, fiber arts, flowers, cooking and herbal crafts, at studios, museums and local libraries." },
  { slug: "book-groups", name: "Book groups", tag: "Book Groups", short: "book groups", app: "/#/m/people", test: (e) => e.category === "book",
    intro: "Book groups that welcome new members, most of them at local libraries. An easy way to meet people with something to talk about from the start." },
  { slug: "trails-and-walks", name: "Trails & walks", tag: "Trails", short: "trails and walks", app: "/#/outside", test: (e) => ["trail", "walk", "hike", "run"].includes(e.category),
    intro: "Rail trails, wildlife sanctuaries, state parks and forests, plus guided walks and community runs. Each listing says what the path is like, so you can pick something easy or something longer." },
  { slug: "cafes-and-bakeries", name: "Cozy cafés & bakeries", tag: "Cafés", short: "cozy cafés and bakeries", app: "/#/wander", test: (e) => ["cafe", "bakery", "shop"].includes(e.category),
    intro: "Independent cafés, bakeries and little shops worth a slow visit. Opening hours are listed where the business publishes them." },
];
const topicOf = (e) => TOPICS.find((t) => t.test(e));

// Hand-written; every place named here is a current listing (checked by tools/check_pages.js).
const REGIONS = {
  "metrowest": { name: "MetroWest", slug: "metrowest", inText: "in MetroWest", inTitle: "in MetroWest, MA", named: ["Common Street Spiritual Center", "Cochituate Rail Trail", "Broadmoor Wildlife Sanctuary"],
    intro: "MetroWest runs west of Boston along Route 9 and the Mass Pike, from Wellesley and Needham out through Natick, Framingham and Sudbury. Natick's Common Street Spiritual Center holds yoga, meditation and sound sessions most days of the week. The Cochituate Rail Trail and Mass Audubon's Broadmoor Wildlife Sanctuary are close by when you'd rather walk, and local libraries host free craft classes and book groups." },
  "franklin-area": { name: "Franklin & nearby", slug: "franklin-area", inText: "in Franklin & nearby towns", inTitle: "in Franklin & Nearby Towns, MA", named: ["SNETT Rail Trail", "Path of Peace Sangha"],
    intro: "Franklin and its neighbors, including Medway, Norfolk, Wrentham, Bellingham, Medfield and Foxborough, mix small-town downtowns with state forests and rail trails. You'll find studio yoga and sound baths, the Path of Peace Sangha's monthly mindfulness evening, cozy bakeries and the long, flat SNETT Rail Trail." },
  "boston-area": { name: "Boston area", slug: "boston-area", inText: "in the Boston area", inTitle: "in the Boston Area", named: ["Mount Auburn Cemetery", "Arnold Arboretum"],
    intro: "In and around Boston, including Cambridge, Somerville and Jamaica Plain, there's something calm going on most days: meditation groups, guided walks at Mount Auburn Cemetery, the Arnold Arboretum's paths, riverside trails and community classes." },
  "south-shore": { name: "South Shore", slug: "south-shore", inText: "on the South Shore", inTitle: "on the South Shore, MA", named: ["JPH at Ferry Hill", "Scituate Salt Cave", "World's End"],
    intro: "From Hingham and Scituate down through Marshfield, Duxbury, Pembroke and Plymouth, the South Shore pairs ocean air with a growing wellness community: JPH at Ferry Hill's mostly free programs in Marshfield, Scituate Salt Cave, restorative yoga series and coastal walks like World's End." },
};
// Hand-written; each names only ongoing listings (places, regular classes, libraries), checked on every build.
const TOWN_NOTES = {
  "Attleboro": { named: ["Oak Knoll Wildlife Sanctuary", "Attleboro Public Library"],
    text: "In Attleboro, Mass Audubon's Oak Knoll Wildlife Sanctuary has free, quiet trails through woods and marsh and around the lake. Downtown, the Attleboro Public Library hosts free book groups, a yarn and fiber arts group and a writing group." },
  "Bellingham": { named: ["Bellingham Public Library"],
    text: "Most of what's on in Bellingham happens at the Bellingham Public Library, and it's free: book discussions, needlecraft nights, chat-and-craft workshops, gentle yoga and the occasional group sound bath." },
  "Boston": { named: ["Charles River Esplanade", "Southwest Corridor Park", "A Sanctuary Café", "Beacon Hill Books"],
    text: "In Boston itself, the good things here lean toward getting outside: walks along the Charles River Esplanade and Southwest Corridor Park, and group runs by the river. For somewhere calm indoors, there's A Sanctuary Café, a cat café, and Beacon Hill Books & Café." },
  "Cambridge": { named: ["Cambridge Zen Center", "Cambridge Insight Meditation Center", "Mount Auburn Cemetery", "Broadsheet Coffee Roasters"],
    text: "Cambridge is one of the easiest places to try meditation for free: Cambridge Zen Center sits every evening, and Cambridge Insight Meditation Center holds drop-in sits on weeknights. Mount Auburn Cemetery runs walking tours and a book club, and Broadsheet Coffee Roasters and bōm dough are good places to linger." },
  "Foxborough": { named: ["Boyden Library", "F. Gilbert Hills State Forest", "The Healing Moon"],
    text: "In Foxborough, the Boyden Library hosts free book clubs and art workshops, F. Gilbert Hills State Forest has wooded trails, and The Healing Moon Wellness Center offers reiki by appointment and candlelit sound baths from time to time." },
  "Framingham": { named: ["Framingham Public Library", "Himalayan Salt Cave", "Callahan State Park", "Saxonville Mills"],
    text: "Framingham Public Library and its McAuliffe Branch keep a full calendar of free book discussions and yarn and craft meetups. For quieter time there's a Himalayan salt cave, the trails at Callahan State Park and Saxonville Mills Café & Roastery." },
  "Franklin": { named: ["Birchwood Bakery & Kitchen", "SNETT Rail Trail", "DelCarte Conservation Area"],
    text: "Downtown Franklin keeps several good things within a few blocks of each other: Birchwood Bakery, an acupuncture studio and holistic boutique on East Central Street, and a yoga studio out on West Central. The SNETT Rail Trail and DelCarte's ponds are a few minutes away when you want to be outside." },
  "Jamaica Plain": { named: ["Jamaica Pond", "Arnold Arboretum", "Ula Café", "Third Cliff Bakery"],
    text: "Jamaica Plain is made for a slow morning: walk the loop around Jamaica Pond or join the free Saturday parkrun, wander the Arnold Arboretum, then warm up at Ula Café or Third Cliff Bakery." },
  "Marshfield": { named: ["JPH at Ferry Hill", "Ventress Memorial Library", "Veronica's Sweetcakes"],
    text: "Marshfield is home to JPH at Ferry Hill, a nonprofit with a full monthly calendar of mostly free wellness programs: meditation, qigong, an open art studio, restorative yoga and more. Ventress Memorial Library hosts book groups, and Veronica's Sweetcakes is in town for something sweet." },
  "Medfield": { named: ["Medfield Rail Trail", "Noon Hill", "Rocky Woods", "Holistic Wellness Center"],
    text: "Medfield is a good town for getting outside: the Medfield Rail Trail, Noon Hill and Rocky Woods are all open daily. The Holistic Wellness Center offers massage, reiki, acupuncture and a salt room by appointment." },
  "Medway": { named: ["Medway Public Library", "Drift + Oak", "The Enchanted Fox"],
    text: "Medway Public Library is the heart of things here, with free fiber arts and sewing meetups and several book groups. Drift + Oak Yoga Studio offers vinyasa, yin and restorative classes, and The Enchanted Fox is a little shop worth a browse." },
  "Natick": { named: ["Common Street Spiritual Center", "Cochituate Rail Trail", "Broadmoor Wildlife Sanctuary", "Charles River Coffee House"],
    text: "Natick's Common Street Spiritual Center has something on nearly every day: gentle yoga, meditation groups, tai chi, dance and a monthly community sound bath. Outside, there's the Cochituate Rail Trail and Mass Audubon's Broadmoor Wildlife Sanctuary, with Charles River Coffee House for afterward." },
  "Norfolk": { named: ["Norfolk Public Library", "Stony Brook Wildlife Sanctuary", "Honey Bean Café"],
    text: "Norfolk Public Library offers free watercolor and fiber art meetups and several book clubs. Mass Audubon's Stony Brook Wildlife Sanctuary has gentle trails and boardwalks, and Honey Bean Café is a cozy stop for coffee." },
  "Pembroke": { named: ["Emerald Yoga Studio"],
    text: "Pembroke's Emerald Yoga Studio is a long-running, beginner-friendly studio with gentle and restorative classes, in person or by livestream, plus special workshop series through the year." },
  "Scituate": { named: ["Scituate Salt Cave"],
    text: "Scituate Salt Cave is the heart of things here: salt cave sessions most days, slow flow yoga inside the cave each week, and occasional workshops and sound sessions." },
  "Wrentham": { named: ["Wrentham State Forest", "Copper City Espresso", "Fiske Public Library"],
    text: "Wrentham pairs the wooded trails of Wrentham State Forest with Copper City Espresso for coffee, and Fiske Public Library runs free craft classes and a book club." },
};

// ---------- which pages exist ----------


const slugify = (s) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70).replace(/-$/, "");
const townSlug = (t) => `${slugify(t)}-ma`;
const townPath = (t) => `/towns/${townSlug(t)}/`;
const regionPath = (id) => `/${REGIONS[id].slug}/`;

// Listing URLs stay the same from build to build (kept in sources/pages-state.json).
const state = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) : { pages: {}, listings: {} };
const urls = new Map();
const used = new Set(Object.values(state.listings).map((x) => x.path));
for (const e of [...listings].sort((a, b) => (a.id < b.id ? -1 : 1))) {
  if (state.listings[e.id]) { urls.set(e.id, state.listings[e.id].path); continue; }
  const dated = e.sessions && !e.repeat;
  let p = dated ? `/events/${slugify(`${e.title} ${e.town}`)}-${ymd(e.next.start)}/` : `/places/${slugify(`${e.title} ${e.town}`)}/`;
  if (used.has(p)) p = p.replace(/\/$/, `-${slugify(e.id).slice(-8)}/`);
  used.add(p); urls.set(e.id, p);
}
// A town or topic gets a page at the minimum count. Once it has one, it keeps it while at least 2 listings
// remain, so pages don't appear and vanish from Google month to month.
const townCount = listings.reduce((m, e) => ((m[e.town] = (m[e.town] || 0) + 1), m), {});
const keeps = (p, n, min) => n >= min || (state.pages[p] && n >= 2);
const townPages = new Set(Object.keys(townCount).filter((t) => t && keeps(townPath(t), townCount[t], BUILD.minTownListings)));
const topicPages = TOPICS.filter((t) => keeps(`/${t.slug}/`, listings.filter(t.test).length, BUILD.minTopicListings));
const listingHref = (e) => (BUILD.listingPages ? urls.get(e.id) : `/#/e/${encodeURIComponent(e.id)}`);

// ---------- HTML helpers ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clip = (s, n) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, "").replace(/[,.;:]$/, "")}…`);
const priceText = (e) => (e.price === 0 ? "Free" : typeof e.price === "number" ? `$${e.price}` : "");
// Page titles end in "| Good Nearby" when there's room (Google shows about 60–70 characters).
// A description of up to 158 characters: optional sentences are added only while they fit.
const fit = (base, ...more) => more.reduce((d, m) => (`${d} ${m}`.length <= 158 ? `${d} ${m}` : d), clip(base, 158));
const brand = (t) => (t.length + 14 <= 72 ? `${t} | Good Nearby` : t);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const listJoin = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
const byTown = (items) => Object.entries(items.reduce((m, e) => ((m[e.town] = (m[e.town] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
const linkList = (links) => `<ul class="explore-links">${links.map((l) => `<li><a href="${l.path}">${esc(l.name)}</a>${l.count ? ` <span>${l.count}</span>` : ""}</li>`).join("")}</ul>`;
const topicLinks = (items) => topicPages.map((t) => ({ t, n: items.filter(t.test).length })).filter((x) => x.n)
  .map((x) => ({ name: x.t.name, tag: x.t.tag, short: x.t.short, path: `/${x.t.slug}/`, count: x.n }));

function ongoing(e) {
  const s = e.schedule || "";
  if (e.series) return `Series<span class="sub">see dates</span>`;
  if (/appointment|appt/i.test(s)) return `By appt.<span class="sub">book ahead</span>`;
  if (e.hours || /daily|dawn|every day/i.test(s)) return `Open<span class="sub">most days</span>`;
  return `Ongoing<span class="sub">see times</span>`;
}
// One listing in a list. Dated rows carry their end time so the page can hide them once they're over.
function row(e, showTown = true) {
  const meta = [e.venue && e.venue !== e.title && !e.title.startsWith(e.venue) ? e.venue.split(" · ")[0] : "", showTown ? e.town : "", priceText(e)].filter(Boolean).map(esc).join(" · ");
  const time = e.next && !e.repeat ? `${shortDay(e.next.start)}<span class="sub">${e.allDay ? "All day" : timeText(e.next.start)}</span>`
    : e.weekly ? `Weekly<span class="sub">${esc(e.weekly.day.slice(0, 3))}s</span>`
    : e.monthly ? `Monthly<span class="sub">${["1st", "2nd", "3rd", "4th", "5th"][e.monthly.week - 1]} ${esc(e.monthly.day.slice(0, 3))}</span>` : ongoing(e);
  const end = e.next && !e.repeat ? e.next.end : e.series ? e.seriesEnd : null;
  return `<li${end ? ` data-end="${isoLocal(end)}"` : ""}><a class="row" href="${listingHref(e)}">
      <span class="row-time small">${time}</span>
      <span class="row-main"><span class="row-title">${esc(e.title)}</span><span class="row-meta">${meta}</span><span class="row-cat">${esc(LABEL[e.category] || e.category)}</span></span>
      <span class="row-arrow" aria-hidden="true">›</span></a></li>`;
}
function sections(items, opts = {}) {
  const limit = opts.limit || 24;
  const dated = items.filter((e) => e.next && !e.repeat).sort((a, b) => a.next.start - b.next.start);
  const regular = items.filter((e) => e.repeat).sort((a, b) => a.next.start - b.next.start);
  const open = items.filter((e) => !e.sessions).sort((a, b) => a.title.localeCompare(b.title));
  const block = (title, list) => list.length ? `<section class="slot"><h3>${title}<span>${list.length}</span></h3><ul class="rows">${list.slice(0, limit).map((e) => row(e, opts.showTown !== false)).join("")}</ul>${list.length > limit ? `<p class="hint-static">Showing the first ${limit} of ${list.length}.${opts.more ? ` ${opts.more}` : ""}</p>` : ""}</section>` : "";
  return block("Coming up", dated) + block("Every week or month", regular) + block("Places & ongoing classes", open);
}
// Hides rows (and a whole section) once their date has passed, between rebuilds. Google reads the rebuilt page.
const EXPIRY_JS = `<script>(function(){var n=Date.now();document.querySelectorAll("[data-end]").forEach(function(el){if(Date.parse(el.getAttribute("data-end"))<n)el.hidden=true});document.querySelectorAll(".slot").forEach(function(s){if(!s.querySelector("li:not([hidden])"))s.hidden=true});var p=document.getElementById("passedNote");if(p&&Date.parse(p.getAttribute("data-after"))<n)p.hidden=false})();</script>`;

function page({ path: p, title, description, h1, eyebrow, crumbs, body, jsonld = [], noindex = false }) {
  const url = SITE + p;
  const crumbLd = crumbs.length > 1 ? [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: SITE + c.path })) }] : [];
  const ld = [...crumbLd, ...jsonld].map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n  ");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="only light" />
  <meta name="darkreader-lock" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />${noindex ? `\n  <meta name="robots" content="noindex, follow" />` : `\n  <link rel="canonical" href="${url}" />`}
  <meta property="og:type" content="website" />
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
    ${crumbs.length > 1 ? `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map((c, i) => i === crumbs.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${c.path}">${esc(c.name)}</a></li>`).join("")}</ol></nav>` : ""}
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
    ${exploreNav()}
    <p class="fine">We don't run these events, and details can change, so check with the host before you go. Listings are for information only and aren't medical advice.</p>
  </footer>
  ${EXPIRY_JS}
</body>
</html>
`;
}
// The quiet "Explore" line shared by the footer of every page (and the home page).
function exploreNav() {
  const regions = Object.keys(REGIONS).map((id) => `<a href="${regionPath(id)}">${esc(REGIONS[id].name)}</a>`);
  const topics = topicPages.map((t) => `<a href="/${t.slug}/">${esc(t.name)}</a>`);
  return `<details class="explore"><summary>Explore by area &amp; topic</summary><nav aria-label="Explore Good Nearby">${[...regions, ...topics].join(' <span class="sep" aria-hidden="true">·</span> ')}</nav></details>`;
}

const home = { name: "Home", path: "/" };

// ---------- regions ----------
function regionPage(id) {
  const r = REGIONS[id], items = listings.filter((e) => e.area === id);
  const tw = byTown(items).filter(([t]) => townPages.has(t));
  const free = items.filter((e) => e.price === 0).length;
  const cats = topicLinks(items).sort((a, b) => b.count - a.count).slice(0, 3).map((l) => l.short);
  const body = `
      <p class="lede">${esc(r.intro)}</p>
      <p class="seo-facts">${plural(items.length, "listing", "listings")} here right now${free ? `, ${free} of them free` : ""}. <a href="/#/day/${id}">Browse ${esc(r.name)} by day in Good Nearby →</a></p>
      ${tw.length ? `<h2 class="seo-h2">Towns in ${esc(r.name)}</h2>${linkList(tw.map(([t, n]) => ({ name: `${t}, MA`, path: townPath(t), count: n })))}` : ""}
      <h2 class="seo-h2">By what you're in the mood for</h2>${linkList(topicLinks(items))}
      ${sections(items, { more: `<a href="/#/day/${id}">See everything in Good Nearby</a>.` })}
      <h2 class="seo-h2">Other areas</h2>${linkList(Object.keys(REGIONS).filter((k) => k !== id).map((k) => ({ name: REGIONS[k].name, path: regionPath(k) })))}`;
  return page({
    path: regionPath(id),
    title: brand(`Wellness & Feel-Good Things to Do ${r.inTitle}`),
    description: fit(`Calm things to do ${r.inText}, Massachusetts: ${cats.join(", ")} and more${free ? `, many of them free` : ""}.`, "With dates, prices and directions."),
    h1: `Feel-good things to do ${r.inText}`, eyebrow: "Massachusetts",
    crumbs: [home, { name: r.name, path: regionPath(id) }], body,
  });
}

// ---------- towns ----------
function townPage(town) {
  const items = listings.filter((e) => e.town === town);
  const area = items[0].area, r = REGIONS[area];
  const tl = topicLinks(items).sort((a, b) => b.count - a.count);
  const kinds = tl.slice(0, 3).map((l) => l.tag.toLowerCase());
  const regulars = items.filter((e) => !e.sessions || e.repeat).slice(0, 3).map((e) => e.title);
  const upcoming = items.filter((e) => e.next && !e.repeat).length;
  const summary = `${plural(items.length, "listing", "listings")} in ${town} right now${upcoming ? `, ${upcoming} with a date coming up` : ""}${regulars.length ? `. Regulars include ${listJoin(regulars)}` : ""}.`;
  const note = TOWN_NOTES[town];
  const nearby = ALL_TOWNS.filter((t) => t.areaId === area && t.name !== town && townPages.has(t.name));
  const body = `
      ${note ? `<p class="lede">${esc(note.text)}</p>` : ""}
      <p class="${note ? "seo-facts" : "lede"}">${esc(summary)}</p>
      <p class="seo-facts"><a href="/#/day/${area}">Browse ${esc(r.name)} by day in Good Nearby →</a></p>
      ${sections(items, { showTown: false })}
      <h2 class="seo-h2">More in ${esc(r.name)}</h2>${linkList([{ name: `All of ${r.name}`, path: regionPath(area) }, ...nearby.map((t) => ({ name: `${t.name}, MA`, path: townPath(t.name) }))])}
      ${tl.length ? `<h2 class="seo-h2">By topic, everywhere</h2>${linkList(tl.map((l) => ({ ...l, count: 0 })))}` : ""}`;
  return page({
    path: townPath(town),
    title: brand(`Things to Do in ${town}, MA${tl.length ? `: ${tl.slice(0, 2).map((l) => l.tag).join(", ")} and More` : ""}`),
    description: fit(`Feel-good things to do in ${town}, Massachusetts${kinds.length ? `: ${listJoin(kinds)}` : ""}.`, "Dates, prices, directions and links to each host."),
    h1: `Feel-good things to do in ${town}, MA`, eyebrow: r.name,
    crumbs: [home, { name: r.name, path: regionPath(area) }, { name: `${town}, MA`, path: townPath(town) }], body,
  });
}

// ---------- topics ----------
function topicPage(t) {
  const items = listings.filter(t.test);
  const byArea = Object.keys(REGIONS).map((id) => ({ id, list: items.filter((e) => e.area === id) })).filter((x) => x.list.length);
  const tw = byTown(items).map(([x]) => x);
  const free = items.filter((e) => e.price === 0).length;
  const body = `
      <p class="lede">${esc(t.intro)}</p>
      <p class="seo-facts">${plural(items.length, "listing", "listings")} in ${listJoin(tw.slice(0, 6))}${tw.length > 6 ? ` and ${tw.length - 6} more towns` : ""}${free ? `. ${free} ${free === 1 ? "is" : "are"} free` : ""}. <a href="${t.app}">Find ${esc(t.short)} near you in Good Nearby →</a></p>
      ${byArea.map((x) => `<h2 class="seo-h2">${esc(t.name)} ${esc(REGIONS[x.id].inText)}</h2>${sections(x.list, { limit: 12, more: `<a href="${regionPath(x.id)}">More in ${esc(REGIONS[x.id].name)}</a>.` })}`).join("")}
      <h2 class="seo-h2">Other things that feel good</h2>${linkList(topicPages.filter((o) => o !== t).map((o) => ({ name: o.name, path: `/${o.slug}/` })))}`;
  return page({
    path: `/${t.slug}/`,
    title: brand(`${t.name} near Boston, MetroWest & the South Shore`),
    description: fit(`${t.name} in ${tw.slice(0, 4).join(", ")} and nearby towns in Massachusetts.`, "Upcoming dates, prices and directions for each one."),
    h1: `${t.name} near you`, eyebrow: "Greater Boston · MetroWest · South Shore",
    crumbs: [home, { name: t.name, path: `/${t.slug}/` }], body,
  });
}

// ---------- listings (stage 2) ----------
// Event structured data only for single events with an exact date, start time, street address and host page.
function eventLd(e) {
  if (!e.next || e.series || e.allDay || !e.address || !e.venue) return null;
  const s = e.next, venue = e.venue.split(" · ")[0];
  const ld = {
    "@context": "https://schema.org", "@type": "Event", name: e.title, startDate: isoLocal(s.start),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: venue, address: { "@type": "PostalAddress", streetAddress: e.address, addressLocality: e.town, addressRegion: e.st, addressCountry: "US" },
      ...(e.lat != null ? { geo: { "@type": "GeoCoordinates", latitude: e.lat, longitude: e.lng } } : {}) },
    organizer: { "@type": "Organization", name: venue, url: new URL(e.url).origin },
    url: e.url,
  };
  if (e.hasEnd !== false && s.end > s.start) ld.endDate = isoLocal(s.end);
  if (e.description) ld.description = e.description;
  if (typeof e.price === "number") ld.offers = { "@type": "Offer", price: e.price, priceCurrency: "USD", url: e.url };
  return ld;
}
function crumbsFor(x, title, p) {
  return [home, { name: REGIONS[x.area].name, path: regionPath(x.area) }, ...(townPages.has(x.town) ? [{ name: `${x.town}, MA`, path: townPath(x.town) }] : []), { name: title, path: p }];
}
function listingPage(e) {
  const r = REGIONS[e.area], topic = topicOf(e), p = urls.get(e.id);
  const venue = e.venue ? e.venue.split(" · ")[0] : "";
  const where = [e.venue, e.address, `${e.town}, ${e.st}`].filter(Boolean);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venue, e.address, `${e.town}, ${e.st}`].filter(Boolean).join(", "))}`;
  let when;
  if (e.repeat) when = `${e.repeat}, ${span(e.next)}<br><span class="sub">Next: ${longDay(e.next.start)}</span>`;
  else if (e.next) when = e.allDay ? longDay(e.next.start) : `${longDay(e.next.start)}<br><span class="sub">${e.hasEnd ? span(e.next) : timeText(e.next.start)}</span>`;
  else when = esc(e.schedule || "Check the host's page for times");
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
  const passedAfter = e.next && !e.repeat ? e.next.end : null;
  const body = `
      ${passedAfter ? `<p class="saved-note" id="passedNote" data-after="${isoLocal(passedAfter)}" hidden>This took place on ${esc(longDay(e.next.start))}. See what's coming up below.</p>` : ""}
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
      ${sameTown.length ? `<h2 class="seo-h2">More in ${esc(e.town)}</h2><ul class="rows">${sameTown.map((x) => row(x, false)).join("")}</ul>${townPages.has(e.town) ? `<p class="seo-facts"><a href="${townPath(e.town)}">Everything in ${esc(e.town)}, MA →</a></p>` : ""}` : ""}
      ${topic && sameTopic.length ? `<h2 class="seo-h2">More ${esc(topic.short)} in ${esc(r.name)}</h2><ul class="rows">${sameTopic.map((x) => row(x)).join("")}</ul>` : ""}
      <p class="seo-facts">${topic && topicPages.includes(topic) ? `<a href="/${topic.slug}/">All ${esc(topic.short)} →</a> · ` : ""}<a href="${regionPath(e.area)}">Everything in ${esc(r.name)} →</a></p>`;
  const whenDesc = e.repeat ? `${e.repeat}, ${span(e.next)}` : e.next ? `${longDay(e.next.start)}${e.allDay ? "" : `, ${e.hasEnd ? span(e.next) : timeText(e.next.start)}`}` : e.schedule || "";
  const at = venue && venue !== e.title ? ` at ${venue}` : "";
  const desc = [whenDesc ? `${whenDesc}${at} in ${e.town}, ${e.st}.` : `${venue || e.title} in ${e.town}, ${e.st}.`, priceText(e) ? `${priceText(e)}.` : "", e.description || ""].filter(Boolean).join(" ");
  const dateBit = e.next && !e.repeat ? ` · ${shortDay(e.next.start)}` : "";
  const placeBit = ` · ${e.town}, ${e.st}${dateBit}`;
  let title = `${e.title}${placeBit} | Good Nearby`;
  if (title.length > 70) title = `${clip(e.title, 80 - placeBit.length)}${placeBit}`;
  const ev = eventLd(e);
  return page({ path: p, title, description: clip(desc, 158), h1: e.title, eyebrow: `${LABEL[e.category] || e.category} · ${e.town}, ${e.st}`,
    crumbs: crumbsFor(e, e.title, p), body, jsonld: ev ? [ev] : [] });
}
// A listing that has ended or was removed: kept (not indexed) so old links still help people.
function passedPage(x) {
  const r = REGIONS[x.area], topic = TOPICS.find((t) => t.slug === x.topic);
  const similar = listings.filter((e) => e.area === x.area && (!topic || topic.test(e))).sort((a, b) => (a.next ? a.next.start : Infinity) - (b.next ? b.next.start : Infinity)).slice(0, 6);
  const line = x.kind === "event" ? `This took place on ${longDay(parseLocal(x.lastDate))}${x.venue ? ` at ${x.venue}` : ""} in ${x.town}.` : `${x.title} is no longer listed on Good Nearby. It may have closed or stopped posting its schedule.`;
  const body = `
      <p class="saved-note">${esc(line)}</p>
      ${similar.length ? `<h2 class="seo-h2">${topic ? `Coming up: ${esc(topic.short)}` : "Coming up"} in ${esc(r.name)}</h2><ul class="rows">${similar.map((e) => row(e)).join("")}</ul>` : ""}
      <p class="seo-facts">${townPages.has(x.town) ? `<a href="${townPath(x.town)}">Everything in ${esc(x.town)}, MA →</a> · ` : ""}${topic && topicPages.includes(topic) ? `<a href="/${topic.slug}/">All ${esc(topic.short)} →</a> · ` : ""}<a href="${regionPath(x.area)}">Everything in ${esc(r.name)} →</a></p>`;
  return page({ path: x.path, title: `${x.title} (past) · ${x.town}, MA | Good Nearby`, description: clip(`${line} Here's what's coming up nearby instead.`, 158),
    h1: x.title, eyebrow: x.kind === "event" ? "This has passed" : "No longer listed", crumbs: crumbsFor(x, x.title, x.path), body, noindex: true });
}

// ---------- 404 ----------
function notFoundPage() {
  const body = `
      <p class="lede">That page isn't here. It may have been an event that has passed. Here are good places to start:</p>
      <h2 class="seo-h2">By area</h2>${linkList(Object.keys(REGIONS).map((id) => ({ name: REGIONS[id].name, path: regionPath(id) })))}
      <h2 class="seo-h2">By what you're in the mood for</h2>${linkList(topicPages.map((t) => ({ name: t.name, path: `/${t.slug}/` })))}
      <div class="seo-actions"><a class="btn btn-dark" href="/">Find something good near you</a></div>`;
  return page({ path: "/404.html", title: "Page not found | Good Nearby", description: "This page isn't here, but there are plenty of good things nearby.", h1: "Nothing here, but lots nearby", crumbs: [], body, noindex: true });
}

// ---------- home page: metadata, structured data and the Explore line ----------
function updateHome() {
  let h = INDEX_HTML;
  const ld = [
    { "@context": "https://schema.org", "@type": "WebSite", name: "Good Nearby", url: `${SITE}/` },
    { "@context": "https://schema.org", "@type": "Organization", name: "Good Nearby", url: `${SITE}/`, logo: `${SITE}/assets/icon-512.png`, sameAs: ["https://www.instagram.com/findgoodnearby/"] },
  ].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n  ");
  const head = `<!-- seo:start (written by tools/build_pages.js) -->
  <title>Good Nearby: Yoga, Meditation & Feel-Good Things to Do near Boston</title>
  <meta name="description" content="Find yoga, sound baths, meditation, cozy cafés, trails and creative classes in Franklin, MetroWest, Boston and the South Shore. Calm, local and often free." />
  <link rel="canonical" href="${SITE}/" />
  ${ld}
  <!-- seo:end -->`;
  if (h.includes("<!-- seo:start")) h = h.replace(/<!-- seo:start[\s\S]*?<!-- seo:end -->/, head);
  else h = h.replace(/  <meta name="description"[^\n]*\n/, "").replace(/  <title>[^\n]*\n/, `  ${head}\n`);
  const nav = `<!-- explore:start -->${exploreNav()}<!-- explore:end -->`;
  if (h.includes("<!-- explore:start")) h = h.replace(/<!-- explore:start -->[\s\S]*?<!-- explore:end -->/, nav);
  else h = h.replace(/(\n\s*<p class="fine">)/, `\n    ${nav}$1`);
  if (h !== INDEX_HTML) fs.writeFileSync(path.join(ROOT, "index.html"), h);
}

// ---------- build ----------
function main() {
  const out = new Map();            // path → { html, index }
  for (const id of Object.keys(REGIONS)) out.set(regionPath(id), { html: regionPage(id), index: true });
  for (const t of townPages) out.set(townPath(t), { html: townPage(t), index: true });
  for (const t of topicPages) out.set(`/${t.slug}/`, { html: topicPage(t), index: true });
  const today = ymd(NOW);
  if (BUILD.listingPages) {
    for (const e of listings) {
      const last = e.sessions ? e.sessions[e.sessions.length - 1].start : e.seriesEnd || null;
      state.listings[e.id] = { path: urls.get(e.id), title: e.title, town: e.town, area: e.area, venue: e.venue ? e.venue.split(" · ")[0] : "",
        topic: (topicOf(e) || {}).slug || "", kind: e.sessions && !e.repeat ? "event" : "place", lastDate: last ? ymd(last) : today, lastSeen: today };
      out.set(urls.get(e.id), { html: listingPage(e), index: true });
    }
    const current = new Set(listings.map((e) => e.id));
    for (const [id, x] of Object.entries(state.listings)) {
      if (current.has(id)) continue;
      const since = x.kind === "event" ? x.lastDate : x.lastSeen;
      if ((NOW - parseLocal(since)) / DAY_MS > BUILD.keepPassedDays) { delete state.listings[id]; continue; }
      out.set(x.path, { html: passedPage(x), index: false });
    }
  }
  // Remove pages this tool made before that aren't built any more (never anything it didn't make).
  for (const p of Object.keys(state.pages)) {
    if (out.has(p)) continue;
    const file = path.join(ROOT, p, "index.html");
    if (fs.existsSync(file)) fs.unlinkSync(file);
    for (let d = path.dirname(file); d.startsWith(ROOT + path.sep) && d !== ROOT && fs.existsSync(d) && !fs.readdirSync(d).length; d = path.dirname(d)) fs.rmdirSync(d);
    delete state.pages[p];
  }
  const crypto = require("crypto");
  for (const [p, { html, index }] of out) {
    const file = path.join(ROOT, p, "index.html");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    const hash = crypto.createHash("sha1").update(html.replace(/data-(end|after)="[^"]*"/g, "")).digest("hex").slice(0, 12);
    const prev = state.pages[p];
    state.pages[p] = { hash, lastmod: prev && prev.hash === hash ? prev.lastmod : today, index };
  }
  fs.writeFileSync(path.join(ROOT, "404.html"), notFoundPage());
  updateHome();
  const homeMod = state.home && state.home.hash === STYLE_V ? state.home.lastmod : today;
  state.home = { hash: STYLE_V, lastmod: homeMod };
  const entries = [["/", homeMod], ["/privacy.html", null], ...[...out].filter(([, v]) => v.index).map(([p]) => [p, state.pages[p].lastmod])].sort((a, b) => (a[0] === "/" ? -1 : b[0] === "/" ? 1 : a[0].localeCompare(b[0])));
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(([p, m]) => `  <url><loc>${SITE}${p}</loc>${m ? `<lastmod>${m}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`);
  state.built = today;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 1) + "\n");
  const n = (re) => [...out.keys()].filter((p) => re.test(p)).length;
  console.log(`Built ${out.size} pages (${Object.keys(REGIONS).length} regions, ${townPages.size} towns, ${topicPages.length} topics, ${n(/^\/(events|places)\//)} listings, ${[...out.values()].filter((v) => !v.index).length} passed) and sitemap.xml with ${entries.length} URLs.`);
}

if (require.main === module) {
  if (process.argv.includes("--stats")) {
    console.log(`${listings.length} eligible listings`);
    console.log(`Towns with pages (${townPages.size}): ${[...townPages].map((t) => `${t} ${townCount[t]}`).join(", ")}`);
    console.log(`Topics with pages (${topicPages.length}): ${topicPages.map((t) => `${t.slug} ${listings.filter(t.test).length}`).join(", ")}`);
  } else main();
}
module.exports = { listings, REGIONS, TOWN_NOTES, TOPICS, townPages, topicPages, BUILD, urls };
