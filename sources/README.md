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
| `../tools/eventbrite_collect.py` + `eventbrite_to_js.py` | Searches Eventbrite for wellness events and merges new ones into `data/events-eventbrite.js`. Events that have passed drop off. |

## The columns in `sources.csv`

- **look_for**:
  - `events`: a calendar with dated events; read it for new ones.
  - `still open`: a place listed as "open most days"; just make sure it's still there.
  - `eventbrite`: handled by the Eventbrite tools.
- **how_often**: `monthly` or `every 3 months`.
- **notes**: anything that helps the next person checking.

To add a source, add a row. Good sources have a page that lists dates, such as a studio's workshop page, a library calendar or a venue's events page.

## The monthly search

On the 25th of each month, a scheduled Claude session does the following:

1. Runs `python3 tools/check_sources.py` and the Eventbrite tools.
2. Reads the report and visits the changed pages. It adds new events that fit (wellness, calm, local, real date and place) to the right file in `data/`.
3. Removes listings for places that have closed. It flags anything it isn't sure about instead of guessing.
4. Searches the web for a few new sources and adds good ones to `sources.csv`.
5. Opens a pull request named "Monthly search: <month>" with a plain-English list of what it added, removed and is unsure about.

**Nothing goes live until you approve it.** Read the list, then either:

- Merge the pull request, which publishes it, or
- Tell Claude what to change ("drop the 3rd one", "don't list that studio").

## What the computer can't see

Events posted only on Instagram or Facebook. Those come in through the "List something good" form, or from you spotting them. Add the host's website to `sources.csv` if they have one.
