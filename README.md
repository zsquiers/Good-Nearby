# Good Nearby

A warm, calm, ADHD-friendly way to find restorative events across Greater Boston, MetroWest and the South Shore — yoga, sound baths, meditation, massage, breathwork, reiki, tai chi, wellness expos and more.

## How it works

1. **Where do you live?** Tap your town (or type it, or "Use my location"). It's remembered on this device.
2. **Which day?** A 14-day grid shows how many good things are on within 20 miles each day (a faint "+2" means a bit farther). Or choose any date.
3. **Everything that day,** grouped into Morning, Afternoon and Evening, with ‹ › to move day by day. Optional filters: Move, Calm, Be cared for, Gatherings. Things 20–40 miles away are listed under "A bit farther", and classes or practitioners without fixed dates sit in a collapsed "Also open most days near you". An empty day offers a button to the next day with something nearby.
4. **Tap an event** for the details, then ♡ Save or **I'm in** (Add to my calendar with a 2-hour reminder, Directions, Sign up, Call).

Links are shareable: `#/day/franklin/2026-10-17` opens that day near Franklin.

Design rules: one decision per screen, no menus, big tap targets, plain language, gentle motion (none for visitors who prefer reduced motion). Keyboard: ← → change the day. On phones, swipe left/right on the day view.

## What's here

| File | Purpose |
| --- | --- |
| `index.html` | The screens: town, day grid, day list, event, saved |
| `styles.css` | The warm, golden look (cream, olive, DM Serif Display) — see `docs/design-reference.webp` |
| `app.js` | Town & day logic, distance, filters, saving, calendar files |
| `data/events.js` | The event "database" — one entry per event |
| `data/towns.js` | Towns people can pick, grouped by area, with approximate centers |
| `.github/ISSUE_TEMPLATE/submit-event.yml` | The "Share an event" form hosts fill out |

It's plain HTML, CSS and JavaScript — no build step or installs needed.

## View it locally

Open `index.html` in your browser. That's it.

## Add or edit events

Open `data/events.js` and copy an existing entry that matches the kind of listing:

- **One-time event:** `start: "2026-10-08T17:30"` (add `end` if known)
- **All-day or multi-day event:** dates only, e.g. `start: "2026-11-14", end: "2026-11-15"`
- **Weekly series:** `weekly: { day: "Saturday", time: "10:00", endTime: "11:00", from: "2026-09-19", until: "2026-10-17", skip: [] }`
- **Ongoing class or practitioner:** no dates, just a `schedule` note such as `"Classes daily"` or `"By appointment"`

The day-view filters map to categories in `app.js` (`MOODS`); "near" is 20 miles and "a bit farther" is 40 (`NEAR_MILES`, `FAR_MILES`). Categories: `yoga`, `sound`, `meditation`, `massage`, `breathwork`, `reiki`, `tai-chi`, `workshop`, `expo`. Add `lat`/`lng` so "Near me" can sort by distance (approximate is fine). Past events and finished series hide themselves automatically.

The current listings came from public event pages and directories in early October 2026. Coordinates are approximate. Good places to find more events: the Natural Awakenings Boston calendar, Eventbrite, boston.gov's Parks Fitness Series, local library calendars, and studio websites.

## Photos

Photos load from Unsplash. Each event uses a photo for its category, set in the `CATEGORY` list at the top of `app.js`. The background photo is set as `--hero` in `styles.css`. If a photo fails to load, a warm gradient shows instead. Before a big launch, consider downloading your favorite photos into `assets/` so they never depend on another site.

## Newsletter (planned)

A newsletter sign-up is planned. It was removed from the page for now to keep things calm; a good home for it later is under the day list or on empty days ("Get a note when something's on near you").

## Updating the site

After changing `styles.css`, `app.js` or `data/events.js`, bump the `?v=` number on their links in `index.html` so visitors' browsers fetch the new files right away.

## Publish it free with GitHub Pages

1. In this repo on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
3. After a minute your site is live at `https://zsquiers.github.io/Good-Nearby/`.

## Ideas for next steps

- Move events into a real database (e.g. Supabase or Airtable) so hosts can submit without editing code
- A map view of events
- Event images and host profiles
- Recurring events (e.g. "every Tuesday")
- A custom domain like `goodnearby.com`
