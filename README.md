# Good Nearby

A warm, calm directory of restorative events near you — yoga, sound baths, meditation, massage, breathwork, reiki, tai chi and more.

## What's here

| File | Purpose |
| --- | --- |
| `index.html` | The page layout |
| `styles.css` | The warm, natural look (oat, sage, clay; automatic dark mode) |
| `app.js` | Search, practice filters, date filters, "Near me" distance sorting, event details |
| `data/events.js` | The event "database" — one entry per event |
| `.github/ISSUE_TEMPLATE/submit-event.yml` | The "Share an event" form hosts fill out |

It's plain HTML, CSS and JavaScript — no build step or installs needed.

## View it locally

Open `index.html` in your browser. That's it.

## Add or edit events

Open `data/events.js` and copy an existing entry. Each event needs a unique `id`, a `category` (`yoga`, `sound`, `meditation`, `massage`, `breathwork`, `reiki`, `tai-chi` or `workshop`), start/end times, a venue, and `lat`/`lng` coordinates so "Near me" can sort by distance. Past events hide themselves automatically.

The sample events are placeholders set around Boulder, CO — replace them with real listings from your area.

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
