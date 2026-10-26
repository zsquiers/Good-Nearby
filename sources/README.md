# How Good Nearby finds things

Community Kangaroo's team checks over 2,000 websites by hand every month. Good Nearby lets the computer do the checking, and a person does the choosing.

## The pieces

| File | What it is |
| --- | --- |
| `sources.csv` | Every place we check: studios, venues, calendars, cafés. Open it in Excel, Numbers or Google Sheets to add a row. |
| `snapshots/` | A plain-text copy of each page from the last check, so the next check can spot what's new. |
| `last-check.json` | When each source was last checked. |
| `report.md` | The latest report: what changed, what's new, and what couldn't be reached. |
| `../tools/check_sources.py` | Checks the sources that are due and writes the report. |
| `../tools/eventbrite_collect.py` + `eventbrite_to_js.py` | **Paused** (Eventbrite's terms forbid automated collection). Searches Eventbrite for wellness events (and, with `--make`, creative classes) and merges new ones into `data/events-eventbrite.js`. Events that have passed drop off. Chains, kids' events and bar nights are skipped. |
| `../tools/calendar_collect.py` | Reads venues' own calendars (any site using the WordPress "Events Calendar") and turns repeating classes into weekly listings (`data/events-calendars.js`). Add a venue to its `SITES` list. |
| `../tools/meetup_collect.py` | **Paused** (Meetup's terms forbid automated collection). Searches Meetup around 8 towns for in-person meditation, yoga, sound, breathwork, tai chi, hiking and book groups (`data/events-meetup.js`). Only real places in our towns; skips anything another file already lists. |
| `../tools/collector_health.py` | The alarm. Run it after the collectors: it compares each file with last month (`collector-counts.json`) and writes `health.md`, warning if a collector found nothing new, a file shrank a lot, the next two weeks look thin, or Eventbrite/Meetup photos stopped loading. |
| `../tools/library_collect.py` | Reads 13 local library calendars at once and keeps the adult book groups, creative classes and wellness programs (`data/events-libraries.js`). Add a library to its `LIBRARIES` list. |

## The columns in `sources.csv`

- **look_for**:
  - `events`: a calendar with dated events; read it for new ones.
  - `still open`: a place listed as "open most days"; just make sure it's still there.
  - `eventbrite` / `libraries` / `calendars` / `meetup`: handled by their own tools.
- **how_often**: `monthly` or `every 3 months`.
- **notes**: anything that helps the next person checking.

To add a source, add a row. Good sources have a page that lists dates, such as a studio's workshop page, a library calendar or a venue's events page.

## The monthly search

On the 25th of each month, a scheduled Claude session does the following:

1. Runs `python3 tools/check_sources.py`, `tools/library_collect.py` and `tools/calendar_collect.py` (Eventbrite and Meetup collection is paused).
2. Reads the report and visits the changed pages. It adds new events that fit (wellness, calm, local, real date and place) to the right file in `data/`.
3. Removes listings for places that have closed. It flags anything it isn't sure about instead of guessing.
4. Searches the web for a few new sources and adds good ones to `sources.csv`.
5. Opens a pull request named "Monthly search: <month>" with a plain-English list of what it added, removed and is unsure about.

**Nothing goes live until you approve it.** Read the list, then either:

- Merge the pull request, which publishes it, or
- Tell Claude what to change ("drop the 3rd one", "don't list that studio").

## What the computer can't see

Events posted only on Instagram or Facebook. Those come in through the "List something good" form, or from you spotting them. Add the host's website to `sources.csv` if they have one.

## Staying low-risk

- Collected listings keep **facts only** (what, where, when, price, link). Venue and library calendars keep one short sentence. Wording comes from `tools/listing_text.py`.
- **No collected photos** are stored or shown; cards use free stock photos (Unsplash/Pexels). A listing's own photo appears only with `photoOk: true`, when the host has given permission.
- **Eventbrite and Meetup collection is paused** because their terms forbid automated collection. Listings already found stay up as facts with a link back until their dates pass.
- If anyone asks for a listing or photo to be removed, remove it the same day.

## Replacing Eventbrite

Most Eventbrite listings belong to local hosts who also post on their own sites. `hosts-to-contact.csv` lists the main ones in our areas, with where to reach them and the next step: either "monthly search reads their site" (their events page is in `sources.csv`) or "ask to list" (no website found, so reach out on Instagram/Facebook). Fill in the Status column as you go. The monthly search should add events from those hosts' own pages, never from Eventbrite.

## Areas that need more sources

- **Taunton, Berkley, Raynham, Dighton, Bridgewater & Middleborough** (added to the South Shore area in Oct 2026). So far: Dighton Rock and Massasoit state parks, Taunton Public Library and Wat Nawamin in Raynham. Look for studios, libraries, land trusts and cafés there that publish their own calendars.
