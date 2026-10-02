// Good Nearby — browse, filter and sort local restorative events.
(function () {
  "use strict";

  const CATEGORIES = {
    all:        "All",
    yoga:       "Yoga",
    sound:      "Sound baths",
    meditation: "Meditation",
    massage:    "Massage",
    breathwork: "Breathwork",
    reiki:      "Reiki",
    "tai-chi":  "Tai chi",
    workshop:   "Workshops",
    expo:       "Expos & fairs",
  };

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();

  // ---------- date helpers ----------
  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  // "2026-10-03" or "2026-10-03T09:30" → local Date (bare dates would otherwise parse as UTC)
  function parseLocal(s) { return new Date(s.includes("T") ? s : `${s}T00:00`); }
  function ymd(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // Turn a listing into one of: dated (sessions[]), or ongoing (no sessions).
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
        if (skip.has(ymd(d))) continue;
        const day = ymd(d);
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

  const state = { query: "", category: "all", when: "all", freeOnly: false, origin: null };

  const $ = (id) => document.getElementById(id);
  const grid = $("event-grid");
  const dialog = $("event-dialog");

  // ---------- formatting ----------
  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
  const longDayFmt = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });
  const shortDateFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

  function priceLabel(e) {
    if (e.price === 0) return "Free";
    if (typeof e.price === "number") return `$${e.price}`;
    return "";
  }

  function cardWhen(e) {
    if (!e.sessions) return escapeHtml(e.schedule || "Ongoing");
    const s = e.next;
    if (e.weekly) return `${dayFmt.format(s.start)} · ${timeFmt.format(s.start)} · Weekly`;
    if (e.allDay) {
      const lastDay = addDays(s.end, -1);
      return ymd(lastDay) === ymd(s.start) ? dayFmt.format(s.start) : `${dayFmt.format(s.start)} – ${dayFmt.format(lastDay)}`;
    }
    return `${dayFmt.format(s.start)} · ${timeFmt.format(s.start)}`;
  }

  function dialogWhen(e) {
    if (!e.sessions) return escapeHtml(e.schedule || "Ongoing");
    const s = e.next;
    if (e.weekly) {
      const w = e.weekly;
      const lastSession = e.sessions[e.sessions.length - 1].start;
      return `${w.day}s, ${timeFmt.format(s.start)} – ${timeFmt.format(s.end)}<br>` +
        `Next: ${longDayFmt.format(s.start)} · runs through ${shortDateFmt.format(lastSession)}`;
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

  function filtered() {
    const q = state.query.trim().toLowerCase();
    let list = events.filter((e) => {
      if (state.category !== "all" && e.category !== state.category) return false;
      if (state.freeOnly && e.price !== 0) return false;
      if (!inWindow(e, state.when)) return false;
      if (!q) return true;
      return [e.title, e.description, e.host, e.venue, e.city, CATEGORIES[e.category], e.schedule]
        .join(" ").toLowerCase().includes(q);
    });

    if (state.origin) {
      list = list.map((e) => ({ ...e, distance: distanceMiles(state.origin, e) }))
        .sort((a, b) => a.distance - b.distance);
    } else {
      // Dated listings soonest first, then ongoing ones by town.
      list.sort((a, b) => {
        if (a.next && b.next) return a.next.start - b.next.start;
        if (a.next) return -1;
        if (b.next) return 1;
        return a.city.localeCompare(b.city) || a.venue.localeCompare(b.venue);
      });
    }
    return list;
  }

  // ---------- rendering ----------
  function renderChips() {
    const wrap = $("category-chips");
    const present = new Set(events.map((e) => e.category));
    wrap.innerHTML = Object.entries(CATEGORIES)
      .filter(([key]) => key === "all" || present.has(key))
      .map(([key, label]) =>
        `<button type="button" class="chip" data-cat="${key}" aria-pressed="${key === state.category}">${label}</button>`)
      .join("");
  }

  function cardHtml(e) {
    const where = e.distance != null
      ? `${e.distance < 10 ? e.distance.toFixed(1) : Math.round(e.distance)} mi · ${escapeHtml(e.city)}`
      : escapeHtml(e.city);
    const price = priceLabel(e);
    return `
      <button type="button" class="card" data-id="${escapeHtml(e.id)}">
        <div class="card-art tone-${escapeHtml(e.category)}">
          <span class="card-tag">${escapeHtml(CATEGORIES[e.category] || e.category)}</span>
        </div>
        <div class="card-body">
          <span class="card-date${e.sessions ? "" : " ongoing"}">${cardWhen(e)}</span>
          <h3>${escapeHtml(e.title)}</h3>
          <p class="card-meta">${escapeHtml(e.venue)}</p>
          <div class="card-foot">
            <span>${where}</span>
            ${price ? `<span class="price ${e.price === 0 ? "free" : ""}">${price}</span>` : ""}
          </div>
        </div>
      </button>`;
  }

  function render() {
    const list = filtered();
    grid.innerHTML = list.map(cardHtml).join("");
    $("empty-state").hidden = list.length > 0;
    let count = list.length === 1 ? "1 listing" : `${list.length} listings`;
    if (state.when !== "all") count += " · ongoing classes appear under “Any time”";
    $("result-count").textContent = count;
  }

  function openEvent(id) {
    const e = events.find((x) => x.id === id);
    if (!e) return;
    const place = [e.venue, e.address, e.city].filter(Boolean).join(", ");
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
    const dist = state.origin ? `<dt>Distance</dt><dd>${distanceMiles(state.origin, e).toFixed(1)} miles</dd>` : "";
    const price = priceLabel(e) || "Check with host";
    const phone = e.phone ? `<dt>Phone</dt><dd><a href="tel:${escapeHtml(e.phone.replace(/[^\d+]/g, ""))}">${escapeHtml(e.phone)}</a></dd>` : "";
    $("dialog-body").innerHTML = `
      <button type="button" class="close-btn" aria-label="Close">×</button>
      <div class="card-art tone-${escapeHtml(e.category)}">
        <span class="card-tag">${escapeHtml(CATEGORIES[e.category] || e.category)}</span>
      </div>
      <div class="dialog-inner">
        <h2 id="dialog-title">${escapeHtml(e.title)}</h2>
        <p class="card-meta">with ${escapeHtml(e.host)}</p>
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
          ${e.url ? `<a class="btn" href="${escapeHtml(e.url)}" target="_blank" rel="noopener">Details &amp; booking</a>` : ""}
          <a class="btn-soft" href="${mapUrl}" target="_blank" rel="noopener">Directions</a>
        </div>
      </div>`;
    dialog.showModal();
  }

  // ---------- interactions ----------
  $("category-chips").addEventListener("click", (ev) => {
    const chip = ev.target.closest(".chip");
    if (!chip) return;
    state.category = chip.dataset.cat;
    document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === chip));
    render();
  });

  $("q").addEventListener("input", (ev) => { state.query = ev.target.value; render(); });
  $("search-form").addEventListener("submit", (ev) => ev.preventDefault());
  $("when").addEventListener("change", (ev) => { state.when = ev.target.value; render(); });
  $("free-only").addEventListener("change", (ev) => { state.freeOnly = ev.target.checked; render(); });

  grid.addEventListener("click", (ev) => {
    const card = ev.target.closest(".card");
    if (card) openEvent(card.dataset.id);
  });

  dialog.addEventListener("click", (ev) => {
    if (ev.target === dialog || ev.target.closest(".close-btn")) dialog.close();
  });

  const nearBtn = $("near-me");
  const note = $("location-note");
  nearBtn.addEventListener("click", () => {
    if (state.origin) {
      state.origin = null;
      nearBtn.setAttribute("aria-pressed", "false");
      note.textContent = "";
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
      },
      () => { note.textContent = "We couldn't get your location — no worries, sorting by date."; },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });

  $("year").textContent = now.getFullYear();
  renderChips();
  render();
})();
