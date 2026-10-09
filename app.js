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
//   #/saved                   events saved on this device
(function () {
  "use strict";

  // ---------- newsletter ----------
  // Weekend Favorites sign-ups go to Buttondown (buttondown.com). Put your Buttondown
  // username here once your account exists — until then the form says sign-ups open soon
  // and nothing is collected.
  const NEWSLETTER = { buttondownUsername: "" };

  // ---------- event submissions ----------
  // "Share something good" sends each submission to Formspree (formspree.io), which emails it
  // to you. Put your Formspree form id here (the part after /f/ in its address). Until then the
  // form explains that online submissions are being set up, and nothing is sent.
  const SUBMISSIONS = { formspreeId: "" };

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
    hike:       { label: "Hike",               photo: "https://images.pexels.com/photos/19141785/pexels-photo-19141785.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    movement:   { label: "Movement & dance",   photo: "https://images.pexels.com/photos/36715608/pexels-photo-36715608.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    shop:       { label: "Holistic shop",      photo: "https://images.pexels.com/photos/3610753/pexels-photo-3610753.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    cafe:       { label: "Cozy café",          photo: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    craft:      { label: "Creative class",     photo: "https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    book:       { label: "Book group",         photo: "https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&w=1100" },
    bakery:     { label: "Cozy bakery",        photo: "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1100" },
  };
  const catLabel = (k) => (CATEGORY[k] ? CATEGORY[k].label : k);

  const ICONS = {
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
    { id: "care",   label: "Be cared for",          hint: "Massage · reiki · acupuncture",   tone: "#f0d3c4", ink: "#9a5236",
      match: (e) => ["massage", "reiki", "acupuncture"].includes(e.category) },
    { id: "make",   label: "Make something good",   hint: "Pottery · painting · flowers · cooking",   tone: "#ddd0e6", ink: "#5e4670",
      match: (e) => e.category === "craft" },
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
    } else if (e.start) {
      out.allDay = !e.start.includes("T");
      const start = parseLocal(e.start);
      let end = e.end ? parseLocal(e.end) : null;
      if (out.allDay) end = addDays(end || start, 1);          // through the end of the last day
      out.hasEnd = Boolean(e.end);
      out.sessions = [{ start, end: end || new Date(start.getTime() + 60 * 60 * 1000) }];
    }
    if (out.sessions) {
      out.sessions = out.sessions.filter((s) => s.end >= now);
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
  function areaOf(e) {
    const name = e.city.replace(/, MA$/, "").trim().toLowerCase();
    const match = allTowns.find((t) => t.name.toLowerCase() === name);
    if (match) return match.areaId;
    let best = null, bestMi = Infinity;
    for (const t of allTowns) { const mi = distanceMiles(e, t); if (mi < bestMi) { best = t; bestMi = mi; } }
    return best ? best.areaId : null;
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
    if (s.start <= now && now < s.end) return "Happening right now";
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
    if (!e.sessions) return escapeHtml(e.schedule || "Ongoing");
    const s = sessionFor(e);
    if (e.allDay) {
      const lastDay = addDays(s.end, -1);
      return ymd(lastDay) === ymd(s.start) ? dayWord(s.start) : `${dayWord(s.start)} – ${dayWord(lastDay)}`;
    }
    return `${dayWord(s.start)} · ${timeFmt.format(s.start)}`;
  }

  function whenSmall(e) {
    if (!e.sessions) return "Whenever works for you — check their schedule";
    const s = sessionFor(e);
    const parts = [countdown(s)];
    if (e.weekly) parts.push(`every ${e.weekly.day} until ${mdFmt.format(e.sessions[e.sessions.length - 1].start)}`);
    else if (!e.allDay && e.hasEnd) parts.push(`ends ${timeFmt.format(s.end)}`);
    return parts.join(" · ");
  }

  const TAG_LABELS = { free: "Free", "come-alone": "Come alone", beginner: "Beginner-friendly",
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
  const milesText = (e) => {
    if (!origin) return "";
    const d = distanceMiles(origin, e);
    return `${d < 10 ? d.toFixed(1) : Math.round(d)} mi away`;
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
    if (moodId === "surprise") {
      // Something soon first, then everything else — all in a fresh order.
      const soon = events.filter((e) => e.next && e.next.start - now < 14 * DAY_MS);
      const rest = events.filter((e) => !soon.includes(e));
      return [...shuffle(soon), ...shuffle(rest)].map((e) => e.id);
    }
    const mood = MOODS.find((m) => m.id === moodId);
    if (!mood) return [];
    const list = events.filter(mood.match);
    if (origin) {
      // Closest first, but dated events before open-ended ones.
      list.sort((a, b) => (Boolean(b.next) - Boolean(a.next)) || distanceMiles(origin, a) - distanceMiles(origin, b));
    } else {
      list.sort(bySoonest);
    }
    return list.map((e) => e.id);
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
  const screens = { start: $("screenStart"), browse: $("screenBrowse"), day: $("screenDay"), weekend: $("screenWeekend"), submit: $("screenSubmit"), pick: $("screenPick"), saved: $("screenSaved") };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // base: the URL prefix for the current deck; day: the chosen day when browsing by day
  const state = { mood: null, deck: [], index: 0, base: "", day: null, back: null };

  function showScreen(name) {
    Object.entries(screens).forEach(([k, el]) => { el.hidden = k !== name; });
    document.body.dataset.screen = name;
    window.scrollTo(0, 0);
  }

  function updateSavedPill() {
    $("savedPill").hidden = saved.size === 0;
    $("savedCount").textContent = saved.size;
  }

  function renderStart() {
    $("moods").innerHTML = MOODS.map((m) => `
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
    $("nearMe").checked = Boolean(origin);
    $("nearNote").textContent = origin ? "Using your location — it stays on this device." : "";
  }

  function photo(e, w) {
    const cat = CATEGORY[e.category];
    // A photo that fails to load is removed, leaving the warm gradient behind it.
    return cat ? `<img src="${unsplash(cat.photo, w)}" alt="" onerror="this.remove()">` : "";
  }

  function renderPick(focusTitle) {
    const card = $("pickCard");
    const total = state.deck.length;

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
    $("progress").innerHTML =
      `${state.index > 0 ? '<button type="button" class="quiet-link" data-act="prev">‹ Back</button>' : ""}` +
      `<span>${state.index + 1} of ${total}</span>`;

    const where = [e.venue, e.city.replace(/, MA$/, ""), milesText(e)].filter(Boolean).map(escapeHtml).join(" · ");
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.venue, e.address, e.city].filter(Boolean).join(", "))}`;

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

        <div class="go-panel" id="goPanel" hidden>
          <p class="go-title">Nice. Here's what you need:</p>
          <div class="go-actions">
            ${e.sessions ? '<button type="button" class="go-btn" data-act="calendar"><span aria-hidden="true">📅</span> Add to my calendar</button>' : ""}
            <a class="go-btn" href="${mapUrl}" target="_blank" rel="noopener"><span aria-hidden="true">📍</span> Directions</a>
            ${e.url ? `<a class="go-btn" href="${escapeHtml(e.url)}" target="_blank" rel="noopener"><span aria-hidden="true">🎟️</span> ${e.sessions ? "Sign up / details" : "Book / see schedule"}</a>` : ""}
            ${e.phone ? `<a class="go-btn" href="tel:${escapeHtml(e.phone.replace(/[^\d+]/g, ""))}"><span aria-hidden="true">📞</span> Call ${escapeHtml(e.phone)}</a>` : ""}
          </div>
          <p class="confirm">Details can change — a quick check with the host is always a good idea.</p>
        </div>
      </div>
      <div class="pick-actions">
        <button type="button" class="act ${isSaved ? "on" : ""}" data-act="save" aria-pressed="${isSaved}">
          <span aria-hidden="true">${isSaved ? "♥" : "♡"}</span> ${isSaved ? "Saved" : "Save"}
        </button>
        <button type="button" class="act" data-act="go" aria-expanded="false" aria-controls="goPanel">I'm in</button>
        <button type="button" class="act act-next" data-act="next">${state.index + 1 < total ? "Next" : "Done"} <span aria-hidden="true">→</span></button>
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
          ${extra ? "" : `<span class="row-cat">${escapeHtml(catLabel(e.category))}${e.weekly ? " · weekly" : ""}</span>`}
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
      ? "Saved on this device only. Tap one to open it."
      : "Nothing saved yet. Tap ♡ Save on anything that looks good.";
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
    state.day = null;
    if (kind === "submit") {
      renderSubmit();
      showScreen("submit");
      $("submitTitle").focus({ preventScroll: true });
      updateSavedPill();
      return;
    }
    if (kind === "weekend") {
      renderWeekend();
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
    const dayOpen = ev.target.closest("[data-dayopen]");
    if (dayOpen) {
      state.deck = [];
      location.hash = `#/d/${dayView.area}/${ymd(dayView.day)}/${dayOpen.dataset.dayopen}`;
      return;
    }

    const mood = ev.target.closest("[data-mood]");
    if (mood) {
      state.deck = [];                       // always build a fresh deck from the start screen
      location.hash = `#/m/${mood.dataset.mood}/0`;
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

    const unsave = ev.target.closest("[data-unsave]");
    if (unsave) {
      saved.delete(unsave.dataset.unsave);
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

  // Weekend Favorites sign-up
  const signup = $("signupForm");
  if (NEWSLETTER.buttondownUsername) {
    signup.action = `https://buttondown.com/api/emails/embed-subscribe/${encodeURIComponent(NEWSLETTER.buttondownUsername)}`;
  }
  signup.addEventListener("submit", (ev) => {
    if (!NEWSLETTER.buttondownUsername) {
      ev.preventDefault();
      $("signupNote").textContent = "Thank you! Sign-ups open very soon — we haven't saved your email yet, so please check back.";
      return;
    }
    // The form posts to Buttondown in a new tab, which asks the person to confirm by email.
    $("signupNote").textContent = "Almost done — check your inbox for a confirmation email.";
    setTimeout(() => signup.reset(), 500);
  });

  // "Show what's closest to me first"
  $("nearMe").addEventListener("change", (ev) => {
    const note = $("nearNote");
    if (!ev.target.checked) {
      origin = null;
      store("goodNearby.origin", null);
      note.textContent = "";
      return;
    }
    if (!("geolocation" in navigator)) {
      ev.target.checked = false;
      note.textContent = "Your browser can't share location — we'll show what's soonest instead.";
      return;
    }
    note.textContent = "Finding you…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        origin = { lat: +pos.coords.latitude.toFixed(3), lng: +pos.coords.longitude.toFixed(3) };
        store("goodNearby.origin", origin);
        note.textContent = "Got it — closest first. Your location stays on this device.";
      },
      () => {
        ev.target.checked = false;
        note.textContent = "No worries — we'll show what's soonest instead.";
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });

  window.addEventListener("hashchange", route);
  route();
})();
