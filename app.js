// Good Nearby — one calm question, then one good thing at a time.
//
// Screens (hash routes):
//   #/            "What would feel good right now?"
//   #/m/<mood>    one event at a time for that mood (or "surprise")
//   #/saved       events saved on this device
(function () {
  "use strict";

  // ---------- photos & moods ----------
  const unsplash = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

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
  };
  const catLabel = (k) => (CATEGORY[k] ? CATEGORY[k].label : k);

  const ICONS = {
    move:   '<path d="M16 25c-5 0-9-3-10-7 3 0 6 1 8 3M16 25c5 0 9-3 10-7-3 0-6 1-8 3M16 25c-3-3-4-7-3-12 2 1 3 3 3 5 0-2 1-4 3-5 1 5 0 9-3 12Z"/>',
    calm:   '<path d="M5 14v4M9 11v10M13 8v16M17 11v10M21 7v18M25 12v8"/>',
    care:   '<path d="M7 26v-7l-2-6c-.4-1.2 1.4-2 2-.8L9 16V8.5c0-1.4 2-1.4 2 0V15M25 26v-7l2-6c.4-1.2-1.4-2-2-.8L23 16V8.5c0-1.4-2-1.4-2 0V15M11 15c0 3 1 5 2 6M21 15c0 3-1 5-2 6"/>',
    people: '<circle cx="16" cy="11" r="3.5"/><circle cx="8" cy="13" r="2.7"/><circle cx="24" cy="13" r="2.7"/><path d="M10 25c0-3.5 2.7-7 6-7s6 3.5 6 7M3 24c0-3 2-5 5-5M29 24c0-3-2-5-5-5"/>',
  };

  const MOODS = [
    { id: "move",   label: "Move my body",          hint: "Yoga · tai chi",                         tone: "#d98a68", ink: "#fff",
      match: (e) => ["yoga", "tai-chi"].includes(e.category) },
    { id: "calm",   label: "Quiet my mind",         hint: "Meditation · sound baths · breathwork",  tone: "#c3cab0", ink: "#304022",
      match: (e) => ["meditation", "sound", "breathwork"].includes(e.category) },
    { id: "care",   label: "Be cared for",          hint: "Massage · reiki",                        tone: "#f0d3c4", ink: "#9a5236",
      match: (e) => ["massage", "reiki"].includes(e.category) },
    { id: "people", label: "Be with good people",   hint: "Classes, circles & expos",   tone: "#e3c98f", ink: "#304022",
      // anything with a date that people attend together (not one-on-one appointments)
      match: (e) => ["expo", "workshop"].includes(e.category) || (e.sessions && !["massage", "reiki"].includes(e.category)) },
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

  // ---------- small storage helpers (never required to work) ----------
  function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* ignore */ }
  }

  let saved = new Set(load("goodNearby.saved", []).filter((id) => byId.has(id)));
  let origin = load("goodNearby.origin", null);   // { lat, lng } once the visitor opts in

  // ---------- formatting ----------
  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
  const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
  const mdFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

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

  function whenBig(e) {
    if (!e.sessions) return escapeHtml(e.schedule || "Ongoing");
    const s = e.next;
    if (e.allDay) {
      const lastDay = addDays(s.end, -1);
      return ymd(lastDay) === ymd(s.start) ? dayWord(s.start) : `${dayWord(s.start)} – ${dayWord(lastDay)}`;
    }
    return `${dayWord(s.start)} · ${timeFmt.format(s.start)}`;
  }

  function whenSmall(e) {
    if (!e.sessions) return "Whenever works for you — check their schedule";
    const parts = [countdown(e.next)];
    if (e.weekly) parts.push(`every ${e.weekly.day} until ${mdFmt.format(e.sessions[e.sessions.length - 1].start)}`);
    else if (!e.allDay && e.hasEnd) parts.push(`ends ${timeFmt.format(e.next.end)}`);
    return parts.join(" · ");
  }

  function priceLabel(e) {
    if (e.price === 0) return "Free";
    if (typeof e.price === "number") return `$${e.price}`;
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
    const s = e.next;
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
    if (e.weekly && e.sessions.length > 1) {
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
    a.download = `${e.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ---------- rendering ----------
  const $ = (id) => document.getElementById(id);
  const screens = { start: $("screenStart"), pick: $("screenPick"), saved: $("screenSaved") };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = { mood: null, deck: [], index: 0 };

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
            <a href="#/" class="btn btn-dark">Pick another feeling</a>
            ${saved.size ? `<a href="#/saved" class="btn btn-soft">See what I saved (${saved.size})</a>` : ""}
          </div>
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
  function route() {
    const hash = location.hash.replace(/^#\/?/, "");
    const [kind, arg, idx] = hash.split("/");

    if (kind === "m" && arg) {
      if (state.mood !== arg || !state.deck.length) {
        state.mood = arg;
        state.deck = buildDeck(arg);
      }
      state.index = Math.min(Math.max(parseInt(idx, 10) || 0, 0), state.deck.length);
      showScreen("pick");
      renderPick(true);
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

  // Moving between cards replaces the URL (so Back returns to the question, not every card).
  function goTo(index) {
    state.index = Math.min(Math.max(index, 0), state.deck.length);
    history.replaceState(null, "", `#/m/${state.mood}/${state.index}`);
    renderPick(true);
  }

  // ---------- interactions ----------
  document.addEventListener("click", (ev) => {
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
    if (document.body.dataset.screen !== "pick" || ev.altKey || ev.ctrlKey || ev.metaKey) return;
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
