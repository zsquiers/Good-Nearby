# Good Nearby

A warm, calm, ADHD-friendly way to find restorative events across Greater Boston, MetroWest and the South Shore — yoga, sound baths, meditation, massage, breathwork, reiki, tai chi, wellness expos and more.

## How it works

The first screen says **"Find what makes you feel good."** and offers two ways in:

**1. By feeling (one good thing at a time)**
- "What would feel good right now?" — Move my body, Quiet my mind, Be cared for, Make something good (pottery, painting, flowers, cooking), Wander somewhere cozy (independent cafés, bakeries and little shops), Be with good people (classes, circles and book groups), or ✨ Surprise me.
- Then one event at a time, soonest first (or closest first with "Show what's closest to me first"), with plain-language times ("Saturday · 10 AM — in 5 days").
- Three buttons: ♡ Save, I'm in, Next. "I'm in" reveals Add to my calendar (with a 2-hour reminder), Directions, Sign up and Call.

**2. Browse by area & day**
- Pick an area — Franklin & nearby, MetroWest, Boston area, South Shore, or Everywhere — and a day from a 14-day grid that shows how many things are on each day (or any other date). The area is remembered.
- See everything that day grouped into Morning, Afternoon and Evening, with ‹ › to move day by day. Empty days offer the next day with something on, and a link to what's on elsewhere. Classes and practitioners without fixed dates sit in a collapsed "Also open most days" section.
- Tap anything to open it as a card; Next steps through the rest of that day.

Shareable links: `#/day/franklin-area/2026-10-17` opens that day in Franklin & nearby.

Design rules: one decision per screen, no menus, big tap targets, plain language, gentle motion (none for visitors who prefer reduced motion). Keyboard: → next card / next day, ← back, S save. On phones, swipe left/right.

## What's here

| File | Purpose |
| --- | --- |
| `index.html` | The screens: start, browse (area + day), day list, one-at-a-time card, saved |
| `styles.css` | The warm, golden look (cream, olive, DM Serif Display) — see `docs/design-reference.webp` |
| `app.js` | Moods, decks, area & day browsing, saving, calendar files, location sorting |
| `data/events.js` | Hand-picked listings — one entry per event |
| `data/events-eventbrite.js` | ~140 wellness events found on Eventbrite across the region (generated, reviewed by hand) |
| `data/events-move-shops.js` | Community runs, walks & hikes, all the salt caves, holistic shops and nature trails |
| `data/events-venues.js` | Calendars from local venues: Scituate Salt Cave and House of Stellium |
| `data/events-libraries.js` | Book groups, creative classes and wellness programs at 13 local libraries (made by `tools/library_collect.py`) |
| `data/events-herbal.js` | Herbal classes, tea nights and herbal shops |
| `data/events-cafes.js` | Cozy independent cafés, bakeries and garden-center / farm cafés (no chains) |
| `sources/` | The list of every source we check, and the monthly report (see `sources/README.md`) |
| `tools/` | Small scripts that check sources and pull in Eventbrite events |
| `data/towns.js` | The areas for browsing and the towns in each (an event's area comes from its town) |
| `.github/ISSUE_TEMPLATE/submit-event.yml` | An older GitHub-based submission form (the site now uses its own form) |

It's plain HTML, CSS and JavaScript — no build step or installs needed.

## View it locally

Open `index.html` in your browser. That's it.

## Add or edit events

Open `data/events.js` and copy an existing entry that matches the kind of listing:

- **One-time event:** `start: "2026-10-08T17:30"` (add `end` if known)
- **All-day or multi-day event:** dates only, e.g. `start: "2026-11-14", end: "2026-11-15"`
- **Weekly series:** `weekly: { day: "Saturday", time: "10:00", endTime: "11:00", from: "2026-09-19", until: "2026-10-17", skip: [] }`
- **Ongoing class or practitioner:** no dates, just a `schedule` note such as `"Classes daily"` or `"By appointment"`

Feelings map to categories in `app.js` (`MOODS`). An event's browse area comes from its town in `data/towns.js` (or the nearest listed town). Categories: `yoga`, `sound`, `meditation`, `massage`, `breathwork`, `reiki`, `tai-chi`, `acupuncture`, `salt`, `run`, `walk`, `hike`, `movement`, `shop`, `cafe`, `bakery`, `craft`, `herbal`, `book`, `workshop`, `expo`. Optional `tags`: `free`, `come-alone`, `beginner`, `women`, `all-paces`, `outdoors`, `gluten-free` — shown as friendly chips. A `weekly` listing with no `from`/`until` is an ongoing weekly meetup and repeats for the next four months. Add `lat`/`lng` so "Near me" can sort by distance (approximate is fine). Past events and finished series hide themselves automatically.

The current listings came from public event pages and directories in early October 2026. Every source is listed in `sources/sources.csv`, and a monthly search checks them for new events. See `sources/README.md` for how it works. Coordinates are approximate. Good places to find more events: the Natural Awakenings Boston calendar, Eventbrite, boston.gov's Parks Fitness Series, local library calendars, and studio websites.

## Photos

Photos load from Unsplash. Each event uses a photo for its category, set in the `CATEGORY` list at the top of `app.js`. The background photo is set as `--hero` in `styles.css`. If a photo fails to load, a warm gradient shows instead. Before a big launch, consider downloading your favorite photos into `assets/` so they never depend on another site.

## Listing events (for hosts)

"Know something good? Share it here" (bottom of every page) opens **Share something good**, modeled on Community Kangaroo. First, people choose **I'm hosting it** or **I'm recommending something I love**. Hosts pick the area, then give the basics: the name, town, a link with the details (and an optional day-of updates link), and their name, email and organization (not published). They can optionally add the type, date, address and cost. People recommending something just say what it is, the town, and a few words about when and why it's good. A link and their contact details are optional. A short "What we list" guide sits on top. Every submission is reviewed before it goes live.

- **Connecting it:** create a free form at [Formspree](https://formspree.io) and put its id (the part after `/f/` in the form's address) in `SUBMISSIONS.formspreeId` at the top of `app.js`. Formspree emails you each submission. Until then the form thanks the host and explains online listing is being set up — nothing is sent.
- **Adding an approved listing:** each email includes `paste_into_events_js` — a finished entry (with the town's approximate location) to paste into `data/events.js`.

## Weekend Favorites newsletter

- **Sign-up:** the "💌 Weekend Favorites" link on the first screen opens a page with an email sign-up and a live preview of this weekend's picks. The end of every list also nudges people there.
- **Connecting it:** create a free account at [Buttondown](https://buttondown.com), then put your Buttondown username in `NEWSLETTER.buttondownUsername` at the top of `app.js`. Until then the form politely says sign-ups open soon and collects nothing.
- **Writing it:** open `newsletter.html` on the site (it isn't linked anywhere). It builds this weekend's email from `data/events.js`, with a subject line — check it, then copy it into Buttondown.

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
