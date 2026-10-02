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
  };

  const now = new Date();
  const events = (window.GOOD_NEARBY_EVENTS || [])
    .map((e) => ({ ...e, startDate: new Date(e.start), endDate: new Date(e.end || e.start) }))
    .filter((e) => e.endDate >= now);

  const state = { query: "", category: "all", when: "all", freeOnly: false, origin: null };

  const $ = (id) => document.getElementById(id);
  const grid = $("event-grid");
  const dialog = $("event-dialog");

  // ---------- helpers ----------
  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
  const longDayFmt = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });
  const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

  const priceLabel = (e) => (e.price === 0 ? "Free" : `$${e.price}`);

  function distanceMiles(a, b) {
    const R = 3958.8;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

  function inWindow(e, when) {
    if (when === "all") return true;
    const today = startOfDay(now);
    let from = today, to;
    if (when === "today") to = addDays(today, 1);
    else if (when === "week") to = addDays(today, 7);
    else if (when === "month") to = addDays(today, 30);
    else if (when === "weekend") {
      // Friday 5pm through Sunday night
      const dow = today.getDay(); // 0 Sun … 6 Sat
      if (dow === 0) to = addDays(today, 1);
      else if (dow === 6) to = addDays(today, 2);
      else {
        const friday = addDays(today, 5 - dow);
        from = new Date(friday); from.setHours(17);
        to = addDays(friday, 3);
      }
    }
    return e.endDate >= from && e.startDate < to;
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

  function filtered() {
    const q = state.query.trim().toLowerCase();
    let list = events.filter((e) => {
      if (state.category !== "all" && e.category !== state.category) return false;
      if (state.freeOnly && e.price !== 0) return false;
      if (!inWindow(e, state.when)) return false;
      if (!q) return true;
      return [e.title, e.description, e.host, e.venue, e.city, CATEGORIES[e.category]]
        .join(" ").toLowerCase().includes(q);
    });

    if (state.origin) {
      list = list.map((e) => ({ ...e, distance: distanceMiles(state.origin, e) }))
        .sort((a, b) => a.distance - b.distance || a.startDate - b.startDate);
    } else {
      list.sort((a, b) => a.startDate - b.startDate);
    }
    return list;
  }

  function cardHtml(e) {
    const dist = e.distance != null ? `<span>${e.distance < 10 ? e.distance.toFixed(1) : Math.round(e.distance)} mi away</span>` : `<span>${escapeHtml(e.city)}</span>`;
    return `
      <button type="button" class="card" data-id="${escapeHtml(e.id)}">
        <div class="card-art tone-${escapeHtml(e.category)}">
          <span class="card-tag">${escapeHtml(CATEGORIES[e.category] || e.category)}</span>
        </div>
        <div class="card-body">
          <span class="card-date">${dayFmt.format(e.startDate)} · ${timeFmt.format(e.startDate)}</span>
          <h3>${escapeHtml(e.title)}</h3>
          <p class="card-meta">${escapeHtml(e.venue)}</p>
          <div class="card-foot">
            ${dist}
            <span class="price ${e.price === 0 ? "free" : ""}">${priceLabel(e)}</span>
          </div>
        </div>
      </button>`;
  }

  function render() {
    const list = filtered();
    grid.innerHTML = list.map(cardHtml).join("");
    $("empty-state").hidden = list.length > 0;
    $("result-count").textContent =
      list.length === 1 ? "1 gathering" : `${list.length} gatherings`;
  }

  function openEvent(id) {
    const e = events.find((x) => x.id === id);
    if (!e) return;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.address}, ${e.city}`)}`;
    const dist = state.origin ? `<dt>Distance</dt><dd>${distanceMiles(state.origin, e).toFixed(1)} miles</dd>` : "";
    $("dialog-body").innerHTML = `
      <button type="button" class="close-btn" aria-label="Close">×</button>
      <div class="card-art tone-${escapeHtml(e.category)}">
        <span class="card-tag">${escapeHtml(CATEGORIES[e.category] || e.category)}</span>
      </div>
      <div class="dialog-inner">
        <h2 id="dialog-title">${escapeHtml(e.title)}</h2>
        <p class="card-meta">with ${escapeHtml(e.host)}</p>
        <dl>
          <dt>When</dt><dd>${longDayFmt.format(e.startDate)}, ${timeFmt.format(e.startDate)} – ${timeFmt.format(e.endDate)}</dd>
          <dt>Where</dt><dd>${escapeHtml(e.venue)}<br>${escapeHtml(e.address)}, ${escapeHtml(e.city)}</dd>
          ${dist}
          <dt>Cost</dt><dd>${priceLabel(e)}${e.priceNote ? ` · ${escapeHtml(e.priceNote)}` : ""}</dd>
        </dl>
        <p>${escapeHtml(e.description)}</p>
        <div class="dialog-actions">
          ${e.url ? `<a class="btn" href="${escapeHtml(e.url)}" target="_blank" rel="noopener">Learn more &amp; book</a>` : ""}
          <a class="btn-soft" href="${mapUrl}" target="_blank" rel="noopener">Directions</a>
        </div>
      </div>`;
    dialog.showModal();
  }

  // ---------- events ----------
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
        note.textContent = "Showing the closest gatherings first.";
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
