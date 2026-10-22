// Good Nearby — one calm question, then one good thing at a time.
// Or: browse by area & day to see everything happening on a chosen day.
//
// Screens (hash routes):
//   #/                        "What would feel good right now?"
//   #/m/<mood>/<i>            one event at a time for that mood (or "surprise")
//   #/browse                  pick an area and a day
//   #/day/<area>/<yyyy-mm-dd> everything happening that day in that area
//   #/d/<area>/<date>/<i>     that day's events, one at a time
//   #/weekend                 Weekend Favorites: newsletter sign-up + this weekend\'s picks
//   #/weekend/thanks|confirmed  where Buttondown sends people after signing up / confirming
//   #/find/<collection|word>[/<area>]   a seasonal collection (data/collections.js) or any word
//   #/outside/<area>          Get outside: trails, rail trails & bike paths (data/events-trails.js)
//   #/saved                   events saved on this device
//   #/saved/<id>,<id>         a saved list sent from another device (added to this one)
(function () {
  "use strict";

  // ---------- newsletter ----------
  // Weekend Favorites sign-ups go to Buttondown (buttondown.com). Put your Buttondown
  // username here once your account exists — until then the form says sign-ups open soon
  // and nothing is collected.
  // askArea: show "Your area" on the sign-up forms and send it to Buttondown as a tag.
  // Tags need a paid Buttondown plan (Basic, $9/mo), so this stays off until you upgrade.
  const NEWSLETTER = { buttondownUsername: "goodnearby", askArea: false };

  // ---------- event submissions ----------
  // "Share something good" sends each submission to Formspree (formspree.io), which emails it
  // to you. Put your Formspree form id here (the part after /f/ in its address). Until then the
  // form explains that online submissions are being set up, and nothing is sent.
  const SUBMISSIONS = { formspreeId: "" };

  // Care listings get a gentle "not medical advice" line on their card.
  const CARE_NOTE = ["massage", "reiki", "acupuncture", "herbal", "breathwork", "salt"];

  // ---------- photos & moods ----------
  // A category photo is an Unsplash photo id, or a full image URL.
  const unsplash = (id, w) => (id.startsWith("http") ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`);

  const CATEGORY = {
    yoga:       { label: "Yoga",               photo: "1506126613408-eca07ce68773" },
    meditation: { label: "Meditation",         photo: "1545205597-3d9d02c29597" },
    sound:      { label: "Sound bath",         photo: "1608571423902-eed4a5ad8108" },
    massage:    { label: "Massage",            photo: "1600334089648-b0d9d3028eb2" },
    reiki:      { label: "Reiki & energy",     photo: "1544161515-4ab6ce6db874" },
    "tai-chi":  { label: "Tai chi",            photo: "1518611012118-696072aa579a" },
    breathwork: { label: "Breathwork",         photo: "1497250681960-ef046c08a56e" },
    workshop:   { label: "Workshop",           photo: "1529156069898-49953e39b3ac" },
    expo:       { label: "Expo & fair",        photo: "1515169067868-5387ec356754" },
    acupuncture:{ label: "Acupuncture",        photo: "1544161515-4ab6ce6db874" },
    salt:       { label: "Salt cave",          photo: "https://images.pexels.com/photos/2624400/pexels-photo-2624400.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    run:        { label: "Community run",      photo: "https://images.pexels.com/photos/8381747/pexels-photo-8381747.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    walk:       { label: "Walk",               photo: "https://images.pexels.com/photos/6960/pexels-photo-6960.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    trail:      { label: "Trail & path",       photo: "https://images.pexels.com/photos/6960/pexels-photo-6960.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    hike:       { label: "Hike",               photo: "https://images.pexels.com/photos/19141785/pexels-photo-19141785.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    movement:   { label: "Movement & dance",   photo: "https://images.pexels.com/photos/36715608/pexels-photo-36715608.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    shop:       { label: "Holistic shop",      photo: "https://images.pexels.com/photos/3610753/pexels-photo-3610753.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    cafe:       { label: "Cozy café",          photo: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    craft:      { label: "Creative class",     photo: "https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    herbal:     { label: "Herbal & plant class", photo: "https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    book:       { label: "Book group",         photo: "https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    bakery:     { label: "Cozy bakery",        photo: "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1100" },
  };
  const catLabel = (k) => (CATEGORY[k] ? CATEGORY[k].label : k);

  const ICONS = {
    outside:  '<path d="M16 4 8 15h4l-5 7h18l-5-7h4Z M16 22v6"/>',
    surprise: '<path d="M16 5l2.2 6.3L24.5 13.5 18.2 15.7 16 22l-2.2-6.3L7.5 13.5l6.3-2.2Z M25 21l1 2.5 2.5 1-2.5 1L25 28l-1-2.5-2.5-1 2.5-1Z"/>',
    move:   '<path d="M16 25c-5 0-9-3-10-7 3 0 6 1 8 3M16 25c5 0 9-3 10-7-3 0-6 1-8 3M16 25c-3-3-4-7-3-12 2 1 3 3 3 5 0-2 1-4 3-5 1 5 0 9-3 12Z"/>',
    calm:   '<path d="M5 14v4M9 11v10M13 8v16M17 11v10M21 7v18M25 12v8"/>',
    care:   '<path d="M7 26v-7l-2-6c-.4-1.2 1.4-2 2-.8L9 16V8.5c0-1.4 2-1.4 2 0V15M25 26v-7l2-6c.4-1.2-1.4-2-2-.8L23 16V8.5c0-1.4-2-1.4-2 0V15M11 15c0 3 1 5 2 6M21 15c0 3-1 5-2 6"/>',
    make:   '<path d="M9 27h14M11 27c-3-2-4-5-4-8 0-3 2-5 4-6l1-4h8l1 4c2 1 4 3 4 6 0 3-1 6-4 8M12 9h8M10 18c2 1 10 1 12 0"/>',
    wander: '<path d="M7 13h15v6a7 7 0 0 1-7 7h-1a7 7 0 0 1-7-7Z M22 15h2a3 3 0 0 1 0 6h-2.5M11 9c0-2 2-2 2-4M16 9c0-2 2-2 2-4M6 28h18"/>',
    people: '<circle cx="16" cy="11" r="3.5"/><circle cx="8" cy="13" r="2.7"/><circle cx="24" cy="13" r="2.7"/><path d="M10 25c0-3.5 2.7-7 6-7s6 3.5 6 7M3 24c0-3 2-5 5-5M29 24c0-3-2-5-5-5"/>',
  };

  const MOODS = [
    { id: "move",   label: "Move my body",          hint: "Yoga · runs · walks · hikes",                         tone: "#d98a68", ink: "#fff",
      match: (e) => ["yoga", "tai-chi", "run", "walk", "hike", "movement"].includes(e.category) },
    { id: "calm",   label: "Quiet my mind",         hint: "Meditation · sound baths · salt caves",  tone: "#c3cab0", ink: "#304022",
      match: (e) => ["meditation", "sound", "breathwork", "salt"].includes(e.category) },
    { id: "care",   label: "Be cared for",          hint: "Massage · reiki · acupuncture · herbalism",   tone: "#f0d3c4", ink: "#9a5236",
      match: (e) => ["massage", "reiki", "acupuncture", "herbal"].includes(e.category) },
    { id: "make",   label: "Make something good",   hint: "Pottery · painting · flowers · herbs",   tone: "#ddd0e6", ink: "#5e4670",
      match: (e) => ["craft", "herbal"].includes(e.category) },
    { id: "wander", label: "Wander somewhere cozy", hint: "Cafés · bakeries · little shops",   tone: "#e6d6bd", ink: "#7a5a2e",
      match: (e) => ["cafe", "bakery", "shop"].includes(e.category) },
    { id: "people", label: "Be with good people",   hint: "Classes, circles & book groups",   tone: "#e3c98f", ink: "#304022",
      // anything with a date that people attend together (not one-on-one appointments)
      match: (e) => ["expo", "workshop", "book"].includes(e.category) || (e.sessions && !["massage", "reiki", "acupuncture", "shop", "cafe", "bakery"].includes(e.category))
        || (!e.sessions && (e.tags || []).includes("come-alone") && !["shop", "cafe", "bakery"].includes(e.category)) },
  ];

  // ---------- dates ----------
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();
  const DAY_MS = 86400000;

  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  // "2026-10-03" or "2026-10-03T09:30" → local Date (bare dates would otherwise parse as UTC)
  function parseLocal(s) { return new Date(s.includes("T") ? s : `${s}T00:00`); }
  const pad = (n) => String(n).padStart(2, "0");
  function ymd(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

  // Turn a listing into either dated (sessions[]) or ongoing (no sessions).
  function normalize(e) {
    const out = { ...e, sessions: null, allDay: false };
    if (e.weekly) {
      const w = e.weekly;
      const dow = DAYS.indexOf(w.day);
      const skip = new Set(w.skip || []);
      // No dates given → it's an ongoing weekly meetup: show the next ~4 months.
      let d = w.from ? parseLocal(w.from) : startOfDay(now);
      while (d.getDay() !== dow) d = addDays(d, 1);
      const last = w.until ? parseLocal(w.until) : addDays(startOfDay(now), 120);
      out.sessions = [];
      for (; d <= last; d = addDays(d, 7)) {
        const day = ymd(d);
        if (skip.has(day)) continue;
        out.sessions.push({ start: parseLocal(`${day}T${w.time}`), end: parseLocal(`${day}T${w.endTime || w.time}`) });
      }
    } else if (e.monthly) {
      // e.g. { week: 2, day: "Monday" } = the second Monday of every month, for the next ~4 months
      const m = e.monthly, dow = DAYS.indexOf(m.day);
      out.sessions = [];
      for (let k = 0; k < 5; k++) {
        const first = new Date(now.getFullYear(), now.getMonth() + k, 1);
        const d = addDays(first, ((dow - first.getDay() + 7) % 7) + (m.week - 1) * 7);
        if (d.getMonth() !== first.getMonth()) continue;
        const day = ymd(d);
        out.sessions.push({ start: parseLocal(`${day}T${m.time}`), end: parseLocal(`${day}T${m.endTime || m.time}`) });
      }
    } else if (e.start) {
      out.allDay = !e.start.includes("T");
      const start = parseLocal(e.start);
      let end = e.end ? parseLocal(e.end) : null;
      if (out.allDay) end = addDays(end || start, 1);          // through the end of the last day
      out.hasEnd = Boolean(e.end);
      out.sessions = [{ start, end: end || new Date(start.getTime() + 60 * 60 * 1000) }];
    }
    if (out.sessions) {
      out.sessions = out.sessions.filter((s) => s.end > now);
      if (!out.sessions.length) return null;                    // all over
      out.next = out.sessions[0];
    }
    return out;
  }

  const events = (window.GOOD_NEARBY_EVENTS || []).map(normalize).filter(Boolean);
  const byId = new Map(events.map((e) => [e.id, e]));

  // ---------- small storage helpers (never required to work) ----------
  function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* ignore */ }
  }

  let saved = new Set(load("goodNearby.saved", []).filter((id) => byId.has(id)));
  let origin = load("goodNearby.origin", null);   // { lat, lng } once the visitor opts in

  // ---------- areas (for "Browse by area & day") ----------
  const AREAS = [...(window.GOOD_NEARBY_TOWNS || []), { id: "all", area: "Everywhere", towns: [] }];
  const areaById = new Map(AREAS.map((a) => [a.id, a]));
  const allTowns = AREAS.flatMap((a) => a.towns.map((t) => ({ ...t, areaId: a.id })));
  let browseArea = areaById.has(load("goodNearby.area", "")) ? load("goodNearby.area", "") : null;

  // An event's area: its town by name, otherwise the nearest listed town.
  // Nearby means about 30 minutes' drive: farther than that from every listed town → only under "Everywhere".
  const AREA_CAP_MILES = 15;   // ≈ 30 minutes' drive (same estimate as driveMin)
  function areaOf(e) {
    const name = e.city.replace(/, MA$/, "").trim().toLowerCase();
    const match = allTowns.find((t) => t.name.toLowerCase() === name);
    if (match) return match.areaId;
    if (e.lat == null) return null;
    let best = null, bestMi = Infinity;
    for (const t of allTowns) { const mi = distanceMiles(e, t); if (mi < bestMi) { best = t; bestMi = mi; } }
    return best && bestMi <= AREA_CAP_MILES ? best.areaId : null;
  }
  events.forEach((e) => { e.area = areaOf(e); });
  const inArea = (e, areaId) => areaId === "all" || e.area === areaId;

  // The session of `e` that falls on `day` (midnight), if any.
  function sessionOn(e, day) {
    if (!e.sessions) return null;
    const end = addDays(day, 1);
    return e.sessions.find((s) => s.start < end && s.end > day) || null;
  }
  function eventsOn(areaId, day) {
    return events
      .map((e) => ({ e, s: sessionOn(e, day) }))
      .filter((x) => x.s && inArea(x.e, areaId))
      .sort((a, b) => a.s.start - b.s.start);
  }
  // "This weekend": Friday 5 PM through Sunday night (or what's left of it, if it's the weekend now).
  function weekendWindow() {
    const today = startOfDay(now);
    const dow = today.getDay();                       // 0 Sun … 6 Sat
    const friday = addDays(today, dow === 0 ? -2 : 5 - dow);
    const from = new Date(friday); from.setHours(17);
    return { from: now > from ? now : from, to: addDays(friday, 3), friday };
  }
  function weekendPicks() {
    const w = weekendWindow();
    return events
      .map((e) => ({ e, s: e.sessions && e.sessions.find((x) => x.end > w.from && x.start < w.to) }))
      .filter((x) => x.s)
      .sort((a, b) => a.s.start - b.s.start);
  }
  const ongoingIn = (areaId) => events.filter((e) => !e.sessions && inArea(e, areaId)).sort((a, b) => a.city.localeCompare(b.city));

  // ---------- formatting ----------
  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
  const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
  const mdFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  const longFmt = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });
  const monFmt = new Intl.DateTimeFormat(undefined, { month: "short" });
  const hourFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric" });
  const shortTime = (d) => (d.getMinutes() ? timeFmt : hourFmt).format(d);   // "10 AM", "5:30 PM"

  // ---------- opening hours (cafés & shops) ----------
  // e.hours = { mon: "07:00-15:00", ..., sun: null }  (null = closed that day)
  const DKEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const clock = (t) => { const [h, m] = t.split(":").map(Number); return shortTime(new Date(2000, 0, 1, h, m)); };
  const span = (h) => { const [a, b] = h.split("-"); return `${clock(a)} – ${clock(b)}`; };
  function openStatus(e) {
    if (!e.hours) return null;
    const mins = now.getHours() * 60 + now.getMinutes();
    const today = e.hours[DKEYS[now.getDay()]];
    if (today) {
      const [a, b] = today.split("-");
      if (mins >= toMin(a) && mins < toMin(b)) return { open: true, text: `Open now · until ${clock(b)}` };
      if (mins < toMin(a)) return { open: false, text: `Opens today at ${clock(a)}` };
    }
    for (let k = 1; k <= 7; k++) {
      const h = e.hours[DKEYS[(now.getDay() + k) % 7]];
      if (h) return { open: false, text: `Closed now · opens ${k === 1 ? "tomorrow" : DAYS[(now.getDay() + k) % 7]} at ${clock(h.split("-")[0])}` };
    }
    return { open: false, text: "Closed" };
  }
  function hoursTable(e) {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return `<table class="hours">${order.map((i) => {
      const h = e.hours[DKEYS[i]];
      return `<tr${i === now.getDay() ? ' class="today"' : ""}><th>${DAYS[i]}</th><td>${h ? span(h) : "Closed"}</td></tr>`;
    }).join("")}</table>`;
  }
  const isPlace = (e) => ["cafe", "bakery", "shop"].includes(e.category);

  // "Today", "Tomorrow", "Saturday" (within a week), otherwise "Sat, Oct 17"
  function dayWord(d) {
    const diff = Math.round((startOfDay(d) - startOfDay(now)) / DAY_MS);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff > 1 && diff < 7) return DAYS[d.getDay()];
    return dateFmt.format(d);
  }

  // Plain-language countdown, to help with time blindness.
  function countdown(s) {
    if (s.start <= now) return "Happening right now";
    const mins = Math.round((s.start - now) / 60000);
    if (mins < 60) return `Starts in ${mins} min`;
    const hours = Math.round(mins / 60);
    if (hours < 12) return `Starts in ${hours} hour${hours === 1 ? "" : "s"}`;
    const days = Math.round((startOfDay(s.start) - startOfDay(now)) / DAY_MS);
    if (days <= 1) return days === 0 ? "Later today" : "Tomorrow";
    if (days < 14) return `In ${days} days`;
    const weeks = Math.round(days / 7);
    return `In about ${weeks} weeks`;
  }

  // When browsing a specific day, show that day's session; otherwise the next one.
  const sessionFor = (e) => (state.day && sessionOn(e, state.day)) || e.next;

  function whenBig(e) {
    if (!e.sessions) {
      const st = openStatus(e);
      return st ? `<span class="${st.open ? "is-open" : "is-closed"}">${escapeHtml(st.text)}</span>` : escapeHtml(e.schedule || "Ongoing");
    }
    const s = sessionFor(e);
    if (e.allDay) {
      const lastDay = addDays(s.end, -1);
      return ymd(lastDay) === ymd(s.start) ? dayWord(s.start) : `${dayWord(s.start)} – ${dayWord(lastDay)}`;
    }
    return `${dayWord(s.start)} · ${timeFmt.format(s.start)}`;
  }

  function whenSmall(e) {
    if (!e.sessions) {
      if (e.hours) { const h = e.hours[DKEYS[now.getDay()]]; return `Today: ${h ? span(h) : "closed"}`; }
      if (isPlace(e)) return e.schedule && !/check/i.test(e.schedule) ? e.schedule : "Hours: see Google Maps below";
      if (e.trail) return [e.miles ? `${e.miles} miles` : "", e.surface || ""].filter(Boolean).join(" · ") || "Go any day you like";
      return "Whenever works for you — check their schedule";
    }
    const s = sessionFor(e);
    const parts = [countdown(s)];
    if (e.weekly) parts.push(`every ${e.weekly.day} until ${mdFmt.format(e.sessions[e.sessions.length - 1].start)}`);
    else if (e.monthly) parts.push(`every ${["", "1st", "2nd", "3rd", "4th"][e.monthly.week]} ${e.monthly.day} of the month`);
    else if (!e.allDay && e.hasEnd) parts.push(`ends ${timeFmt.format(s.end)}`);
    return parts.join(" · ");
  }

  const TAG_LABELS = { free: "Free", "come-alone": "Easy to go solo", beginner: "Beginner-friendly",
    women: "Women", "all-paces": "All paces", outdoors: "Outdoors", "gluten-free": "Gluten-free" };
  const tagChips = (e) => (e.tags || []).filter((t) => TAG_LABELS[t] && !(t === "free" && e.price === 0))
    .map((t) => `<span class="tag tag-${t}">${TAG_LABELS[t]}</span>`).join("");

  function priceLabel(e) {
    if (e.price === 0) return "Free";
    if (typeof e.price === "number") return `$${e.price}`;
    if (["cafe", "bakery", "shop"].includes(e.category)) return "Drop in anytime";
    return "Price: ask the host";
  }

  function distanceMiles(a, b) {
    const R = 3958.8;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  // Rough drive time from straight-line miles (winding roads, highways for longer trips, a few minutes to park).
  const driveMin = (e) => Math.round(distanceMiles(origin, e) * 1.7 + 4);
  const milesText = (e) => {
    if (!origin || e.lat == null) return "";
    const m = driveMin(e);
    return m < 60 ? `~${m} min away` : `~${Math.floor(m / 60)} hr ${m % 60 ? `${m % 60} min ` : ""}away`;
  };

  // ---------- decks ----------
  function bySoonest(a, b) {
    if (a.next && b.next) return a.next.start - b.next.start;
    if (a.next) return -1;
    if (b.next) return 1;
    return a.city.localeCompare(b.city);
  }
  function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function buildDeck(moodId) {
    if (moodId === "saved") return events.filter((e) => saved.has(e.id)).sort(bySoonest).map((e) => e.id);
    if (moodId === "weekend") return weekendPicks().map((x) => x.e.id);
    // Trails and parks live on the Get outside list, not in the feelings.
    const pool = events.filter((e) => !e.trail);
    if (moodId === "surprise") {
      // Something soon first, then everything else — all in a fresh order.
      const soon = pool.filter((e) => e.next && e.next.start - now < 14 * DAY_MS);
      const rest = pool.filter((e) => !soon.includes(e));
      return [...shuffle(soon), ...shuffle(rest)].map((e) => e.id);
    }
    const mood = MOODS.find((m) => m.id === moodId);
    if (!mood) return [];
    return bestFirst(pool.filter(mood.match)).map((e) => e.id);
  }

  // The best few first: soon, close, hand-checked, free or come-alone — and not the same host twice in a row.
  function score(e) {
    let sc = 0;
    if (e.next) {
      const days = (startOfDay(e.next.start) - startOfDay(now)) / DAY_MS;
      sc += days <= 2 ? 3 : days <= 7 ? 2 : days <= 14 ? 1 : 0;
    } else sc += 1;
    sc += e.source === "Eventbrite" ? 0 : e.source ? 1 : 2;
    if (e.price === 0) sc += 1;
    if ((e.tags || []).includes("come-alone")) sc += 0.5;
    if (origin && e.lat != null) sc -= distanceMiles(origin, e) / 8;
    return sc;
  }
  function bestFirst(list) {
    const pool = list.map((e) => ({ e, s: score(e) })).sort((a, b) => b.s - a.s);
    const out = [], recent = [];
    while (pool.length) {
      let k = pool.findIndex((x) => !recent.includes(x.e.host));
      if (k < 0) k = 0;
      const [x] = pool.splice(k, 1);
      out.push(x.e); recent.push(x.e.host); if (recent.length > 3) recent.shift();
    }
    return out;
  }

  // ---------- calendar file (.ics) ----------
  function icsText(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }
  const icsLocal = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const icsDay = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

  function downloadIcs(e) {
    const s = sessionFor(e);
    const single = Boolean(state.day);       // picked from a specific day → just that date
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Good Nearby//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${e.id}-${icsDay(s.start)}@goodnearby`,
      `DTSTAMP:${stamp}`,
    ];
    if (e.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${icsDay(s.start)}`, `DTEND;VALUE=DATE:${icsDay(s.end)}`);
    } else {
      lines.push(`DTSTART:${icsLocal(s.start)}`, `DTEND:${icsLocal(s.end)}`);
    }
    if (!single && e.weekly && e.sessions.length > 1) {
      const last = e.sessions[e.sessions.length - 1].start;
      lines.push(`RRULE:FREQ=WEEKLY;UNTIL=${icsDay(last)}T235959`);
      const skips = (e.weekly.skip || []).filter((d) => parseLocal(d) > s.start);
      if (skips.length) lines.push(`EXDATE:${skips.map((d) => icsLocal(parseLocal(`${d}T${e.weekly.time}`))).join(",")}`);
    } else if (!single && e.monthly && e.sessions.length > 1) {
      const last = e.sessions[e.sessions.length - 1].start;
      lines.push(`RRULE:FREQ=MONTHLY;BYDAY=${e.monthly.week}${e.monthly.day.slice(0, 2).toUpperCase()};UNTIL=${icsDay(last)}T235959`);
    }
    lines.push(
      `SUMMARY:${icsText(e.title)}`,
      `LOCATION:${icsText([e.venue, e.address, e.city].filter(Boolean).join(", "))}`,
      `DESCRIPTION:${icsText(`${e.description}\n\nHost: ${e.host}${e.url ? `\n${e.url}` : ""}\n\nFound on Good Nearby — please confirm details with the host.`)}`,
    );
    if (e.url) lines.push(`URL:${e.url}`);
    lines.push("BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", `DESCRIPTION:${icsText(e.title)} in 2 hours`, "END:VALARM");
    lines.push("END:VEVENT", "END:VCALENDAR");

    const fold = (line) => {
      const out = [];
      let rest = line;
      while (new TextEncoder().encode(rest).length > 74) {
        let cut = 73;
        while (new TextEncoder().encode(rest.slice(0, cut)).length > 73) cut--;
        out.push(rest.slice(0, cut));
        rest = " " + rest.slice(cut);
      }
      out.push(rest);
      return out.join("\r\n");
    };
    const blob = new Blob([lines.map(fold).join("\r\n")], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${e.id}-${icsDay(s.start)}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ---------- rendering ----------
  const $ = (id) => document.getElementById(id);
  const screens = { outside: $("screenOutside"), find: $("screenFind"), start: $("screenStart"), browse: $("screenBrowse"), day: $("screenDay"), weekend: $("screenWeekend"), submit: $("screenSubmit"), pick: $("screenPick"), saved: $("screenSaved"), wander: $("screenWander") };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // base: the URL prefix for the current deck; day: the chosen day when browsing by day
  const state = { mood: null, deck: [], index: 0, base: "", day: null, back: null, limit: Infinity, deckBuiltFor: null };

  function showScreen(name) {
    Object.entries(screens).forEach(([k, el]) => { el.hidden = k !== name; });
    document.body.dataset.screen = name;
    window.scrollTo(0, 0);
  }

  function updateSavedPill() {
    $("savedPill").hidden = saved.size === 0;
    $("savedCount").textContent = saved.size;
  }

  // Two extra tiles beside the feelings: they open a list (Get outside) or a random few (Surprise me).
  const EXTRA_TILES = [
    { id: "outside",  label: "Get outside", hint: "Trails · rail trails · bike paths", tone: "#a9bf95", ink: "#304022" },
    { id: "surprise", label: "Surprise me", hint: "A few good things, any kind",       tone: "#f1e3c6", ink: "#a15e3d" },
  ];
  function renderStart() {
    fillAreaPicks();
    $("moods").innerHTML = [...MOODS, ...EXTRA_TILES].map((m) => `
      <button type="button" class="mood" data-mood="${m.id}">
        <span class="mood-icon" style="--tone:${m.tone};--icon:${m.ink}">
          <svg viewBox="0 0 32 32" aria-hidden="true">${ICONS[m.id]}</svg>
        </span>
        <span class="mood-text">
          <span class="mood-label">${m.label}</span>
          <span class="mood-hint">${m.hint}</span>
        </span>
        <span class="mood-arrow" aria-hidden="true">→</span>
      </button>`).join("");
    renderWhere();
  }

  function photo(e, w) {
    const cat = CATEGORY[e.category];
    // The event's own picture when we have one, otherwise a photo for its category.
    // A photo that fails to load is removed, leaving the warm gradient behind it.
    if (e.image) return `<img src="${escapeHtml(e.image)}" alt="" onerror="this.remove()">`;
    return cat ? `<img src="${unsplash(cat.photo, w)}" alt="" onerror="this.remove()">` : "";
  }

  async function shareListing(e, btn) {
    const url = `${location.origin}${location.pathname}#/e/${encodeURIComponent(e.id)}`;
    const when = e.sessions ? `${whenBig(e).replace(/<[^>]+>/g, "")} · ` : "";
    const text = `${e.title} — ${when}${e.city.replace(/, MA$/, "")}. Want to go? 🌻`;
    try {
      if (navigator.share) { await navigator.share({ title: e.title, text, url }); return; }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      btn.innerHTML = '<span aria-hidden="true">✓</span> Link copied — paste it in a text';
    } catch (_) { /* closed the share sheet — nothing to do */ }
  }

  // No accounts: the saved list travels as a link, e.g. from your phone to your laptop.
  async function sendSavedList(btn) {
    const ids = events.filter((e) => saved.has(e.id)).sort(bySoonest).map((e) => encodeURIComponent(e.id));
    const url = `${location.origin}${location.pathname}#/saved/${ids.join(",")}`;
    const text = `My saved good things on Good Nearby (${ids.length}) 🌻`;
    try {
      if (navigator.share) { await navigator.share({ title: "My Good Nearby list", text, url }); return; }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      btn.innerHTML = '<span aria-hidden="true">✓</span> Link copied — paste it in a text or email to yourself';
    } catch (_) { /* closed the share sheet — nothing to do */ }
  }

  function renderPick(focusTitle) {
    const card = $("pickCard");
    const total = state.deck.length;

    // "Just 3 for you": after each batch, a gentle pause instead of an endless stack.
    if (state.index >= state.limit && state.index < total) {
      $("progress").innerHTML = '<button type="button" class="quiet-link" data-act="prev">‹ Back</button>';
      const left = total - state.index;
      card.innerHTML = `
        <div class="pick-body done">
          <p class="done-mark" aria-hidden="true">🌻</p>
          <h2 id="pickTitle" tabindex="-1">That's your ${state.limit === 3 ? "3" : "picks"} for now.</h2>
          <p class="lede">Save the one that feels right, or see a few more.</p>
          <div class="done-actions">
            <button type="button" class="btn btn-dark" data-act="more">Show me ${Math.min(3, left)} more</button>
            <a href="#/" class="btn btn-soft">Pick another feeling</a>
            ${saved.size ? `<a href="#/saved" class="btn btn-soft">See what I saved (${saved.size})</a>` : ""}
          </div>
        </div>`;
      afterRender(focusTitle);
      return;
    }

    if (state.index >= total) {
      $("progress").textContent = "";
      card.innerHTML = `
        <div class="pick-body done">
          <p class="done-mark" aria-hidden="true">🌿</p>
          <h2 id="pickTitle" tabindex="-1">${total ? "That's everything for now." : "Nothing here just yet."}</h2>
          <p class="lede">${total ? "Take a breath. More good things are added often." : "Try another feeling — or come back soon."}</p>
          <div class="done-actions">
            ${state.back ? `<a href="${state.back.href}" class="btn btn-dark">${state.back.label.replace("← ", "")}</a>` : ""}
            <a href="#/" class="btn ${state.back ? "btn-soft" : "btn-dark"}">Pick a feeling</a>
            ${saved.size ? `<a href="#/saved" class="btn btn-soft">See what I saved (${saved.size})</a>` : ""}
          </div>
          ${state.mood === "weekend" ? "" : `<p class="nudge"><a href="#/weekend">💌 Get Weekend Favorites in your inbox every Thursday →</a></p>`}
        </div>`;
      afterRender(focusTitle);
      return;
    }

    const e = byId.get(state.deck[state.index]);
    const isSaved = saved.has(e.id);
    const batched = Number.isFinite(state.limit);
    const batchStart = batched ? Math.floor(state.index / 3) * 3 : 0;
    const batchSize = batched ? Math.min(3, total - batchStart) : 0;
    $("progress").innerHTML =
      `${state.index > 0 ? '<button type="button" class="quiet-link" data-act="prev">‹ Back</button>' : ""}` +
      (batched
        ? `<span class="dots" aria-label="${state.index - batchStart + 1} of ${batchSize}">${Array.from({ length: batchSize }, (_, k) => `<i class="${batchStart + k === state.index ? "on" : ""}"></i>`).join("")}</span>`
        : `<span>${state.index + 1} of ${total}</span>`);

    const where = [e.venue && e.venue !== e.title && !e.title.startsWith(e.venue) ? e.venue : "", e.city.replace(/, MA$/, ""), milesText(e)].filter(Boolean).map(escapeHtml).join(" · ");
    const placeQuery = encodeURIComponent([e.venue, e.address, e.city].filter(Boolean).join(", "));
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${placeQuery}`;
    const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${placeQuery}`;
    const place = !e.sessions && isPlace(e);

    card.innerHTML = `
      <div class="pick-image">${photo(e, 1100)}<span class="pick-tag">${escapeHtml(catLabel(e.category))}</span></div>
      <div class="pick-body">
        <p class="when-big">${whenBig(e)}</p>
        <p class="when-small">${escapeHtml(whenSmall(e))}</p>
        <h2 id="pickTitle" tabindex="-1">${escapeHtml(e.title)}</h2>
        <p class="where">${where}</p>
        <p class="price ${e.price === 0 ? "free" : ""}">${priceLabel(e)}${e.priceNote ? ` <span>· ${escapeHtml(e.priceNote)}</span>` : ""}</p>
        ${e.tags && e.tags.length ? `<p class="tags">${tagChips(e)}</p>` : ""}
        <p class="desc">${escapeHtml(e.description)}</p>
        ${CARE_NOTE.includes(e.category) ? '<p class="care-note">Not medical advice. If you have a health condition or are pregnant, check with your doctor first.</p>' : ""}

        <div class="go-panel${place ? " visit" : ""}" id="goPanel"${place ? "" : " hidden"}>
          <p class="go-title">${place ? "Plan your visit" : "Nice. Here's what you need:"}</p>
          ${place && e.hours ? `<details class="hours-box"><summary>All hours</summary>${hoursTable(e)}</details>` : ""}
          <div class="go-actions">
            ${e.sessions ? '<button type="button" class="go-btn" data-act="calendar"><span aria-hidden="true">📅</span> Add to my calendar</button>' : ""}
            <a class="go-btn" href="${dirUrl}" target="_blank" rel="noopener"><span aria-hidden="true">📍</span> Directions</a>
            ${place ? `<a class="go-btn" href="${mapUrl}" target="_blank" rel="noopener"><span aria-hidden="true">⭐</span> Reviews, photos &amp; map</a>` : ""}
            ${e.menu ? `<a class="go-btn" href="${escapeHtml(e.menu)}" target="_blank" rel="noopener"><span aria-hidden="true">🍽️</span> Menu</a>` : ""}
            ${e.url ? `<a class="go-btn" href="${escapeHtml(e.url)}" target="_blank" rel="noopener"><span aria-hidden="true">${place ? "🌐" : "🎟️"}</span> ${e.sessions ? "Sign up / details" : place ? "Website" : "Book / see schedule"}</a>` : ""}
            <button type="button" class="go-btn" data-act="share"><span aria-hidden="true">💬</span> Send to a friend</button>
            ${e.phone ? `<a class="go-btn" href="tel:${escapeHtml(e.phone.replace(/[^\d+]/g, ""))}"><span aria-hidden="true">📞</span> Call ${escapeHtml(e.phone)}</a>` : ""}
          </div>
          <p class="confirm">Details can change — a quick check with the host is always a good idea.</p>
        </div>
      </div>
      <div class="pick-actions${place ? " two" : ""}">
        <button type="button" class="act ${isSaved ? "on" : ""}" data-act="save" aria-pressed="${isSaved}">
          <span aria-hidden="true">${isSaved ? "♥" : "♡"}</span> ${isSaved ? "Saved" : "Save"}
        </button>
        ${place ? "" : `<button type="button" class="act" data-act="go" aria-expanded="false" aria-controls="goPanel">I'm in</button>`}
        <button type="button" class="act act-next" data-act="next">${state.index + 1 < Math.min(total, state.limit) ? "Next" : "Done"} <span aria-hidden="true">→</span></button>
      </div>`;
    afterRender(focusTitle);
  }

  function afterRender(focusTitle) {
    const card = $("pickCard");
    if (!reduceMotion) { card.classList.remove("enter"); void card.offsetWidth; card.classList.add("enter"); }
    if (focusTitle) $("pickTitle")?.focus({ preventScroll: true });
    updateSavedPill();
  }

  // ---------- browse by area & day ----------
  function renderBrowse() {
    $("areaList").innerHTML = AREAS.map((a) => {
      const sample = a.towns.slice(0, 4).map((t) => t.name).join(", ");
      return `<button type="button" class="area${a.id === browseArea ? " on" : ""}" data-area="${a.id}" aria-pressed="${a.id === browseArea}">
        <span class="area-name">${escapeHtml(a.area)}</span>
        <span class="area-towns">${a.id === "all" ? "All of Greater Boston" : `${escapeHtml(sample)}…`}</span>
      </button>`;
    }).join("");

    if (!browseArea) {
      $("dayHint").textContent = "Pick an area first, then the days will appear here.";
      $("dayGrid").innerHTML = "";
      $("otherDate").closest(".other-day").hidden = true;
      return;
    }
    $("dayHint").textContent = `The number shows how many good things are on in ${areaById.get(browseArea).area === "Everywhere" ? "the whole region" : areaById.get(browseArea).area}.`;
    $("otherDate").closest(".other-day").hidden = false;
    const today = startOfDay(now);
    const cells = [];
    for (let i = 0; i < 14; i++) {
      const d = addDays(today, i);
      const n = eventsOn(browseArea, d).length;
      const label = i === 0 ? "Today" : i === 1 ? "Tmrw" : DAYS[d.getDay()].slice(0, 3);
      const newMonth = i === 0 || d.getDate() === 1;
      cells.push(`<button type="button" class="day${n ? "" : " empty"}${d.getDay() === 0 || d.getDay() === 6 ? " weekend" : ""}" data-date="${ymd(d)}"
          aria-label="${longFmt.format(d)}: ${n ? `${n} thing${n === 1 ? "" : "s"}` : "nothing listed yet"}">
        <span class="day-name">${label}</span>
        <span class="day-num">${d.getDate()}</span>
        ${newMonth ? `<span class="day-mon">${monFmt.format(d)}</span>` : ""}
        <span class="day-count">${n || "·"}</span>
      </button>`);
    }
    $("dayGrid").innerHTML = cells.join("");
    $("otherDate").min = ymd(today);
    $("otherDate").value = "";
  }

  let dayView = { area: null, day: null };

  function renderDay(areaId, day) {
    dayView = { area: areaId, day };
    const a = areaById.get(areaId);
    const w = dayWord(day);
    $("dayTitle").textContent = w === "Today" || w === "Tomorrow" ? `${w} · ${longFmt.format(day)}` : longFmt.format(day);
    $("dayArea").innerHTML = `In <strong>${escapeHtml(a.area)}</strong> · <a href="#/browse" class="inline-link">change</a>`;
    document.querySelector('[data-shift="-1"]').disabled = day <= startOfDay(now);

    const list = eventsOn(areaId, day);
    const ongoing = ongoingIn(areaId);
    const row = (e, i, time, extra) => {
      const meta = [e.venue, e.city.replace(/, MA$/, ""), priceLabel(e) === "Price: ask the host" ? "" : priceLabel(e)]
        .filter(Boolean).map(escapeHtml).join(" · ");
      return `<li><button type="button" class="row" data-dayopen="${i}">
        <span class="row-time${extra ? " small" : ""}">${time}</span>
        <span class="row-main">
          <span class="row-title">${escapeHtml(e.title)}${saved.has(e.id) ? ' <span class="row-saved" aria-label="saved">♥</span>' : ""}</span>
          <span class="row-meta">${meta}</span>
          ${extra ? "" : `<span class="row-cat">${escapeHtml(catLabel(e.category))}${e.weekly ? " · weekly" : e.monthly ? " · monthly" : ""}</span>`}
          ${e.tags && e.tags.length ? `<span class="row-tags">${tagChips(e)}</span>` : ""}
        </span>
        <span class="row-arrow" aria-hidden="true">›</span>
      </button></li>`;
    };
    const hour = (x) => (x.e.allDay ? -1 : x.s.start.getHours());
    const slot = (title, items) => items.length ? `<section class="slot"><h3>${title}</h3><ul class="rows">${
      items.map((x) => row(x.e, list.indexOf(x), x.e.allDay ? "All day" : shortTime(x.s.start))).join("")}</ul></section>` : "";

    let html = "";
    if (list.length) {
      html += slot("Happening all day", list.filter((x) => hour(x) === -1));
      html += slot("Morning", list.filter((x) => hour(x) >= 0 && hour(x) < 12));
      html += slot("Afternoon", list.filter((x) => hour(x) >= 12 && hour(x) < 17));
      html += slot("Evening", list.filter((x) => hour(x) >= 17));
    } else {
      html += `<div class="nothing">
        <p class="nothing-title">Nothing listed in ${escapeHtml(a.area === "Everywhere" ? "the region" : a.area)} this day — yet.</p>
        ${nextBusyDay(areaId, day)}
        ${areaId !== "all" && eventsOn("all", day).length ? `<p><a class="inline-link" href="#/day/all/${ymd(day)}">See ${eventsOn("all", day).length} thing${eventsOn("all", day).length === 1 ? "" : "s"} elsewhere this day →</a></p>` : ""}
      </div>`;
    }
    if (ongoing.length) {
      html += `<details class="ongoing">
        <summary>Also open most days in ${escapeHtml(a.area === "Everywhere" ? "the region" : a.area)} <span>${ongoing.length} place${ongoing.length === 1 ? "" : "s"} — classes &amp; appointments</span></summary>
        <ul class="rows">${ongoing.map((e, i) => row(e, list.length + i, escapeHtml(e.schedule || "Ongoing"), true)).join("")}</ul>
      </details>`;
    }
    $("dayList").innerHTML = html;
    if (!reduceMotion) { const el = $("dayList"); el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter"); }
  }

  function nextBusyDay(areaId, from) {
    for (let i = 1; i <= 90; i++) {
      const d = addDays(from, i);
      const n = eventsOn(areaId, d).length;
      if (n) return `<button type="button" class="btn btn-dark" data-goto="${ymd(d)}">Next good thing: ${dayWord(d)}${dayWord(d).includes(",") ? "" : `, ${mdFmt.format(d)}`} (${n}) →</button>`;
    }
    return "";
  }

  // The day's events (then ongoing places) as a one-at-a-time deck.
  // ---------- Wander somewhere cozy: an organized list of places ----------
  let wanderArea = "all";
  const WANDER_GROUPS = [
    { title: "Coffee + a little wander", note: "garden centers, farms, harbors & brooks", test: (e) => e.category !== "shop" && (e.tags || []).includes("outdoors") },
    { title: "Cozy cafés & bakeries", note: "", test: (e) => e.category !== "shop" && !(e.tags || []).includes("outdoors") },
    { title: "Little shops", note: "crystals, books & herbs", test: (e) => e.category === "shop" },
  ];
  function wanderList(areaId) {
    const places = events.filter((e) => !e.sessions && isPlace(e) && inArea(e, areaId));
    const rank = (e) => { const st = openStatus(e); return st ? (st.open ? 0 : 1) : 2; };
    const order = (a, b) => rank(a) - rank(b) || (origin ? distanceMiles(origin, a) - distanceMiles(origin, b) : a.title.localeCompare(b.title));
    return WANDER_GROUPS.map((g) => ({ ...g, items: places.filter(g.test).sort(order) })).filter((g) => g.items.length);
  }
  const wanderDeck = (areaId) => wanderList(areaId).flatMap((g) => g.items.map((e) => e.id));

  function renderWander(areaId) {
    wanderArea = areaId;
    $("wanderAreas").innerHTML = AREAS.map((a) =>
      `<button type="button" class="chip${a.id === areaId ? " on" : ""}" data-wanderarea="${a.id}" aria-pressed="${a.id === areaId}">${escapeHtml(a.id === "all" ? "Everywhere" : a.area)}</button>`).join("");
    const groups = wanderList(areaId);
    let i = 0;
    $("wanderList").innerHTML = groups.map((g, gi) => `<section class="slot"><h3>${escapeHtml(g.title)}${g.note ? ` <span>${escapeHtml(g.note)}</span>` : ""}</h3><ul class="rows">${
      g.items.map((e, k) => {
        const st = openStatus(e);
        const status = st ? `<span class="row-time small ${st.open ? "is-open" : "is-closed"}">${st.open ? "Open now" : "Closed"}${st.open ? `<br><span class="sub">${escapeHtml(st.text.replace("Open now · ", ""))}</span>` : ""}</span>`
          : `<span class="row-time small is-unknown">See hours</span>`;
        const meta = [e.city.replace(/, MA$/, ""), milesText(e)].filter(Boolean).map(escapeHtml).join(" · ");
        return `<li${k >= 5 ? ' class="more" hidden' : ""}><button type="button" class="row" data-wanderopen="${i++}">
          ${status}
          <span class="row-main">
            <span class="row-title">${escapeHtml(e.title)}${saved.has(e.id) ? ' <span class="row-saved" aria-label="saved">♥</span>' : ""}</span>
            <span class="row-meta">${meta}</span>
            <span class="row-cat">${escapeHtml(catLabel(e.category))}${e.menu ? " · menu" : ""}</span>
          </span>
          <span class="row-arrow" aria-hidden="true">›</span>
        </button></li>`;
      }).join("")}</ul>${g.items.length > 5 ? `<button type="button" class="show-more" data-showmore>Show ${g.items.length - 5} more</button>` : ""}</section>`).join("") || `<div class="nothing"><p class="nothing-title">No cozy spots listed here yet.</p><p><a class="inline-link" href="#/wander/all">See everywhere →</a></p></div>`;
  }

  // ---------- Collections: every upcoming thing about a theme, e.g. #/find/halloween ----------
  const COLLECTIONS = window.GOOD_NEARBY_COLLECTIONS || [];
  // The end of a collection's season: the next time its `to` date comes round (handles Dec → Jan).
  function seasonEnd(c, from) {
    const [m, d] = c.to.split("-").map(Number);
    let end = new Date(from.getFullYear(), m - 1, d + 1);
    if (end <= from) end = new Date(from.getFullYear() + 1, m - 1, d + 1);
    return end;
  }
  function inSeason(c, d) {
    const md = (d.getMonth() + 1) * 100 + d.getDate();
    const num = (s) => Number(s.replace("-", ""));
    const a = num(c.from), b = num(c.to);
    return a <= b ? md >= a && md <= b : md >= a || md <= b;
  }
  function collectionFor(key) {
    const c = COLLECTIONS.find((x) => x.id === key);
    if (c) return c;
    const word = key.replace(/[^\p{L}\p{N} '-]/gu, "").trim().slice(0, 40);
    if (!word) return null;
    return { id: key, emoji: "🔎", title: `Good things: “${word}”`, match: new RegExp(word.replace(/[-']/g, "\\$&"), "i") };
  }
  function collectionItems(c, areaId) {
    const until = c.to ? seasonEnd(c, startOfDay(now)) : addDays(startOfDay(now), 90);
    return events
      .filter((e) => e.sessions && inArea(e, areaId) && c.match.test(`${e.title} ${e.description || ""}`))
      .map((e) => ({ e, s: e.sessions.find((x) => x.end > now && x.start < until) }))
      .filter((x) => x.s)
      .sort((a, b) => a.s.start - b.s.start);
  }
  const findDeck = (key, areaId) => { const c = collectionFor(key); return c ? collectionItems(c, areaId).map((x) => x.e.id) : []; };
  let findView = { key: "", area: "all" };
  function renderFind(key, areaId) {
    const c = collectionFor(key);
    findView = { key, area: areaId };
    $("findTitle").textContent = c ? `${c.emoji} ${c.title}` : "Nothing to show";
    const items = c ? collectionItems(c, areaId) : [];
    $("findLede").textContent = items.length
      ? `${items.length} upcoming thing${items.length === 1 ? "" : "s"}${c.blurb ? ` — ${c.blurb}` : ""}. Soonest first.`
      : "";
    $("findAreas").innerHTML = AREAS.map((a) =>
      `<button type="button" class="chip${a.id === areaId ? " on" : ""}" data-findarea="${a.id}" aria-pressed="${a.id === areaId}">${escapeHtml(a.id === "all" ? "Everywhere" : a.area)}</button>`).join("");
    const days = new Map();
    items.forEach((x, i) => {
      const d = startOfDay(x.s.start < now ? now : x.s.start), k = ymd(d);
      if (!days.has(k)) days.set(k, { d, rows: [] });
      days.get(k).rows.push({ ...x, i });
    });
    $("findList").innerHTML = [...days.values()].map(({ d, rows }) => {
      const w = dayWord(d);
      return `<section class="slot"><h3>${escapeHtml(w.includes(",") ? w : `${w} · ${mdFmt.format(d)}`)}</h3><ul class="rows">${rows.map(({ e, s, i }) => {
        const meta = [e.venue, e.city.replace(/, MA$/, ""), priceLabel(e) === "Price: ask the host" ? "" : priceLabel(e)].filter(Boolean).map(escapeHtml).join(" · ");
        return `<li><button type="button" class="row" data-findopen="${i}">
          <span class="row-time">${e.allDay ? "All day" : shortTime(s.start)}</span>
          <span class="row-main">
            <span class="row-title">${escapeHtml(e.title)}${saved.has(e.id) ? ' <span class="row-saved" aria-label="saved">♥</span>' : ""}</span>
            <span class="row-meta">${meta}</span>
            <span class="row-cat">${escapeHtml(catLabel(e.category))}</span>
          </span>
          <span class="row-arrow" aria-hidden="true">›</span>
        </button></li>`;
      }).join("")}</ul></section>`;
    }).join("") || `<div class="nothing"><p class="nothing-title">Nothing coming up${areaId !== "all" ? " in this area" : ""} — yet.</p>${areaId !== "all" ? `<p><a class="inline-link" href="#/find/${encodeURIComponent(key)}/all">See everywhere →</a></p>` : `<p><a class="inline-link" href="#/browse">Browse the full calendar →</a></p>`}</div>`;
  }
  // ---------- Get outside: trails, rail trails & bike paths (listings with a `trail` field) ----------
  let outsideArea = "all";
  const OUTSIDE_GROUPS = [
    { kind: "rail", title: "Rail trails & bike paths", note: "flat & easy, great for strollers and bikes" },
    { kind: "loop", title: "Easy loops, ponds & gardens", note: "" },
    { kind: "woods", title: "Woods, hills & longer hikes", note: "" },
  ];
  function outsideList(areaId) {
    const places = events.filter((e) => e.trail && !e.sessions && inArea(e, areaId));
    const order = (a, b) => (origin ? distanceMiles(origin, a) - distanceMiles(origin, b) : a.title.localeCompare(b.title));
    return OUTSIDE_GROUPS.map((g) => ({ ...g, items: places.filter((e) => e.trail === g.kind).sort(order) })).filter((g) => g.items.length);
  }
  const outsideDeck = (areaId) => outsideList(areaId).flatMap((g) => g.items.map((e) => e.id));
  function renderOutside(areaId) {
    outsideArea = areaId;
    $("outsideAreas").innerHTML = AREAS.map((a) =>
      `<button type="button" class="chip${a.id === areaId ? " on" : ""}" data-outsidearea="${a.id}" aria-pressed="${a.id === areaId}">${escapeHtml(a.id === "all" ? "Everywhere" : a.area)}</button>`).join("");
    let i = 0;
    $("outsideList").innerHTML = outsideList(areaId).map((g) => `<section class="slot"><h3>${escapeHtml(g.title)}${g.note ? ` <span>${escapeHtml(g.note)}</span>` : ""}</h3><ul class="rows">${
      g.items.map((e, k) => {
        const meta = [e.city.replace(/, MA$/, ""), milesText(e), e.price === 0 ? "Free" : ""].filter(Boolean).map(escapeHtml).join(" · ");
        return `<li${k >= 6 ? ' class="more" hidden' : ""}><button type="button" class="row" data-outsideopen="${i++}">
          <span class="row-time small">${e.miles ? `${e.miles} mi` : "🌲"}${e.surface ? `<br><span class="sub">${escapeHtml(e.surface)}</span>` : ""}</span>
          <span class="row-main">
            <span class="row-title">${escapeHtml(e.title)}${saved.has(e.id) ? ' <span class="row-saved" aria-label="saved">♥</span>' : ""}</span>
            <span class="row-meta">${meta}</span>
          </span>
          <span class="row-arrow" aria-hidden="true">›</span>
        </button></li>`;
      }).join("")}</ul>${g.items.length > 6 ? `<button type="button" class="show-more" data-showmore>Show ${g.items.length - 6} more</button>` : ""}</section>`).join("")
      || `<div class="nothing"><p class="nothing-title">Nothing listed in this area yet.</p><p><a class="inline-link" href="#/outside/all">See everywhere →</a></p></div>`;
  }

  const dayDeck = (areaId, day) => [...eventsOn(areaId, day).map((x) => x.e.id), ...ongoingIn(areaId).map((e) => e.id)];
  const goDay = (areaId, d) => { location.hash = `#/day/${areaId}/${ymd(d)}`; };

  function renderWeekend() {
    const w = weekendWindow();
    const sun = addDays(w.friday, 2);
    $("weekendPreviewTitle").textContent = `This weekend's good things · ${mdFmt.format(w.friday)}–${sun.getDate()}`;
    const picks = weekendPicks();
    if (!picks.length) {
      $("weekendList").innerHTML = `<p class="hint-static">Nothing listed for this weekend yet — sign up and we'll send the latest on Thursday.</p>`;
      return;
    }
    const groups = new Map();
    picks.forEach((x, i) => {
      const d = x.s.start < w.from ? w.from : x.s.start;
      const label = d.getDay() === 5 ? "Friday evening" : DAYS[d.getDay()];
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push({ ...x, i });
    });
    $("weekendList").innerHTML = [...groups].map(([label, items]) => `<section class="slot"><h3>${label}</h3><ul class="rows">${
      items.map(({ e, s, i }) => `<li><button type="button" class="row" data-weekopen="${i}">
        <span class="row-time">${e.allDay ? "All day" : shortTime(s.start)}</span>
        <span class="row-main">
          <span class="row-title">${escapeHtml(e.title)}</span>
          <span class="row-meta">${[e.venue, e.city.replace(/, MA$/, ""), priceLabel(e) === "Price: ask the host" ? "" : priceLabel(e)].filter(Boolean).map(escapeHtml).join(" · ")}</span>
          <span class="row-cat">${escapeHtml(catLabel(e.category))}</span>
        </span>
        <span class="row-arrow" aria-hidden="true">›</span>
      </button></li>`).join("")}</ul></section>`).join("");
  }

  // ---------- Share something good (hosts, and people recommending things they love) ----------
  let submitArea = null;

  // Hosts give us the details; someone recommending a thing just tells us about it.
  function applyWho(form) {
    const host = (form.elements.who.value || "host") === "host";
    form.querySelectorAll("[data-for]").forEach((el) => { el.hidden = (el.dataset.for === "host") !== host; });
    for (const name of ["url", "contactName", "contactEmail"]) form.elements[name].required = host;
  }

  function renderSubmit() {
    $("submitDone").hidden = true;
    $("submitForm").hidden = false;
    $("submitAreas").innerHTML = AREAS.filter((a) => a.id !== "all").map((a) =>
      `<button type="button" class="area${a.id === submitArea ? " on" : ""}" data-submitarea="${a.id}" aria-pressed="${a.id === submitArea}">
        <span class="area-name">${escapeHtml(a.area)}</span>
        <span class="area-towns">${escapeHtml(a.towns.slice(0, 4).map((t) => t.name).join(", "))}…</span>
      </button>`).join("");
    $("submitRest").hidden = !submitArea;
    applyWho($("submitForm"));
    const towns = submitArea ? areaById.get(submitArea).towns : allTowns;
    $("submitTowns").innerHTML = towns.map((t) => `<option value="${escapeHtml(t.name)}">`).join("");
  }

  const slug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);

  // Build a ready-to-paste entry for data/events.js from the form.
  function buildEntry(f) {
    const v = (k) => (f.get(k) || "").toString().trim();
    const town = v("town");
    const t = allTowns.find((x) => x.name.toLowerCase() === town.toLowerCase())
      || (submitArea && areaById.get(submitArea).towns[0]);
    const kind = v("kind");
    const entry = { id: "", title: v("title"), category: v("category") || "TODO" };
    if (kind === "once" && !v("date")) {
      entry.start = "TODO-YYYY-MM-DDTHH:MM";
    } else if (kind === "once") {
      entry.start = v("time") ? `${v("date")}T${v("time")}` : v("date");
      if (v("endTime") && v("time")) entry.end = `${v("date")}T${v("endTime")}`;
    } else if (kind === "weekly") {
      entry.weekly = { day: v("day"), time: v("wTime"), ...(v("wEndTime") ? { endTime: v("wEndTime") } : {}), from: v("from"), until: v("until") };
    } else {
      entry.schedule = v("schedule");
    }
    Object.assign(entry, {
      venue: v("venue") || "TODO", address: v("address") || "TODO", city: `${town}, MA`,
      lat: t ? t.lat : null, lng: t ? t.lng : null,
      price: f.get("free") ? 0 : (v("price") && !isNaN(parseFloat(v("price"))) ? parseFloat(v("price")) : null),
    });
    if (v("priceNote")) entry.priceNote = v("priceNote");
    Object.assign(entry, { host: v("host"), description: v("description") || "TODO — see the link", url: v("url") });
    if (v("phone")) entry.phone = v("phone");
    entry.id = slug(`${entry.title} ${town} ${kind === "once" ? v("date") : ""}`);
    return entry;
  }

  function validateSubmit(form) {
    const f = new FormData(form);
    const v = (k) => (f.get(k) || "").toString().trim();
    const missing = [];
    for (const el of form.querySelectorAll("[required]")) {
      if (el.closest("[hidden]")) continue;
      if (el.type === "checkbox" ? !el.checked : !el.value.trim()) missing.push(el);
    }
    for (const name of ["url", "updatesUrl"]) {
      const el = form.elements[name];
      if (el.value && !el.checkValidity()) missing.push(el);
    }
    const email = form.elements.contactEmail;
    if (email.value && !email.checkValidity()) missing.push(email);
    form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
    missing.forEach((el) => el.classList.add("invalid"));
    return missing;
  }

  async function sendSubmission(form) {
    const f = new FormData(form);
    if (f.get("_gotcha")) return true;                       // a bot filled the hidden field
    const entry = buildEntry(f);
    const areaName = areaById.get(submitArea).area;
    const tip = f.get("who") === "fan";
    const payload = {
      _subject: `${tip ? "New tip" : "New listing"} for Good Nearby: ${entry.title}`,
      area: areaName,
      ...Object.fromEntries([...f.entries()].filter(([k]) => k !== "_gotcha")),
      paste_into_events_js: JSON.stringify(entry, null, 2) + ",",
    };
    if (!SUBMISSIONS.formspreeId) return "not-configured";
    const res = await fetch(`https://formspree.io/f/${encodeURIComponent(SUBMISSIONS.formspreeId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  }

  function renderSaved() {
    const list = events.filter((e) => saved.has(e.id)).sort(bySoonest);
    $("savedLede").textContent = list.length
      ? "Saved on this device. Tap one to open it."
      : "Nothing saved yet. Tap ♡ Save on anything that looks good.";
    $("savedExtras").hidden = !list.length;
    $("sendSaved").innerHTML = '<span aria-hidden="true">📱</span> Text my saved list to myself';
    $("savedList").innerHTML = list.map((e) => `
      <li>
        <button type="button" class="saved-item" data-open="${escapeHtml(e.id)}">
          <span class="saved-when">${whenBig(e)}</span>
          <span class="saved-name">${escapeHtml(e.title)}</span>
          <span class="saved-where">${escapeHtml(e.venue)} · ${escapeHtml(e.city.replace(/, MA$/, ""))}</span>
        </button>
        <button type="button" class="saved-remove" data-unsave="${escapeHtml(e.id)}" aria-label="Remove ${escapeHtml(e.title)}">×</button>
      </li>`).join("");
    updateSavedPill();
  }

  // ---------- routing ----------
  const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");

  function route() {
    const hash = location.hash.replace(/^#\/?/, "");
    const parts = hash.split("/");
    const [kind, arg, idx] = parts;

    if (kind === "m" && arg) {
      state.day = null;
      if (state.mood !== arg || !state.deck.length) {
        state.mood = arg;
        state.deck = buildDeck(arg);
      }
      if (state.deckBuiltFor !== arg) { state.limit = (MOODS.some((m) => m.id === arg) || arg === "surprise") ? 3 : Infinity; state.deckBuiltFor = arg; }
      state.base = `#/m/${arg}`;
      state.back = arg === "saved" ? { href: "#/saved", label: "← Back to saved" }
        : arg === "weekend" ? { href: "#/weekend", label: "← Back to Weekend Favorites" } : null;
      setPickBack();
      state.index = Math.min(Math.max(parseInt(idx, 10) || 0, 0), state.deck.length);
      showScreen("pick");
      renderPick(true);
      return;
    }
    if (kind === "d" && areaById.has(arg) && validDate(parts[2])) {
      const day = parseLocal(parts[2]);
      const key = `d:${arg}:${parts[2]}`;
      if (state.mood !== key || !state.deck.length) {
        state.mood = key;
        state.deck = dayDeck(arg, day);
      }
      state.day = day;
      state.base = `#/d/${arg}/${parts[2]}`;
      state.back = { href: `#/day/${arg}/${parts[2]}`, label: `← Back to ${dayWord(day)}` };
      setPickBack();
      state.index = Math.min(Math.max(parseInt(parts[3], 10) || 0, 0), state.deck.length);
      showScreen("pick");
      renderPick(true);
      return;
    }
    if (kind === "e" && arg && byId.has(decodeURIComponent(arg))) {
      state.mood = `e:${arg}`; state.deck = [decodeURIComponent(arg)]; state.limit = Infinity; state.deckBuiltFor = null;
      state.day = null; state.base = `#/e/${arg}`; state.back = null; setPickBack();
      state.index = 0; showScreen("pick"); renderPick(true);
      return;
    }
    if (kind === "fp" && arg && areaById.has(parts[2])) {
      const key = decodeURIComponent(arg), deckKey = `fp:${key}:${parts[2]}`;
      if (state.mood !== deckKey || !state.deck.length) { state.mood = deckKey; state.deck = findDeck(key, parts[2]); }
      state.limit = Infinity; state.deckBuiltFor = null; state.day = null;
      state.base = `#/fp/${arg}/${parts[2]}`;
      state.back = { href: `#/find/${arg}/${parts[2]}`, label: "← Back to the list" };
      setPickBack();
      state.index = Math.min(Math.max(parseInt(parts[3], 10) || 0, 0), state.deck.length);
      showScreen("pick");
      renderPick(true);
      return;
    }
    if (kind === "op" && areaById.has(arg)) {
      const key = `op:${arg}`;
      if (state.mood !== key || !state.deck.length) { state.mood = key; state.deck = outsideDeck(arg); }
      state.limit = Infinity; state.deckBuiltFor = null; state.day = null;
      state.base = `#/op/${arg}`;
      state.back = { href: `#/outside/${arg}`, label: "← Back to trails" };
      setPickBack();
      state.index = Math.min(Math.max(parseInt(parts[2], 10) || 0, 0), state.deck.length);
      showScreen("pick");
      renderPick(true);
      return;
    }
    if (kind === "p" && areaById.has(arg)) {
      const key = `p:${arg}`;
      if (state.mood !== key || !state.deck.length) { state.mood = key; state.deck = wanderDeck(arg); }
      state.day = null;
      state.base = `#/p/${arg}`;
      state.back = { href: `#/wander/${arg}`, label: "← Back to cozy places" };
      setPickBack();
      state.index = Math.min(Math.max(parseInt(parts[2], 10) || 0, 0), state.deck.length);
      showScreen("pick");
      renderPick(true);
      return;
    }
    state.day = null;
    if (kind === "wander") {
      const areaId = areaById.has(arg) ? arg : (browseArea || "all");
      renderWander(areaId);
      showScreen("wander");
      $("wanderTitle").focus({ preventScroll: true });
      updateSavedPill();
      return;
    }
    if (kind === "outside") {
      renderOutside(areaById.has(arg) ? arg : (browseArea || "all"));
      showScreen("outside");
      $("outsideTitle").focus({ preventScroll: true });
      updateSavedPill();
      return;
    }
    if (kind === "find" && arg) {
      renderFind(decodeURIComponent(arg), areaById.has(parts[2]) ? parts[2] : "all");
      showScreen("find");
      $("findTitle").focus({ preventScroll: true });
      updateSavedPill();
      return;
    }
    if (kind === "submit") {
      renderSubmit();
      showScreen("submit");
      $("submitTitle").focus({ preventScroll: true });
      updateSavedPill();
      return;
    }
    if (kind === "weekend") {
      renderWeekend();
      fillAreaPicks();
      // Buttondown sends people back here: #/weekend/thanks after signing up, #/weekend/confirmed after confirming.
      const note = $("signupNote");
      note.classList.toggle("saved-note", arg === "thanks" || arg === "confirmed");
      if (arg === "thanks") note.textContent = "Almost there! Check your inbox and tap the link in our email to confirm. 🌻";
      else if (arg === "confirmed") note.textContent = "You're in! Your first Weekend Favorites arrives on Thursday. 🌻";
      showScreen("weekend");
      $("weekendTitle").focus({ preventScroll: true });
      updateSavedPill();
      return;
    }
    if (kind === "browse") {
      renderBrowse();
      showScreen("browse");
      $("browseTitle").focus({ preventScroll: true });
      updateSavedPill();
      return;
    }
    if (kind === "day" && areaById.has(arg)) {
      browseArea = arg;
      store("goodNearby.area", arg);
      const day = validDate(parts[2]) ? parseLocal(parts[2]) : startOfDay(now);
      renderDay(arg, day);
      showScreen("day");
      $("dayTitle").focus({ preventScroll: true });
      updateSavedPill();
      return;
    }
    if (kind === "saved") {
      const incoming = (arg || "").split(",").map((id) => { try { return decodeURIComponent(id); } catch (_) { return ""; } })
        .filter((id) => byId.has(id));
      const added = incoming.filter((id) => !saved.has(id));
      added.forEach((id) => saved.add(id));
      if (arg) {
        store("goodNearby.saved", [...saved]);
        history.replaceState(null, "", "#/saved");
        const gone = arg.split(",").length - incoming.length;
        $("savedNote").textContent = (added.length ? `Added ${added.length} from your link — they're saved on this device now.`
          : "Everything from your link is already saved here.") + (gone ? ` ${gone} ${gone === 1 ? "has" : "have"} already passed.` : "");
      }
      $("savedNote").hidden = !arg;
      showScreen("saved");
      renderSaved();
      $("savedTitle").setAttribute("tabindex", "-1");
      $("savedTitle").focus({ preventScroll: true });
      return;
    }
    state.mood = null;
    state.deck = [];
    showScreen("start");
    renderStart();
    updateSavedPill();
  }

  function setPickBack() {
    const link = $("pickBack");
    link.href = state.back ? state.back.href : "#/";
    link.textContent = state.back ? state.back.label : "← Start over";
  }

  // Moving between cards replaces the URL (so Back returns to the question, not every card).
  function goTo(index) {
    state.index = Math.min(Math.max(index, 0), state.deck.length);
    history.replaceState(null, "", `${state.base}/${state.index}`);
    renderPick(true);
  }

  // ---------- interactions ----------
  document.addEventListener("click", (ev) => {
    const area = ev.target.closest("[data-area]");
    if (area) {
      browseArea = area.dataset.area;
      store("goodNearby.area", browseArea);
      renderBrowse();
      $("dayGrid").scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    const date = ev.target.closest("[data-date]");
    if (date && browseArea) { goDay(browseArea, parseLocal(date.dataset.date)); return; }
    const gotoBtn = ev.target.closest("[data-goto]");
    if (gotoBtn) { goDay(dayView.area, parseLocal(gotoBtn.dataset.goto)); return; }
    const shift = ev.target.closest("[data-shift]");
    if (shift && dayView.day) { goDay(dayView.area, addDays(dayView.day, Number(shift.dataset.shift))); return; }
    if (ev.target.closest("#submitAnother")) { ev.preventDefault(); renderSubmit(); $("submitTitle").focus(); return; }
    const subArea = ev.target.closest("[data-submitarea]");
    if (subArea) {
      submitArea = subArea.dataset.submitarea;
      renderSubmit();
      $("submitForm").elements.title.focus();
      return;
    }
    const weekOpen = ev.target.closest("[data-weekopen]");
    if (weekOpen) {
      state.mood = "weekend";
      state.deck = buildDeck("weekend");
      location.hash = `#/m/weekend/${weekOpen.dataset.weekopen}`;
      return;
    }
    const more = ev.target.closest("[data-showmore]");
    if (more) { more.closest(".slot").querySelectorAll("li.more").forEach((li) => { li.hidden = false; }); more.remove(); return; }
    const oArea = ev.target.closest("[data-outsidearea]");
    if (oArea) { location.hash = `#/outside/${oArea.dataset.outsidearea}`; return; }
    const oOpen = ev.target.closest("[data-outsideopen]");
    if (oOpen) { location.hash = `#/op/${outsideArea}/${oOpen.dataset.outsideopen}`; return; }
    const fArea = ev.target.closest("[data-findarea]");
    if (fArea) { location.hash = `#/find/${encodeURIComponent(findView.key)}/${fArea.dataset.findarea}`; return; }
    const fOpen = ev.target.closest("[data-findopen]");
    if (fOpen) { location.hash = `#/fp/${encodeURIComponent(findView.key)}/${findView.area}/${fOpen.dataset.findopen}`; return; }
    const wArea = ev.target.closest("[data-wanderarea]");
    if (wArea) { location.hash = `#/wander/${wArea.dataset.wanderarea}`; return; }
    const wOpen = ev.target.closest("[data-wanderopen]");
    if (wOpen) {
      state.deck = [];
      location.hash = `#/p/${wanderArea}/${wOpen.dataset.wanderopen}`;
      return;
    }
    const dayOpen = ev.target.closest("[data-dayopen]");
    if (dayOpen) {
      state.deck = [];
      location.hash = `#/d/${dayView.area}/${ymd(dayView.day)}/${dayOpen.dataset.dayopen}`;
      return;
    }

    const mood = ev.target.closest("[data-mood]");
    if (mood) {
      state.deck = [];                       // always build a fresh deck from the start screen
      const id = mood.dataset.mood;
      location.hash = id === "wander" ? "#/wander" : id === "outside" ? "#/outside" : `#/m/${id}/0`;
      return;
    }

    const act = ev.target.closest("[data-act]");
    if (act) {
      const e = byId.get(state.deck[state.index]);
      switch (act.dataset.act) {
        case "next": goTo(state.index + 1); break;
        case "prev": goTo(state.index - 1); break;
        case "save":
          if (saved.has(e.id)) saved.delete(e.id); else saved.add(e.id);
          store("goodNearby.saved", [...saved]);
          renderPick(false);
          break;
        case "go": {
          const panel = $("goPanel");
          panel.hidden = !panel.hidden;
          act.setAttribute("aria-expanded", String(!panel.hidden));
          act.classList.toggle("on", !panel.hidden);
          if (!panel.hidden) panel.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
          break;
        }
        case "calendar": downloadIcs(e); break;
        case "more": state.limit += 3; renderPick(true); break;
        case "share": shareListing(e, act); break;
      }
      return;
    }

    const open = ev.target.closest("[data-open]");
    if (open) {
      state.mood = "saved";
      state.deck = buildDeck("saved");
      location.hash = `#/m/saved/${Math.max(state.deck.indexOf(open.dataset.open), 0)}`;
      return;
    }

    const send = ev.target.closest("#sendSaved");
    if (send) { sendSavedList(send); return; }

    const unsave = ev.target.closest("[data-unsave]");
    if (unsave) {
      saved.delete(unsave.dataset.unsave);
      $("savedNote").hidden = true;
      store("goodNearby.saved", [...saved]);
      renderSaved();
    }
  });

  // Keyboard: → next, ← back, S save (only while looking at a card).
  document.addEventListener("keydown", (ev) => {
    if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.target.closest("input, textarea, select")) return;
    if (document.body.dataset.screen === "day") {
      if (ev.key === "ArrowRight") { ev.preventDefault(); goDay(dayView.area, addDays(dayView.day, 1)); }
      else if (ev.key === "ArrowLeft" && dayView.day > startOfDay(now)) { ev.preventDefault(); goDay(dayView.area, addDays(dayView.day, -1)); }
      return;
    }
    if (document.body.dataset.screen !== "pick") return;
    if (ev.target.closest("input, textarea, select")) return;
    if (ev.key === "ArrowRight") { ev.preventDefault(); goTo(state.index + 1); }
    else if (ev.key === "ArrowLeft" && state.index > 0) { ev.preventDefault(); goTo(state.index - 1); }
    else if (ev.key.toLowerCase() === "s" && state.index < state.deck.length) $("pickCard").querySelector('[data-act="save"]')?.click();
  });

  // Swipe left for next, right for back.
  let touchX = null, touchY = null;
  $("pickCard").addEventListener("touchstart", (ev) => { touchX = ev.touches[0].clientX; touchY = ev.touches[0].clientY; }, { passive: true });
  $("pickCard").addEventListener("touchend", (ev) => {
    if (touchX === null) return;
    const dx = ev.changedTouches[0].clientX - touchX;
    const dy = ev.changedTouches[0].clientY - touchY;
    touchX = touchY = null;
    if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) goTo(state.index + 1);
    else if (state.index > 0) goTo(state.index - 1);
  });

  $("otherDate").addEventListener("change", (ev) => {
    if (ev.target.value && browseArea) goDay(browseArea, parseLocal(ev.target.value));
  });

  // Swipe on the day view to change days.
  let dayTouchX = null, dayTouchY = null;
  $("screenDay").addEventListener("touchstart", (ev) => { dayTouchX = ev.touches[0].clientX; dayTouchY = ev.touches[0].clientY; }, { passive: true });
  $("screenDay").addEventListener("touchend", (ev) => {
    if (dayTouchX === null) return;
    const dx = ev.changedTouches[0].clientX - dayTouchX;
    const dy = ev.changedTouches[0].clientY - dayTouchY;
    dayTouchX = dayTouchY = null;
    if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) goDay(dayView.area, addDays(dayView.day, 1));
    else if (dayView.day > startOfDay(now)) goDay(dayView.area, addDays(dayView.day, -1));
  });

  // Hosts' form: show the right date fields, hide price when free, and send.
  const submitForm = $("submitForm");
  submitForm.addEventListener("change", (ev) => {
    if (ev.target.name === "who") applyWho(submitForm);
    if (ev.target.name === "kind") {
      submitForm.querySelectorAll(".when-fields").forEach((el) => { el.hidden = el.dataset.kind !== ev.target.value; });
    }
    if (ev.target.name === "free") submitForm.querySelector(".price-field").hidden = ev.target.checked;
    if (ev.target.classList.contains("invalid")) ev.target.classList.remove("invalid");
  });
  submitForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const missing = validateSubmit(submitForm);
    if (missing.length) {
      $("submitError").textContent = "A few details are still needed — they're outlined above.";
      missing[0].focus();
      return;
    }
    $("submitError").textContent = "";
    const btn = submitForm.querySelector(".submit-btn");
    btn.disabled = true;
    btn.textContent = "Sending…";
    let result;
    try { result = await sendSubmission(submitForm); } catch (_) { result = false; }
    btn.disabled = false;
    btn.textContent = "Send for review";
    if (result === false) {
      $("submitError").textContent = "Something went wrong sending that. Please try again in a moment.";
      return;
    }
    if (result === "not-configured") {
      $("submitDoneTitle").textContent = "Thank you — almost there!";
      $("submitDoneText").textContent = "Online listing is being set up this week, so your details haven't been sent yet. Please check back soon — we'd love to include you.";
    } else {
      $("submitDoneTitle").textContent = "Thank you — it's on its way!";
      $("submitDoneText").textContent = "We'll take a look and add it to Good Nearby, usually within a week.";
      submitForm.reset();
      submitForm.querySelectorAll(".when-fields").forEach((el) => { el.hidden = el.dataset.kind !== "once"; });
      submitForm.querySelector(".price-field").hidden = false;
      submitForm.querySelector(".more-details").open = false;
      applyWho(submitForm);
    }
    submitForm.hidden = true;
    $("submitDone").hidden = false;
    $("submitDoneTitle").focus();
    window.scrollTo(0, 0);
  });

  // Weekend Favorites sign-up (on the first screen and the Weekend Favorites page).
  // The chosen area is sent to Buttondown as a tag, so each area can get its own edition.
  function fillAreaPicks() {
    const near = browseArea && browseArea !== "all" ? browseArea : "";
    document.querySelectorAll("select.area-pick").forEach((sel) => {
      if (!NEWSLETTER.askArea) { sel.remove(); return; }
      const chosen = sel.value || (near && areaById.get(near).area) || "";
      sel.innerHTML = `<option value="" disabled ${chosen ? "" : "selected"}>Your area…</option>` +
        AREAS.filter((a) => a.id !== "all").map((a) => `<option ${a.area === chosen ? "selected" : ""}>${escapeHtml(a.area)}</option>`).join("") +
        `<option value="Everywhere" ${chosen === "Everywhere" ? "selected" : ""}>A bit of everywhere</option>`;
    });
  }
  fillAreaPicks();
  document.querySelectorAll("form[data-signup]").forEach((signup) => {
    const note = signup.nextElementSibling;
    if (NEWSLETTER.buttondownUsername) {
      signup.action = `https://buttondown.com/api/emails/embed-subscribe/${encodeURIComponent(NEWSLETTER.buttondownUsername)}`;
    }
    signup.addEventListener("submit", (ev) => {
      if (!NEWSLETTER.buttondownUsername) {
        ev.preventDefault();
        note.textContent = "Thank you! Sign-ups open very soon — we haven't saved your email yet, so please check back.";
        return;
      }
      // The form posts to Buttondown in a new tab, which asks the person to confirm by email.
      note.textContent = "Almost done — check your inbox for a confirmation email. 🌻";
      setTimeout(() => signup.reset(), 500);
    });
  });

  // ---------- "Where are you?" — asked once, remembered on this device ----------
  function renderWhere(note) {
    const box = $("whereBox");
    if (origin) {
      box.innerHTML = `<p class="where-set">📍 Near <strong>${escapeHtml(origin.name || "you")}</strong> · closest first
        <button type="button" class="inline-link" id="whereChange">change</button></p>`;
      return;
    }
    box.innerHTML = `<label class="visually-hidden" for="whereTown">Where are you?</label>
      <div class="where-row">
        <input id="whereTown" list="whereTowns" placeholder="📍 Your town" autocomplete="address-level2">
        <button type="button" class="where-btn" id="whereGeo" aria-label="Use my location">Near me</button>
      </div>
      <datalist id="whereTowns">${allTowns.map((t) => `<option value="${escapeHtml(t.name)}">`).join("")}</datalist>
      ${note ? `<p class="hint">${note}</p>` : ""}`;
  }
  function setOrigin(o) {
    origin = o; store("goodNearby.origin", o);
    const near = o && allTowns.reduce((b, t) => (distanceMiles(o, t) < distanceMiles(o, b) ? t : b), allTowns[0]);
    if (near) { browseArea = near.areaId; store("goodNearby.area", browseArea); }
    events.forEach((e) => { e.area = areaOf(e); });
    state.deck = []; state.deckBuiltFor = null;
    renderWhere();
    fillAreaPicks();
  }
  document.addEventListener("change", (ev) => {
    if (ev.target.id !== "whereTown") return;
    const t = allTowns.find((x) => x.name.toLowerCase() === ev.target.value.trim().toLowerCase());
    if (t) setOrigin({ lat: t.lat, lng: t.lng, name: t.name });
    else renderWhere("We don't know that town yet — try a nearby one, or use your location.");
  });
  document.addEventListener("click", (ev) => {
    if (ev.target.id === "whereChange") { origin = null; store("goodNearby.origin", null); renderWhere(); $("whereTown")?.focus(); }
    if (ev.target.id !== "whereGeo") return;
    if (!("geolocation" in navigator)) { renderWhere("Your browser can't share location — type your town instead."); return; }
    ev.target.textContent = "Finding you…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const o = { lat: +pos.coords.latitude.toFixed(2), lng: +pos.coords.longitude.toFixed(2) };
        const near = allTowns.reduce((b, t) => (distanceMiles(o, t) < distanceMiles(o, b) ? t : b), allTowns[0]);
        setOrigin({ ...o, name: near ? near.name : "you" });
      },
      () => renderWhere("No worries — type your town instead, or skip it."),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });

  window.addEventListener("hashchange", route);
  route();
})();
