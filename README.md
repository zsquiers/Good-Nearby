# Good Nearby

A warm, calm, ADHD-friendly way to find restorative events across Greater Boston, MetroWest and the South Shore — yoga, sound baths, meditation, massage, breathwork, reiki, tai chi, wellness expos and more.

## How it works

1. **One question:** "What would feel good right now?" — Move my body, Quiet my mind, Be cared for, Be with good people, or Surprise me.
2. **One event at a time**, soonest first (or closest first, if the visitor shares location), with times in plain words ("Saturday · 10 AM — in 5 days").
3. **Three buttons:** ♡ Save, I'm in, Next. "I'm in" reveals Add to my calendar (with a 2-hour reminder), Directions, Sign up and Call.

Design rules: one decision per screen, no menus, big tap targets, plain language, gentle motion (none for visitors who prefer reduced motion). Keyboard: → next, ← back, S save. On phones, swipe left for next.

## What's here

| File | Purpose |
| --- | --- |
| `index.html` | The three screens: question, one-at-a-time card, saved list |
| `styles.css` | The warm, golden look (cream, olive, DM Serif Display) — see `docs/design-reference.webp` |
| `app.js` | Moods, the one-at-a-time deck, saving, calendar files, location sorting |
| `data/events.js` | The event "database" — one entry per event |
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

Moods map to categories in `app.js` (`MOODS`). Categories: `yoga`, `sound`, `meditation`, `massage`, `breathwork`, `reiki`, `tai-chi`, `workshop`, `expo`. Add `lat`/`lng` so "Near me" can sort by distance (approximate is fine). Past events and finished series hide themselves automatically.

The current listings came from public event pages and directories in early October 2026. Coordinates are approximate. Good places to find more events: the Natural Awakenings Boston calendar, Eventbrite, boston.gov's Parks Fitness Series, local library calendars, and studio websites.

## Photos

Photos load from Unsplash. Each event uses a photo for its category, set in the `CATEGORY` list at the top of `app.js`. The background photo is set as `--hero` in `styles.css`. If a photo fails to load, a warm gradient shows instead. Before a big launch, consider downloading your favorite photos into `assets/` so they never depend on another site.

## Newsletter (planned)

A newsletter sign-up is planned. It was removed from the page for now to keep things calm; a good home for it later is the "That's everything for now" screen at the end of a list.

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
