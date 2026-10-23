# Safe wording for collected listings, shared by the collectors.
#
# Event photos and descriptions belong to the people who made them, so collected listings keep only
# facts (what, where, when, price, link) plus, for venues' and libraries' own public calendars,
# one short sentence. Photos are never stored; the site shows a free stock photo for each category.
import re

KIND = {
    "yoga": "A yoga class", "meditation": "A meditation session", "sound": "A sound bath",
    "massage": "A massage session", "reiki": "A reiki session", "tai-chi": "A tai chi class",
    "breathwork": "A breathwork session", "workshop": "A wellness workshop", "expo": "A wellness fair",
    "acupuncture": "An acupuncture session", "salt": "A salt cave session", "run": "A group run",
    "walk": "A group walk", "hike": "A group hike", "movement": "A movement class",
    "craft": "A creative class", "herbal": "An herbal class", "book": "A book group",
}


def facts_description(category, venue, city, where="the event page"):
    """'A creative class at Pilon Fleur in Sharon. See the event page for details and to sign up.'"""
    town = re.sub(r",\s*[A-Z]{2}$", "", (city or "").strip())
    place = re.split(r"[|,]", venue or "")[0].strip()    # "Open Doors | Braintree, MA" or "Park-9, Waters Ave, Everett" → the name
    at = f" at {place}" if place and not place.lower().startswith("see ") else ""
    near = f" in {town}" if town and town.lower() not in place.lower() else ""
    return f"{KIND.get(category, 'An event')}{at}{near}. See {where} for details and to sign up."


def short_sentence(text, limit=160, fallback="See the event page for details."):
    """The first sentence of a description, without stray markdown, at most ~160 characters."""
    clean = re.sub(r"[*_#]+", "", text or "")
    clean = re.sub(r"\s+", " ", clean).strip()
    if not clean:
        return fallback
    m = re.match(r"^.{20,}?[.!?](\s|$)", clean)
    first = (m.group(0) if m else clean).strip()
    if len(first) > limit:
        first = re.sub(r"\s+\S*$", "", first[: limit - 1]) + "…"
    return first
