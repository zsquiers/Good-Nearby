// Good Nearby — renders events from data/events.js and powers search, filters,
// "Near me", saved events, the mobile menu and the event detail dialog.
(function () {
  "use strict";

  // ---------- categories ----------
  const unsplash = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

  const ICONS = {
    lotus: '<path d="M16 25c-5 0-9-3-10-7 3 0 6 1 8 3M16 25c5 0 9-3 10-7-3 0-6 1-8 3M16 25c-3-3-4-7-3-12 2 1 3 3 3 5 0-2 1-4 3-5 1 5 0 9-3 12Z"/>',
    stones: '<ellipse cx="16" cy="24" rx="9" ry="3.5"/><ellipse cx="16" cy="16.5" rx="6.5" ry="3"/><ellipse cx="16" cy="10" rx="4" ry="2.4"/>',
    waves: '<path d="M5 14v4M9 11v10M13 8v16M17 11v10M21 7v18M25 12v8"/>',
    hands: '<path d="M7 26v-7l-2-6c-.4-1.2 1.4-2 2-.8L9 16V8.5c0-1.4 2-1.4 2 0V15M25 26v-7l2-6c.4-1.2-1.4-2-2-.8L23 16V8.5c0-1.4-2-1.4-2 0V15M11 15c0 3 1 5 2 6M21 15c0 3-1 5-2 6"/>',
    leaf: '<path d="M16 27V15M16 15c0-6 4-9 10-9 0 6-4 9-10 9Zm0 4c0-5-3-8-9-8 0 5 3 8 9 8Z"/>',
    sun: '<circle cx="16" cy="16" r="5"/><path d="M16 4v3M16 25v3M4 16h3M25 16h3M7.5 7.5l2 2M22.5 22.5l2 2M7.5 24.5l2-2M22.5 9.5l2-2"/>',
    people: '<circle cx="16" cy="11" r="3.5"/><circle cx="8" cy="13" r="2.7"/><circle cx="24" cy="13" r="2.7"/><path d="M10 25c0-3.5 2.7-7 6-7s6 3.5 6 7M3 24c0-3 2-5 5-5M29 24c0-3-2-5-5-5"/>',
    wind: '<path d="M4 12h15a3.5 3.5 0 1 0-3.5-3.5M4 17h20a3.5 3.5 0 1 1-3.5 3.5M4 22h9"/>',
  };

  // Order here is the order of the category circles and chips.
  const CATEGORIES = {
    yoga:       { label: "Yoga",                icon: "lotus",  tone: "#d98a68", ink: "#fff",   photo: "1506126613408-eca07ce68773" },
    meditation: { label: "Meditation",          icon: "stones", tone: "#c3cab0",                photo: "1545205597-3d9d02c29597" },
    sound:      { label: "Sound Baths",         icon: "waves",  tone: "#f0d3c4", ink: "#b0654a", photo: "1608571423902-eed4a5ad8108" },
    massage:    { label: "Massage & Bodywork",  icon: "hands",  tone: "#e3d3b5",                photo: "1600334089648-b0d9d3028eb2" },
    reiki:      { label: "Reiki & Energy",      icon: "leaf",   tone: "#d9a95a", ink: "#fff",   photo: "1544161515-4ab6ce6db874" },
    "tai-chi":  { label: "Tai Chi",             icon: "sun",    tone: "#f1d4c0", ink: "#b0654a", photo: "1518611012118-696072aa579a" },
    breathwork: { label: "Breathwork",          icon: "wind",   tone: "#dfe5cf",                photo: "1497250681960-ef046c08a56e" },
    workshop:   { label: "Workshops",           icon: "sun",    tone: "#eadcc4",                photo: "1529156069898-49953e39b3ac" },
    expo:       { label: "Expos & Fairs",       icon: "people", tone: "#c9d0b6",                photo: "1515169067868-5387ec356754" },
  };
  const catLabel = (key) => (CATEGORIES[key] ? CATEGORIES[key].label : key);

  // ---------- dates ----------
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();

  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  // "2026-10-03" or "2026-10-03T09:30" → local Date (bare dates would otherwise parse as UTC)
  function parseLocal(s) { return new Date(s.includes("T") ? s : `${s}T00:00`); }
  function ymd(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

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

  // ---------- saved (hearts) ----------
  const SAVED_KEY = "goodNearby.saved";
  let saved = new Set();
  try { saved = new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]")); } catch (_) { /* storage unavailable */ }
  function persistSaved() {
    try { localStorage.setItem(SAVED_KEY, JSON.stringify([...saved])); } catch (_) { /* ignore */ }
  }

  const state = { query: "", category: "all", when: "all", freeOnly: false, savedOnly: false, origin: null };

  const $ = (id) => document.getElementById(id);

  // ---------- formatting ----------
  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const wkFmt = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  const mdFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  const longDayFmt = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });
  const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
  const shortDay = (d) => `${wkFmt.format(d)} · ${mdFmt.format(d)}`;

  function priceLabel(e) {
    if (e.price === 0) return "Free";
    if (typeof e.price === "number") return `$${e.price}`;
    return "";
  }

  function cardWhen(e) {
    if (!e.sessions) return escapeHtml(e.schedule || "Ongoing");
    const s = e.next;
    if (e.allDay) {
      const lastDay = addDays(s.end, -1);
      return ymd(lastDay) === ymd(s.start) ? shortDay(s.start) : `${shortDay(s.start)} – ${shortDay(lastDay)}`;
    }
    return `${shortDay(s.start)} · ${timeFmt.format(s.start)}`;
  }

  function dialogWhen(e) {
    if (!e.sessions) return escapeHtml(e.schedule || "Ongoing");
    const s = e.next;
    if (e.weekly) {
      const lastSession = e.sessions[e.sessions.length - 1].start;
      return `${e.weekly.day}s, ${timeFmt.format(s.start)} – ${timeFmt.format(s.end)}<br>` +
        `Next: ${longDayFmt.format(s.start)} · runs through ${mdFmt.format(lastSession)}`;
    }
    if (e.allDay) {
      const lastDay = addDays(s.end, -1);
      return ymd(lastDay) === ymd(s.start) ? longDayFmt.format(s.start) : `${longDayFmt.format(s.start)} – ${longDayFmt.format(lastDay)}`;
    }
    return `${longDayFmt.format(s.start)}, ${timeFmt.format(s.start)}${e.hasEnd ? ` – ${timeFmt.format(s.end)}` : ""}`;
  }

  function distanceMiles(a, b) {
    const R = 3958.8;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // ---------- filtering ----------
  function windowFor(when) {
    const today = startOfDay(now);
    if (when === "today") return [today, addDays(today, 1)];
    if (when === "week") return [today, addDays(today, 7)];
    if (when === "month") return [today, addDays(today, 30)];
    if (when === "weekend") {
      // Friday 5pm through Sunday night
      const dow = today.getDay(); // 0 Sun … 6 Sat
      if (dow === 0) return [today, addDays(today, 1)];
      if (dow === 6) return [today, addDays(today, 2)];
      const friday = addDays(today, 5 - dow);
      const from = new Date(friday); from.setHours(17);
      return [from, addDays(friday, 3)];
    }
    return null;
  }

  // Ongoing listings have no dates, so they only appear under "Any time".
  function inWindow(e, when) {
    const win = windowFor(when);
    if (!win) return true;
    if (!e.sessions) return false;
    return e.sessions.some((s) => s.end >= win[0] && s.start < win[1]);
  }

  function bySoonest(a, b) {
    if (a.next && b.next) return a.next.start - b.next.start;
    if (a.next) return -1;
    if (b.next) return 1;
    return a.city.localeCompare(b.city) || a.venue.localeCompare(b.venue);
  }

  function filtered() {
    const q = state.query.trim().toLowerCase();
    let list = events.filter((e) => {
      if (state.category !== "all" && e.category !== state.category) return false;
      if (state.freeOnly && e.price !== 0) return false;
      if (state.savedOnly && !saved.has(e.id)) return false;
      if (!inWindow(e, state.when)) return false;
      if (!q) return true;
      return [e.title, e.description, e.host, e.venue, e.city, catLabel(e.category), e.schedule]
        .join(" ").toLowerCase().includes(q);
    });

    if (state.origin) {
      list = list.map((e) => ({ ...e, distance: distanceMiles(state.origin, e) }))
        .sort((a, b) => a.distance - b.distance);
    } else {
      list.sort(bySoonest);
    }
    return list;
  }

  // ---------- rendering ----------
  function imgTag(e, w) {
    const cat = CATEGORIES[e.category];
    if (!cat) return "";
    // If a photo fails to load it's removed, leaving the warm gradient behind it.
    return `<img src="${unsplash(cat.photo, w)}" alt="" loading="lazy" onerror="this.remove()">`;
  }

  function cardHtml(e) {
    const isSaved = saved.has(e.id);
    const place = e.distance != null
      ? `${escapeHtml(e.venue)} · ${e.distance < 10 ? e.distance.toFixed(1) : Math.round(e.distance)} mi`
      : `${escapeHtml(e.venue)} · ${escapeHtml(e.city.replace(/, MA$/, ""))}`;
    const tags = [`<span>${escapeHtml(catLabel(e.category))}</span>`];
    const price = priceLabel(e);
    if (price) tags.push(`<span class="${e.price === 0 ? "tag-free" : ""}">${price}</span>`);
    if (e.weekly) tags.push("<span>Weekly</span>");
    else if (!e.sessions) tags.push("<span>Ongoing</span>");
    return `
      <article class="event-card">
        <button type="button" class="event-open" data-id="${escapeHtml(e.id)}" aria-label="${escapeHtml(e.title)} — details">
          <div class="event-image">${imgTag(e, 700)}</div>
          <div class="event-body">
            <p class="event-date${e.sessions ? "" : " ongoing"}">${cardWhen(e)}</p>
            <h3>${escapeHtml(e.title)}</h3>
            <p class="event-place">${place}</p>
            <div class="tags">${tags.join("")}</div>
          </div>
        </button>
        <button type="button" class="heart${isSaved ? " saved" : ""}" data-save="${escapeHtml(e.id)}"
          aria-label="Save ${escapeHtml(e.title)}" aria-pressed="${isSaved}">${isSaved ? "♥" : "♡"}</button>
      </article>`;
  }

  function renderCategories() {
    const present = new Set(events.map((e) => e.category));
    const keys = Object.keys(CATEGORIES).filter((k) => present.has(k));
    $("categoryGrid").innerHTML = keys.map((k) => {
      const c = CATEGORIES[k];
      return `<button type="button" class="category-item" data-cat="${k}">
        <span class="category-icon" style="--tone:${c.tone};${c.ink ? `--icon:${c.ink}` : ""}">
          <svg viewBox="0 0 32 32" aria-hidden="true">${ICONS[c.icon]}</svg>
        </span>
        <span>${escapeHtml(c.label)}</span>
      </button>`;
    }).join("");

    $("categoryChips").innerHTML = ["all", ...keys].map((k) =>
      `<button type="button" class="chip" data-cat="${k}" aria-pressed="${k === state.category}">${k === "all" ? "All" : escapeHtml(catLabel(k))}</button>`
    ).join("");
  }

  function renderFeatured() {
    const featured = events.filter((e) => e.sessions).sort(bySoonest).slice(0, 4);
    if (featured.length < 4) featured.push(...events.filter((e) => !e.sessions).slice(0, 4 - featured.length));
    $("featuredGrid").innerHTML = featured.map(cardHtml).join("");
  }

  function render() {
    const list = filtered();
    $("eventGrid").innerHTML = list.map(cardHtml).join("");
    $("emptyState").hidden = list.length > 0;
    let count = list.length === 1 ? "1 listing" : `${list.length} listings`;
    if (state.when !== "all") count += " · ongoing classes appear under “Any time”";
    $("resultCount").textContent = count;
  }

  function setCategory(cat) {
    state.category = cat;
    document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c.dataset.cat === cat));
    render();
  }

  function scrollToEvents() {
    $("events").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function openEvent(id) {
    const e = byId.get(id);
    if (!e) return;
    const place = [e.venue, e.address, e.city].filter(Boolean).join(", ");
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
    const dist = state.origin ? `<dt>Distance</dt><dd>${distanceMiles(state.origin, e).toFixed(1)} miles</dd>` : "";
    const price = priceLabel(e) || "Check with host";
    const phone = e.phone ? `<dt>Phone</dt><dd><a href="tel:${escapeHtml(e.phone.replace(/[^\d+]/g, ""))}">${escapeHtml(e.phone)}</a></dd>` : "";
    $("dialogBody").innerHTML = `
      <button type="button" class="close-btn" aria-label="Close">×</button>
      <div class="dialog-image">${imgTag(e, 1100)}</div>
      <div class="dialog-inner">
        <h2 id="dialogTitle">${escapeHtml(e.title)}</h2>
        <p class="dialog-host">with ${escapeHtml(e.host)}</p>
        <dl>
          <dt>When</dt><dd>${dialogWhen(e)}</dd>
          <dt>Where</dt><dd>${escapeHtml(e.venue)}<br>${escapeHtml([e.address, e.city].filter(Boolean).join(", "))}</dd>
          ${dist}
          <dt>Cost</dt><dd>${price}${e.priceNote ? ` · ${escapeHtml(e.priceNote)}` : ""}</dd>
          ${phone}
        </dl>
        <p>${escapeHtml(e.description)}</p>
        <p class="confirm-note">Details can change — please confirm with the host before you go.</p>
        <div class="dialog-actions">
          ${e.url ? `<a class="btn btn-dark" href="${escapeHtml(e.url)}" target="_blank" rel="noopener">Details &amp; booking</a>` : ""}
          <a class="btn btn-soft" href="${mapUrl}" target="_blank" rel="noopener">Directions</a>
        </div>
      </div>`;
    $("eventDialog").showModal();
  }

  // ---------- interactions ----------
  document.addEventListener("click", (ev) => {
    const heart = ev.target.closest("[data-save]");
    if (heart) {
      const id = heart.dataset.save;
      if (saved.has(id)) saved.delete(id); else saved.add(id);
      persistSaved();
      // update every copy of this card (featured + grid)
      document.querySelectorAll(`[data-save="${CSS.escape(id)}"]`).forEach((b) => {
        const on = saved.has(id);
        b.classList.toggle("saved", on);
        b.setAttribute("aria-pressed", on);
        b.textContent = on ? "♥" : "♡";
      });
      if (state.savedOnly) render();
      return;
    }
    const open = ev.target.closest(".event-open");
    if (open) { openEvent(open.dataset.id); return; }

    const catBtn = ev.target.closest(".category-item, .chip, .mood-card");
    if (catBtn && catBtn.dataset.cat) {
      if (catBtn.classList.contains("mood-card")) ev.preventDefault();
      setCategory(catBtn.dataset.cat);
      if (!catBtn.classList.contains("chip")) scrollToEvents();
    }
  });

  const dialog = $("eventDialog");
  dialog.addEventListener("click", (ev) => {
    if (ev.target === dialog || ev.target.closest(".close-btn")) dialog.close();
  });

  $("q").addEventListener("input", (ev) => { state.query = ev.target.value; render(); });
  $("when").addEventListener("change", (ev) => { state.when = ev.target.value; render(); });
  $("freeOnly").addEventListener("change", (ev) => { state.freeOnly = ev.target.checked; render(); });
  $("savedOnly").addEventListener("change", (ev) => { state.savedOnly = ev.target.checked; render(); });

  // Hero search: filters the full list and scrolls to it.
  $("locationForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const value = $("locationInput").value.trim();
    state.query = value;
    $("q").value = value;
    render();
    const n = filtered().length;
    $("searchFeedback").textContent = value
      ? (n ? `Found ${n} ${n === 1 ? "listing" : "listings"} matching “${value}”.` : `Nothing matches “${value}” yet — try another town or practice.`)
      : "";
    scrollToEvents();
  });

  // "Use my location" — sorts everything by distance.
  const nearBtn = $("nearMe");
  const note = $("searchFeedback");
  nearBtn.addEventListener("click", () => {
    if (state.origin) {
      state.origin = null;
      nearBtn.setAttribute("aria-pressed", "false");
      note.textContent = "Sorting by date again.";
      render();
      return;
    }
    if (!("geolocation" in navigator)) {
      note.textContent = "Your browser can't share location — sorting by date instead.";
      return;
    }
    note.textContent = "Finding you…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        nearBtn.setAttribute("aria-pressed", "true");
        note.textContent = "Showing the closest listings first.";
        render();
        scrollToEvents();
      },
      () => { note.textContent = "We couldn't get your location — no worries, sorting by date."; },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });

  // Header search icon focuses the events search box.
  document.querySelector("[data-focus-search]")?.addEventListener("click", () => {
    setTimeout(() => $("q").focus({ preventScroll: true }), 400);
  });

  // Mobile menu
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  menuToggle?.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  mainNav?.addEventListener("click", (ev) => {
    if (ev.target.closest("a")) { mainNav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); }
  });

  // Newsletter: no email service is connected yet, so say so honestly.
  $("newsletterForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    $("newsletterFeedback").textContent = "Thanks! Email updates are launching soon — nothing was saved yet, so check back shortly.";
    ev.target.reset();
  });

  $("year").textContent = now.getFullYear();
  renderCategories();
  renderFeatured();
  render();
})();
