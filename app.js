// Good Nearby — pick your town, pick a day, see everything good happening.
//
// Screens (hash routes):
//   #/town                     1. Where do you live?
//   #/when                     2. Which day?  (town remembered on this device)
//   #/day/<town>/<yyyy-mm-dd>  3. Everything that day, near that town
//   #/e/<event-id>             one event, with Save / I'm in
//   #/saved                    events saved on this device
(function () {
  "use strict";

  const NEAR_MILES = 20;   // "near you"
  const FAR_MILES = 40;    // "a bit farther"

  // ---------- categories, photos & moods ----------
  const unsplash = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

  const CATEGORY = {
    yoga:       { label: "Yoga",           photo: "1506126613408-eca07ce68773" },
    meditation: { label: "Meditation",     photo: "1545205597-3d9d02c29597" },
    sound:      { label: "Sound bath",     photo: "1608571423902-eed4a5ad8108" },
    massage:    { label: "Massage",        photo: "1600334089648-b0d9d3028eb2" },
    reiki:      { label: "Reiki & energy", photo: "1544161515-4ab6ce6db874" },
    "tai-chi":  { label: "Tai chi",        photo: "1518611012118-696072aa579a" },
    breathwork: { label: "Breathwork",     photo: "1497250681960-ef046c08a56e" },
    workshop:   { label: "Workshop",       photo: "1529156069898-49953e39b3ac" },
    expo:       { label: "Expo & fair",    photo: "1515169067868-5387ec356754" },
  };
  const catLabel = (k) => (CATEGORY[k] ? CATEGORY[k].label : k);

  const MOODS = [
    { id: "all",    label: "Everything" },
    { id: "move",   label: "Move",          cats: ["yoga", "tai-chi"] },
    { id: "calm",   label: "Calm",          cats: ["meditation", "sound", "breathwork"] },
    { id: "care",   label: "Be cared for",  cats: ["massage", "reiki"] },
    { id: "people", label: "Gatherings",    cats: ["expo", "workshop"] },
  ];

  // ---------- towns ----------
  const AREAS = window.GOOD_NEARBY_TOWNS || [];
  const TOWNS = new Map(AREAS.flatMap((a) => a.towns).map((t) => [t.id, t]));

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
  const today = startOfDay(now);

  // Turn a listing into either dated (sessions[]) or ongoing (no sessions).
  function normalize(e) {
    const out = { ...e, sessions: null, allDay: false };
    if (e.weekly) {
      const w = e.weekly;
      const dow = DAYS.indexOf(w.day);
      const skip = new Set(w.skip || []);
      let d = parseLocal(w.from);
      while (d.getDay() !== dow) d = addDays(d, 1);
      const last = parseLocal(w.until);
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

  // ---------- storage (optional — the site works without it) ----------
  function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* ignore */ }
  }

  let saved = new Set(load("goodNearby.saved", []).filter((id) => byId.has(id)));
  // The chosen place: a town from the list, optionally with precise coordinates from "Use my location".
  let place = load("goodNearby.place", null);
  if (place && !TOWNS.has(place.townId)) place = null;
  let moodFilter = "all";

  const placeName = () => (place ? TOWNS.get(place.townId).name : "");
  const placePoint = () => (place ? (place.lat != null ? place : TOWNS.get(place.townId)) : null);

  // ---------- helpers ----------
  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
  const hourFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric" });
  const shortTime = (d) => (d.getMinutes() ? timeFmt : hourFmt).format(d);   // "10 AM", "5:30 PM"
  const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
  const longFmt = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });
  const mdFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  const monFmt = new Intl.DateTimeFormat(undefined, { month: "short" });

  function dayWord(d) {
    const diff = Math.round((startOfDay(d) - today) / DAY_MS);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff > 1 && diff < 7) return DAYS[d.getDay()];
    return dateFmt.format(d);
  }

  function countdown(s) {
    if (s.start <= now && now < s.end) return "Happening right now";
    const mins = Math.round((s.start - now) / 60000);
    if (mins < 60) return `Starts in ${mins} min`;
    const hours = Math.round(mins / 60);
    if (hours < 12) return `Starts in ${hours} hour${hours === 1 ? "" : "s"}`;
    const days = Math.round((startOfDay(s.start) - today) / DAY_MS);
    if (days <= 1) return days === 0 ? "Later today" : "Tomorrow";
    if (days < 14) return `In ${days} days`;
    return `In about ${Math.round(days / 7)} weeks`;
  }

  function priceLabel(e) {
    if (e.price === 0) return "Free";
    if (typeof e.price === "number") return `$${e.price}`;
    return "";
  }

  function distanceMiles(a, b) {
    const R = 3958.8;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const milesFrom = (e) => (placePoint() ? distanceMiles(placePoint(), e) : null);
  const milesText = (mi) => (mi == null ? "" : mi < 1 ? "in town" : `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} mi`);

  const matchesMood = (e) => {
    const m = MOODS.find((x) => x.id === moodFilter);
    return !m || !m.cats || m.cats.includes(e.category);
  };

  // The session of `e` that falls on `day` (a Date at midnight), if any.
  function sessionOn(e, day) {
    if (!e.sessions) return null;
    const end = addDays(day, 1);
    return e.sessions.find((s) => s.start < end && s.end > day) || null;
  }

  function eventsOn(day, { mood = true } = {}) {
    const out = [];
    for (const e of events) {
      const s = sessionOn(e, day);
      if (!s) continue;
      if (mood && !matchesMood(e)) continue;
      const mi = milesFrom(e);
      if (mi != null && mi > FAR_MILES) continue;
      out.push({ e, s, mi });
    }
    return out.sort((a, b) => a.s.start - b.s.start || (a.mi ?? 0) - (b.mi ?? 0));
  }

  // ---------- calendar file (.ics) ----------
  function icsText(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }
  const icsLocal = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const icsDay = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

  // Adds the chosen session (one date) to the visitor's calendar.
  function downloadIcs(e, s) {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Good Nearby//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${e.id}-${icsDay(s.start)}@goodnearby`,
      `DTSTAMP:${stamp}`,
    ];
    if (e.allDay) lines.push(`DTSTART;VALUE=DATE:${icsDay(s.start)}`, `DTEND;VALUE=DATE:${icsDay(s.end)}`);
    else lines.push(`DTSTART:${icsLocal(s.start)}`, `DTEND:${icsLocal(s.end)}`);
    lines.push(
      `SUMMARY:${icsText(e.title)}`,
      `LOCATION:${icsText([e.venue, e.address, e.city].filter(Boolean).join(", "))}`,
      `DESCRIPTION:${icsText(`${e.description}\n\nHost: ${e.host}${e.url ? `\n${e.url}` : ""}\n\nFound on Good Nearby — please confirm details with the host.`)}`,
    );
    if (e.url) lines.push(`URL:${e.url}`);
    lines.push("BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", `DESCRIPTION:${icsText(e.title)} in 2 hours`, "END:VALARM");
    lines.push("END:VEVENT", "END:VCALENDAR");

    // RFC 5545: lines over 75 octets continue on the next line after a space
    const enc = new TextEncoder();
    const fold = (line) => {
      const out = [];
      let rest = line;
      while (enc.encode(rest).length > 74) {
        let cut = 73;
        while (enc.encode(rest.slice(0, cut)).length > 73) cut--;
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

  // ---------- screens ----------
  const $ = (id) => document.getElementById(id);
  const screens = { town: $("screenTown"), when: $("screenWhen"), day: $("screenDay"), event: $("screenEvent"), saved: $("screenSaved") };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showScreen(name, focusEl) {
    Object.entries(screens).forEach(([k, el]) => { el.hidden = k !== name; });
    document.body.dataset.screen = name;
    window.scrollTo(0, 0);
    updateSavedPill();
    if (focusEl) focusEl.focus({ preventScroll: true });
  }

  function updateSavedPill() {
    $("savedPill").hidden = saved.size === 0;
    $("savedCount").textContent = saved.size;
  }

  // 1. Town
  function renderTowns() {
    const q = $("townFilter").value.trim().toLowerCase();
    const html = AREAS.map((a) => {
      const towns = a.towns.filter((t) => !q || t.name.toLowerCase().includes(q));
      if (!towns.length) return "";
      return `<div class="town-area">
        <h3>${escapeHtml(a.area)}</h3>
        <div class="town-chips">${towns.map((t) =>
          `<button type="button" class="town${place && place.townId === t.id ? " on" : ""}" data-town="${t.id}">${escapeHtml(t.name)}</button>`).join("")}
        </div>
      </div>`;
    }).join("");
    $("townList").innerHTML = html || `<p class="hint-static">No town by that name yet — try a nearby one, or use your location.</p>`;
  }

  function chooseTown(townId, coords) {
    place = { townId, ...(coords || {}) };
    store("goodNearby.place", place);
    location.hash = "#/when";
  }

  function nearestTown(pt) {
    let best = null, bestMi = Infinity;
    for (const t of TOWNS.values()) {
      const mi = distanceMiles(pt, t);
      if (mi < bestMi) { best = t; bestMi = mi; }
    }
    return best;
  }

  // 2. Day grid: the next 14 days, with how many things are on near you.
  function renderWhen() {
    $("whenTown").textContent = placeName();
    const cells = [];
    for (let i = 0; i < 14; i++) {
      const d = addDays(today, i);
      const all = eventsOn(d, { mood: false });
      const n = all.filter((x) => x.mi == null || x.mi <= NEAR_MILES).length;
      const far = all.length - n;
      const label = i === 0 ? "Today" : i === 1 ? "Tmrw" : DAYS[d.getDay()].slice(0, 3);
      const newMonth = i === 0 || d.getDate() === 1;
      cells.push(`<button type="button" class="day${n ? "" : " empty"}${d.getDay() === 0 || d.getDay() === 6 ? " weekend" : ""}" data-date="${ymd(d)}"
          aria-label="${longFmt.format(d)}: ${n ? `${n} nearby` : "nothing nearby yet"}${far ? `, ${far} a bit farther` : ""}">
        <span class="day-name">${label}</span>
        <span class="day-num">${d.getDate()}</span>
        ${newMonth ? `<span class="day-mon">${monFmt.format(d)}</span>` : ""}
        <span class="day-count${!n && far ? " far" : ""}">${n ? n : far ? `+${far}` : "·"}</span>
      </button>`);
    }
    $("dayGrid").innerHTML = cells.join("");
    $("otherDate").min = ymd(today);
    $("otherDate").value = "";
  }

  // 3. Everything that day
  function rowHtml({ e, s, mi }) {
    const time = e.allDay ? "All day" : shortTime(s.start);
    const meta = [e.venue, e.city.replace(/, MA$/, ""), milesText(mi), priceLabel(e)].filter(Boolean).map(escapeHtml).join(" · ");
    const isSaved = saved.has(e.id);
    return `<li>
      <button type="button" class="row" data-open="${escapeHtml(e.id)}">
        <span class="row-time">${time}</span>
        <span class="row-main">
          <span class="row-title">${escapeHtml(e.title)}${isSaved ? ' <span class="row-saved" aria-label="saved">♥</span>' : ""}</span>
          <span class="row-meta">${meta}</span>
          <span class="row-cat">${escapeHtml(catLabel(e.category))}${e.weekly ? " · weekly" : ""}</span>
        </span>
        <span class="row-arrow" aria-hidden="true">›</span>
      </button>
    </li>`;
  }

  function section(title, items, note) {
    if (!items.length) return "";
    return `<section class="slot">
      <h3>${title}${note ? ` <span>${note}</span>` : ""}</h3>
      <ul class="rows">${items.map(rowHtml).join("")}</ul>
    </section>`;
  }

  let currentDay = null;

  function renderDay(day) {
    currentDay = day;
    const w = dayWord(day);
    $("dayTitle").textContent = w === "Today" || w === "Tomorrow" ? `${w} · ${longFmt.format(day)}` : longFmt.format(day);
    $("dayTown").textContent = placeName();
    $("moodFilter").innerHTML = MOODS.map((m) =>
      `<button type="button" class="chip" data-mood="${m.id}" aria-pressed="${m.id === moodFilter}">${m.label}</button>`).join("");
    document.querySelector('[data-shift="-1"]').disabled = day <= today;

    const all = eventsOn(day);
    const near = all.filter((x) => x.mi == null || x.mi <= NEAR_MILES);
    const far = all.filter((x) => x.mi != null && x.mi > NEAR_MILES);
    const hour = (x) => (x.e.allDay ? -1 : x.s.start.getHours());

    let html = "";
    if (near.length) {
      html += section("All day", near.filter((x) => hour(x) === -1));
      html += section("Morning", near.filter((x) => hour(x) >= 0 && hour(x) < 12));
      html += section("Afternoon", near.filter((x) => hour(x) >= 12 && hour(x) < 17));
      html += section("Evening", near.filter((x) => hour(x) >= 17));
    } else {
      html += `<div class="nothing">
        <p class="nothing-title">${far.length
          ? `Nothing within ${NEAR_MILES} miles of ${escapeHtml(placeName())} this day — but there's something a bit farther, just below.`
          : `Nothing listed within ${NEAR_MILES} miles of ${escapeHtml(placeName())} this day — yet.`}</p>
        ${nextBusyDayHtml(day)}
      </div>`;
    }
    html += section("A bit farther", far, `${NEAR_MILES}–${FAR_MILES} mi`);

    // Classes and practitioners without fixed dates, open around town.
    const ongoing = events
      .filter((e) => !e.sessions && matchesMood(e))
      .map((e) => ({ e, mi: milesFrom(e) }))
      .filter((x) => x.mi == null || x.mi <= NEAR_MILES)
      .sort((a, b) => (a.mi ?? 0) - (b.mi ?? 0));
    if (ongoing.length) {
      html += `<details class="ongoing">
        <summary>Also open most days near you <span>${ongoing.length} place${ongoing.length === 1 ? "" : "s"} — classes &amp; appointments</span></summary>
        <ul class="rows">${ongoing.map(({ e, mi }) => `<li>
          <button type="button" class="row" data-open="${escapeHtml(e.id)}">
            <span class="row-time small">${escapeHtml(e.schedule || "Ongoing")}</span>
            <span class="row-main">
              <span class="row-title">${escapeHtml(e.title)}</span>
              <span class="row-meta">${[e.venue, e.city.replace(/, MA$/, ""), milesText(mi)].filter(Boolean).map(escapeHtml).join(" · ")}</span>
            </span>
            <span class="row-arrow" aria-hidden="true">›</span>
          </button></li>`).join("")}
        </ul>
      </details>`;
    }

    $("dayList").innerHTML = html;
    if (!reduceMotion) { const el = $("dayList"); el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter"); }
  }

  // When a day is empty, point to the next day that has something nearby.
  function nextBusyDayHtml(from) {
    for (let i = 1; i <= 60; i++) {
      const d = addDays(from, i);
      const n = eventsOn(d).filter((x) => x.mi == null || x.mi <= NEAR_MILES).length;
      if (n) {
        return `<button type="button" class="btn btn-dark" data-goto="${ymd(d)}">
          Next good thing nearby: ${dayWord(d)}${dayWord(d).includes(",") ? "" : `, ${mdFmt.format(d)}`} (${n}) →
        </button>`;
      }
    }
    return `<p class="hint-static">Try "A bit farther" below, or pick another feeling.</p>`;
  }

  // One event
  function photo(e, w) {
    const cat = CATEGORY[e.category];
    return cat ? `<img src="${unsplash(cat.photo, w)}" alt="" onerror="this.remove()">` : "";
  }

  let lastDayHash = null;

  function renderEvent(e) {
    // Show the session on the day the visitor was looking at, if there is one.
    const s = (currentDay && sessionOn(e, currentDay)) || e.next || null;
    const isSaved = saved.has(e.id);
    const mi = milesFrom(e);
    const where = [e.venue, e.city.replace(/, MA$/, ""), mi != null ? `${milesText(mi)} from ${placeName()}` : ""].filter(Boolean).map(escapeHtml).join(" · ");
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.venue, e.address, e.city].filter(Boolean).join(", "))}`;

    let whenBig, whenSmall;
    if (!s) {
      whenBig = escapeHtml(e.schedule || "Ongoing");
      whenSmall = "Whenever works for you — check their schedule";
    } else if (e.allDay) {
      const lastDay = addDays(s.end, -1);
      whenBig = ymd(lastDay) === ymd(s.start) ? dayWord(s.start) : `${dayWord(s.start)} – ${dayWord(lastDay)}`;
      whenSmall = countdown(s);
    } else {
      whenBig = `${dayWord(s.start)} · ${timeFmt.format(s.start)}`;
      whenSmall = [countdown(s),
        e.weekly ? `every ${e.weekly.day} until ${mdFmt.format(e.sessions[e.sessions.length - 1].start)}`
                 : e.hasEnd ? `ends ${timeFmt.format(s.end)}` : ""].filter(Boolean).join(" · ");
    }

    // "Back" returns to wherever the visitor came from.
    const from = prevHash.startsWith("#/day/") || prevHash === "#/saved" ? prevHash : (lastDayHash || "#/when");
    $("eventBack").href = from;
    $("eventBack").textContent = from === "#/saved" ? "← Back to saved"
      : from.startsWith("#/day/") && currentDay ? `← Back to ${dayWord(currentDay)}` : "← Back";

    $("eventCard").innerHTML = `
      <div class="pick-image">${photo(e, 1100)}<span class="pick-tag">${escapeHtml(catLabel(e.category))}</span></div>
      <div class="pick-body">
        <p class="when-big">${whenBig}</p>
        <p class="when-small">${escapeHtml(whenSmall)}</p>
        <h2 id="eventTitle" tabindex="-1">${escapeHtml(e.title)}</h2>
        <p class="where">${where}</p>
        <p class="price ${e.price === 0 ? "free" : ""}">${priceLabel(e) || "Price: ask the host"}${e.priceNote ? ` <span>· ${escapeHtml(e.priceNote)}</span>` : ""}</p>
        <p class="desc">${escapeHtml(e.description)}</p>

        <div class="go-panel" id="goPanel" hidden>
          <p class="go-title">Nice. Here's what you need:</p>
          <div class="go-actions">
            ${s ? '<button type="button" class="go-btn" data-act="calendar"><span aria-hidden="true">📅</span> Add to my calendar</button>' : ""}
            <a class="go-btn" href="${mapUrl}" target="_blank" rel="noopener"><span aria-hidden="true">📍</span> Directions</a>
            ${e.url ? `<a class="go-btn" href="${escapeHtml(e.url)}" target="_blank" rel="noopener"><span aria-hidden="true">🎟️</span> ${s ? "Sign up / details" : "Book / see schedule"}</a>` : ""}
            ${e.phone ? `<a class="go-btn" href="tel:${escapeHtml(e.phone.replace(/[^\d+]/g, ""))}"><span aria-hidden="true">📞</span> Call ${escapeHtml(e.phone)}</a>` : ""}
          </div>
          <p class="confirm">Details can change — a quick check with the host is always a good idea.</p>
        </div>
      </div>
      <div class="pick-actions two">
        <button type="button" class="act ${isSaved ? "on" : ""}" data-act="save" aria-pressed="${isSaved}">
          <span aria-hidden="true">${isSaved ? "♥" : "♡"}</span> ${isSaved ? "Saved" : "Save"}
        </button>
        <button type="button" class="act act-next" data-act="go" aria-expanded="false" aria-controls="goPanel">I'm in</button>
      </div>`;
    $("eventCard").dataset.id = e.id;
    $("eventCard").dataset.session = s ? s.start.toISOString() : "";
  }

  // Saved
  function renderSaved() {
    const list = events.filter((e) => saved.has(e.id))
      .sort((a, b) => (a.next && b.next ? a.next.start - b.next.start : a.next ? -1 : b.next ? 1 : 0));
    $("savedLede").textContent = list.length
      ? "Saved on this device only. Tap one to open it."
      : "Nothing saved yet. Tap ♡ Save on anything that looks good.";
    $("savedList").innerHTML = list.map((e) => `
      <li>
        <button type="button" class="saved-item" data-open="${escapeHtml(e.id)}">
          <span class="saved-when">${e.next ? `${dayWord(e.next.start)}${e.allDay ? "" : ` · ${timeFmt.format(e.next.start)}`}` : escapeHtml(e.schedule || "Ongoing")}</span>
          <span class="saved-name">${escapeHtml(e.title)}</span>
          <span class="saved-where">${escapeHtml(e.venue)} · ${escapeHtml(e.city.replace(/, MA$/, ""))}</span>
        </button>
        <button type="button" class="saved-remove" data-unsave="${escapeHtml(e.id)}" aria-label="Remove ${escapeHtml(e.title)}">×</button>
      </li>`).join("");
  }

  // ---------- routing ----------
  let prevHash = "";
  let lastHash = "";
  function route() {
    // Remember the previous screen (but not when re-rendering an event page).
    if (!location.hash.startsWith("#/e/")) prevHash = location.hash;
    else if (!lastHash.startsWith("#/e/")) prevHash = lastHash;
    lastHash = location.hash;

    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const kind = parts[0];

    if (kind === "town" || (!place && kind !== "day" && kind !== "e" && kind !== "saved")) {
      renderTowns();
      showScreen("town");
      return;
    }
    if (kind === "day") {
      const [, townId, date] = parts;
      if (TOWNS.has(townId) && (!place || place.townId !== townId)) {
        place = { townId };            // a shared link chooses the town
        store("goodNearby.place", place);
      }
      if (!place) { location.replace("#/town"); return; }
      const d = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseLocal(date) : today;
      lastDayHash = `#/day/${place.townId}/${ymd(d)}`;
      renderDay(d);
      showScreen("day", $("dayTitle"));
      return;
    }
    if (kind === "e" && byId.has(parts[1])) {
      renderEvent(byId.get(parts[1]));
      showScreen("event", $("eventTitle"));
      return;
    }
    if (kind === "saved") {
      renderSaved();
      showScreen("saved", $("savedTitle"));
      return;
    }
    renderWhen();
    showScreen("when", kind === "when" ? $("whenTitle") : null);
  }

  const goDay = (d) => { location.hash = `#/day/${place.townId}/${ymd(d)}`; };

  // ---------- interactions ----------
  document.addEventListener("click", (ev) => {
    const t = ev.target;

    const town = t.closest("[data-town]");
    if (town) { chooseTown(town.dataset.town); return; }

    const date = t.closest("[data-date], [data-goto]");
    if (date) { goDay(parseLocal(date.dataset.date || date.dataset.goto)); return; }

    const shift = t.closest("[data-shift]");
    if (shift && currentDay) { goDay(addDays(currentDay, Number(shift.dataset.shift))); return; }

    const mood = t.closest("[data-mood]");
    if (mood) { moodFilter = mood.dataset.mood; renderDay(currentDay); return; }

    const open = t.closest("[data-open]");
    if (open) { location.hash = `#/e/${open.dataset.open}`; return; }

    const unsave = t.closest("[data-unsave]");
    if (unsave) {
      saved.delete(unsave.dataset.unsave);
      store("goodNearby.saved", [...saved]);
      renderSaved();
      updateSavedPill();
      return;
    }

    const act = t.closest("[data-act]");
    if (act) {
      const e = byId.get($("eventCard").dataset.id);
      if (!e) return;
      if (act.dataset.act === "save") {
        if (saved.has(e.id)) saved.delete(e.id); else saved.add(e.id);
        store("goodNearby.saved", [...saved]);
        const panelOpen = !$("goPanel").hidden;
        renderEvent(e);
        if (panelOpen) $("eventCard").querySelector('[data-act="go"]').click();
        updateSavedPill();
      } else if (act.dataset.act === "go") {
        const panel = $("goPanel");
        panel.hidden = !panel.hidden;
        act.setAttribute("aria-expanded", String(!panel.hidden));
        act.classList.toggle("on", !panel.hidden);
        if (!panel.hidden) panel.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
      } else if (act.dataset.act === "calendar") {
        const iso = $("eventCard").dataset.session;
        const s = (iso && e.sessions.find((x) => x.start.toISOString() === iso)) || e.next;
        downloadIcs(e, s);
      }
    }
  });

  $("townFilter").addEventListener("input", renderTowns);
  $("townFilter").addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    const first = $("townList").querySelector("[data-town]");
    if (first) first.click();
  });

  $("otherDate").addEventListener("change", (ev) => {
    if (ev.target.value) goDay(parseLocal(ev.target.value));
  });

  $("locateBtn").addEventListener("click", () => {
    const note = $("townNote");
    if (!("geolocation" in navigator)) { note.textContent = "Your browser can't share location — tap your town below instead."; return; }
    note.textContent = "Finding you…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pt = { lat: +pos.coords.latitude.toFixed(3), lng: +pos.coords.longitude.toFixed(3) };
        const t = nearestTown(pt);
        note.textContent = `Found you near ${t.name}. Your location stays on this device.`;
        chooseTown(t.id, pt);
      },
      () => { note.textContent = "No worries — just tap your town below."; },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });

  // Day view: ← → keys and swipes move between days.
  document.addEventListener("keydown", (ev) => {
    if (document.body.dataset.screen !== "day" || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ev.target.closest("input, textarea, select")) return;
    if (ev.key === "ArrowRight") { ev.preventDefault(); goDay(addDays(currentDay, 1)); }
    else if (ev.key === "ArrowLeft" && currentDay > today) { ev.preventDefault(); goDay(addDays(currentDay, -1)); }
  });
  let touchX = null, touchY = null;
  $("screenDay").addEventListener("touchstart", (ev) => { touchX = ev.touches[0].clientX; touchY = ev.touches[0].clientY; }, { passive: true });
  $("screenDay").addEventListener("touchend", (ev) => {
    if (touchX === null) return;
    const dx = ev.changedTouches[0].clientX - touchX;
    const dy = ev.changedTouches[0].clientY - touchY;
    touchX = touchY = null;
    if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) goDay(addDays(currentDay, 1));
    else if (currentDay > today) goDay(addDays(currentDay, -1));
  });

  window.addEventListener("hashchange", route);
  route();
})();
