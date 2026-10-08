// Good Nearby event data.
// This is the site's "database" for now: one object per listing.
//
// Three kinds of listings:
//   • Dated events  — give `start` (and `end` if known), "YYYY-MM-DDTHH:MM" local time.
//                     They hide themselves once they're over.
//                     For all-day or multi-day events, use dates only: start "2026-11-14", end "2026-11-15".
//   • Weekly series — give `weekly`: { day: "Saturday", time: "10:00", endTime: "11:00",
//                     from: "2026-09-19", until: "2026-10-17", skip: ["2026-10-10"] }.
//                     The card shows the next session; hides after the last one.
//   • Ongoing       — leave out dates and describe the rhythm in `schedule`
//                     (e.g. "Classes daily"). Shown under "Any time".
//
// Fields:
//   id          unique slug
//   title       listing name
//   category    one of: yoga, sound, meditation, massage, breathwork, reiki, tai-chi, acupuncture, salt, workshop, expo
//   start, end  dated events only
//   weekly      weekly series only (see above)
//   schedule    short note on when it happens (ongoing listings)
//   venue       place name
//   address     street address
//   city        town, state
//   lat, lng    coordinates (approximate is fine — used for distance)
//   price       number in dollars, 0 for free, or null if unknown
//   priceNote   "sliding scale", "55+", etc. (optional)
//   host        teacher, practitioner or studio
//   description short, friendly summary
//   url         link to book or learn more (optional)
//   phone       contact number (optional)
//
// Listings below were gathered from public listings in early Oct 2026.
// Schedules change — the site always asks visitors to confirm with the host.

window.GOOD_NEARBY_EVENTS = [
  // ---------- Dated events & series ----------
  {
    id: "bpl-morning-yoga-allston",
    title: "Morning Yoga Flow",
    category: "yoga",
    start: "2026-10-03T09:30", end: "2026-10-03T10:30",
    venue: "Boston Public Library – Honan-Allston", address: "300 N Harvard St", city: "Allston, MA",
    lat: 42.3600, lng: -71.1290,
    price: 0, priceNote: "No registration needed",
    host: "Juliana Berfield",
    description: "An hour of vinyasa flow matching movement and breath, for beginners and experienced students alike. Mats, straps and blocks provided, first come first served.",
    url: "https://bpl.bibliocommons.com/events/69c585c1567ba1dd31fea12e"
  },
  {
    id: "parks-yoga-karma-savin-hill",
    title: "Free Yoga in Savin Hill Park",
    category: "yoga",
    weekly: { day: "Saturday", time: "10:00", endTime: "11:00", from: "2026-09-19", until: "2026-10-17" },
    venue: "Savin Hill Park", address: "25 Caspian Way", city: "Dorchester, MA",
    lat: 42.3110, lng: -71.0470,
    price: 0, priceNote: "Registration required",
    host: "Boston Parks Fitness Series (Karma)",
    description: "All-levels vinyasa linking breath with movement, surrounded by nature. Bring a mat or towel and water.",
    url: "https://www.boston.gov/calendar/parks-fitness-yoga-karma"
  },
  {
    id: "parks-yoga-debbie-elliot-norton",
    title: "Free Slow Flow Yoga in Chinatown",
    category: "yoga",
    weekly: { day: "Sunday", time: "08:00", endTime: "09:00", from: "2026-09-13", until: "2026-10-11" },
    venue: "Elliot Norton Park", address: "295 Tremont St", city: "Boston, MA",
    lat: 42.3490, lng: -71.0650,
    price: 0, priceNote: "Sign up on Eventbrite",
    host: "Boston Parks Fitness Series (Debbie)",
    description: "A slow flow mixing gentle movement with moments of stillness, with options to level up or down.",
    url: "https://www.boston.gov/calendar/parks-fitness-yoga-debbie"
  },
  {
    id: "mount-auburn-sunset-sound-bath",
    title: "Sunset Sound Bath",
    category: "sound",
    start: "2026-10-08T17:30",
    venue: "Mount Auburn Cemetery", address: "580 Mt Auburn St", city: "Cambridge, MA",
    lat: 42.3720, lng: -71.1450,
    price: null, priceNote: "Ticketed · selling fast",
    host: "Friends of Mount Auburn",
    description: "An outdoor guided meditation, relaxation and sound experience among the autumn trees.",
    url: "https://mountauburn.org"
  },
  {
    id: "healing-with-spirit-new-moon",
    title: "New Moon Vibrational Healing Gathering",
    category: "sound",
    start: "2026-10-10T10:00",
    venue: "Healing With Spirit", address: "185 Lincoln St, Suite 300", city: "Hingham, MA",
    lat: 42.2430, lng: -70.8850,
    price: 32,
    host: "Healing With Spirit",
    description: "Tibetan bowls, a gong bath, intuitive card pulls and seasonal wisdom in an intimate South Shore space.",
    url: "https://www.eventbrite.com/o/healing-with-spirit-3874767831"
  },
  {
    id: "plymouth-kripalu-yoga",
    title: "Kripalu Yoga (Session 2)",
    category: "yoga",
    weekly: { day: "Thursday", time: "18:30", endTime: "19:45", from: "2026-10-22", until: "2026-12-10", skip: ["2026-11-12", "2026-11-26"] },
    venue: "Memorial Hall", address: "83 Court St", city: "Plymouth, MA",
    lat: 41.9610, lng: -70.6680,
    price: null, priceNote: "Register through Plymouth Recreation",
    host: "Plymouth Recreation",
    description: "A gentle, compassionate Kripalu practice on Thursday evenings. No class Nov 12 or Nov 26.",
    url: "https://plymouthma.myrec.com/info/activities/program_details.aspx?ProgramID=19863"
  },
  {
    id: "wilhelmina-rest-restore",
    title: "Rest & Restore Sound Bath",
    category: "sound",
    start: "2026-10-25T10:00", end: "2026-10-25T11:05",
    venue: "lululemon Back Bay", address: "208 Newbury St", city: "Boston, MA",
    lat: 42.3500, lng: -71.0800,
    price: null,
    host: "Healing by Wilhelmina",
    description: "A 65-minute Reiki-infused sound bath to support energy, focus, clarity and resilience.",
    url: "https://healingbywilhelmina.com/public-event-and-retreats"
  },
  {
    id: "zest-night-of-mystique",
    title: "Halloween Night of Mystique & Sound Bath",
    category: "sound",
    start: "2026-10-30T18:30", end: "2026-10-30T21:30",
    venue: "ZEST The Collective", address: "282 Moody St", city: "Waltham, MA",
    lat: 42.3700, lng: -71.2370,
    price: null,
    host: "ZEST The Collective with Choose You Therapy",
    description: "Mocktails, psychic readings and botanical intention bundles, closing with a crystal-bowl sound bath to quiet the mind.",
    url: "https://www.eventbrite.com/e/halloween-night-of-mystique-psychic-readings-botanical-bundles-sound-ba-tickets-1995393546813"
  },

  {
    id: "health-wellness-fall-show-natick",
    title: "Health & Wellness Fall Show",
    category: "expo",
    start: "2026-10-04T10:00", end: "2026-10-04T15:00",
    venue: "The Verve Hotel", address: "1360 Worcester St", city: "Natick, MA",
    lat: 42.2990, lng: -71.3800,
    price: null,
    host: "Health and Wellness Show",
    description: "Complimentary health screenings, hands-on mini-treatments, talks on meditation, nutrition and holistic health, and local wellness vendors.",
    url: "https://healthandwellnessshow.net/"
  },
  {
    id: "back-to-basics-summit-framingham",
    title: "Back to Basics: Summit on Health & Wellness",
    category: "expo",
    start: "2026-10-17T09:00", end: "2026-10-17T17:00",
    venue: "Renaissance Framingham Hotel & Conference Center", address: "", city: "Framingham, MA",
    lat: 42.3040, lng: -71.3950,
    price: 135, priceNote: "Doors open 8 AM",
    host: "Back to Basics Conference",
    description: "A day-long conference examining health from the ground up — food, farming, and whole-person wellness.",
    url: "https://www.naturalawakeningsboston.com/2026/09/30/584612/back-to-basics-conference-examines-health-from-the-ground-up"
  },
  {
    id: "natural-living-expo-2026",
    title: "Natural Living Expo",
    category: "expo",
    start: "2026-11-14", end: "2026-11-15",
    venue: "Royal Plaza Trade Center", address: "181 Boston Post Rd W", city: "Marlborough, MA",
    lat: 42.3360, lng: -71.5900,
    price: 21, priceNote: "Weekend pass · $21 advance, $25 at the door",
    host: "Natural Living Expo",
    description: "New England's largest holistic health event: 200+ exhibitors, around 60 free workshops, guided meditations and healthy food.",
    url: "https://www.naturalexpo.org/"
  },

  // ---------- Ongoing classes & places ----------
  {
    id: "gentle-place-framingham",
    title: "Massage & Gentle Yoga",
    category: "massage",
    schedule: "Classes & appointments weekly",
    venue: "The Gentle Place", address: "665 Franklin St", city: "Framingham, MA",
    lat: 42.2830, lng: -71.4250,
    price: null,
    host: "The Gentle Place",
    description: "A MetroWest wellness center for massage therapy and yoga, with occasional yoga and sound bath workshops.",
    url: "https://thegentleplace.com",
    phone: "(508) 788-7300"
  },
  {
    id: "fyw-yoga",
    title: "Yoga Classes for Every Level",
    category: "yoga",
    schedule: "Classes daily",
    venue: "Franklin Yoga & Wellness",
    address: "1256 W Central St, Ste 2", city: "Franklin, MA",
    lat: 42.0905, lng: -71.4270,
    price: null,
    host: "Franklin Yoga & Wellness",
    description: "Hatha, vinyasa, power, gentle and prenatal yoga in a welcoming neighborhood studio.",
    url: "https://www.franklinyoga.com",
    phone: "(508) 520-4515"
  },
  {
    id: "fyw-sound",
    title: "Sound Bath",
    category: "sound",
    schedule: "Offered periodically",
    venue: "Franklin Yoga & Wellness",
    address: "1256 W Central St, Ste 2", city: "Franklin, MA",
    lat: 42.0905, lng: -71.4270,
    price: null,
    host: "Franklin Yoga & Wellness",
    description: "Lie back and let sound and vibration help your nervous system reset and relax. Check the studio's calendar for the next date.",
    url: "https://www.franklinyoga.com",
    phone: "(508) 520-4515"
  },
  {
    id: "fyw-meditation",
    title: "Meditation & Stress Reduction",
    category: "meditation",
    schedule: "Ongoing classes",
    venue: "Franklin Yoga & Wellness",
    address: "1256 W Central St, Ste 2", city: "Franklin, MA",
    lat: 42.0905, lng: -71.4270,
    price: null,
    host: "Franklin Yoga & Wellness",
    description: "Guided meditation and stress-reduction practices to help you slow down and find your center.",
    url: "https://www.franklinyoga.com",
    phone: "(508) 520-4515"
  },
  {
    id: "fyw-reiki-massage",
    title: "Reiki & Massage",
    category: "reiki",
    schedule: "By appointment",
    venue: "Franklin Yoga & Wellness",
    address: "1256 W Central St, Ste 2", city: "Franklin, MA",
    lat: 42.0905, lng: -71.4270,
    price: null,
    host: "Franklin Yoga & Wellness",
    description: "Holistic therapies including Reiki, massage and health coaching, right in the studio.",
    url: "https://www.franklinyoga.com",
    phone: "(508) 520-4515"
  },
  {
    id: "franklin-senior-tai-chi",
    title: "Tai Chi & Chair Yoga (55+)",
    category: "tai-chi",
    schedule: "Weekly classes, Mon–Fri",
    venue: "Franklin Senior Center",
    address: "10 Daniel McCahill St", city: "Franklin, MA",
    lat: 42.0850, lng: -71.3990,
    price: 4, priceNote: "Per class · for residents 55+",
    host: "Franklin Council on Aging",
    description: "Gentle tai chi and chair yoga for balance, strength and calm. See the Senior Center calendar for class times.",
    url: "https://www.franklinma.gov/583/Franklin-Senior-Center-Council-on-Aging",
    phone: "(508) 520-4945"
  },
  {
    id: "bellezza-massage",
    title: "Massage Therapy",
    category: "massage",
    schedule: "By appointment",
    venue: "Bellezza Day Spa",
    address: "72 Grove St", city: "Franklin, MA",
    lat: 42.0920, lng: -71.4080,
    price: null,
    host: "Bellezza Day Spa",
    description: "Relaxing massage in a full-service day spa, alongside facials and other treatments.",
    url: "http://www.bellezzaspafranklin.com",
    phone: "(508) 553-9000"
  },
  {
    id: "self-massage-acupuncture",
    title: "Massage & Acupuncture",
    category: "massage",
    schedule: "By appointment",
    venue: "SELF Aesthetics & Therapeutics",
    address: "323 W Central St", city: "Franklin, MA",
    lat: 42.0870, lng: -71.4060,
    price: null,
    host: "SELF Aesthetics & Therapeutics",
    description: "Therapeutic massage and acupuncture in downtown Franklin.",
    url: "",
    phone: "(508) 541-7353"
  },
  {
    id: "drift-oak-yoga",
    title: "Vinyasa, Yin & Restorative Yoga",
    category: "yoga",
    schedule: "Classes most days",
    venue: "Drift + Oak Yoga Studio",
    address: "165 Main St", city: "Medway, MA",
    lat: 42.1405, lng: -71.3960,
    price: null,
    host: "Drift + Oak",
    description: "A boutique studio offering energizing flows, grounding yin and restorative practice for all levels.",
    url: "https://www.driftandoak.com",
    phone: ""
  },
  {
    id: "upy-wrentham",
    title: "Power Yoga",
    category: "yoga",
    schedule: "Classes daily",
    venue: "Universal Power Yoga – Wrentham",
    address: "15 Ledgeview Way", city: "Wrentham, MA",
    lat: 42.0600, lng: -71.3480,
    price: null,
    host: "Universal Power Yoga",
    description: "Welcoming, all-levels power yoga focused on strength, breath and mental clarity.",
    url: "https://universalpoweryoga.com",
    phone: ""
  },
  {
    id: "healing-moon-sound",
    title: "Candlelit Sound Bath",
    category: "sound",
    schedule: "Offered periodically",
    venue: "The Healing Moon Wellness Center",
    address: "11 Margaret Rd", city: "Foxborough, MA",
    lat: 42.0700, lng: -71.2550,
    price: null,
    host: "The Healing Moon",
    description: "A guided meditation followed by crystal and Tibetan singing bowls, drums, bells and rattles — themed evenings like stress relief and forgiveness.",
    url: "https://www.thehealingmoon.com",
    phone: "(781) 929-7514"
  },
  {
    id: "healing-moon-reiki",
    title: "Reiki & Crystal Healing",
    category: "reiki",
    schedule: "By appointment",
    venue: "The Healing Moon Wellness Center",
    address: "11 Margaret Rd", city: "Foxborough, MA",
    lat: 42.0700, lng: -71.2550,
    price: null,
    host: "The Healing Moon",
    description: "Reiki, chakra balancing with Tibetan bowls, crystal healing and guided meditation sessions.",
    url: "https://www.thehealingmoon.com",
    phone: "(781) 929-7514"
  },
  // ---------- AcuPUNKture, Franklin ----------
  {
    id: "acupunkture-forgiveness-meditation",
    title: "Reiki-Infused Self-Forgiveness Guided Meditation",
    category: "meditation",
    start: "2026-10-11T13:00",
    venue: "AcuPUNKture & The Whimsical Wellness Boutique", address: "37 E Central St", city: "Franklin, MA",
    lat: 42.0838, lng: -71.3955,
    price: null, priceNote: "Call or text to reserve",
    host: "AcuPUNKture",
    description: "A gentle guided meditation on self-forgiveness, infused with Reiki, in AcuPUNKture's cozy community event space downtown.",
    url: "https://www.facebook.com/franklinacupunkture/",
    phone: "(508) 507-8015"
  },
  {
    id: "acupunkture-needles-namaste-nov",
    title: "Needles & Namaste: Acupuncture & Reiki-Infused Meditation",
    category: "meditation",
    start: "2026-11-08T18:30", end: "2026-11-08T19:30",
    venue: "AcuPUNKture & The Whimsical Wellness Boutique", address: "37 E Central St", city: "Franklin, MA",
    lat: 42.0838, lng: -71.3955,
    price: 80, priceNote: "Pre-registration required",
    host: "Crystal Farnsworth, L.Ac. & Tina Grzyboski (Reiki Vibes)",
    description: "Acupuncture and crystals, then a guided Reiki meditation into a quiet redwood forest. Mats, cushions, a fuzzy blanket and an eye mask are provided — just show up and rest for an hour.",
    url: "https://franklinacupunkture.com/upcoming-events-and-workshops/",
    phone: "(508) 507-8015"
  },
  {
    id: "acupunkture-needles-namaste-dec",
    title: "Needles & Namaste: Acupuncture & Reiki-Infused Meditation",
    category: "meditation",
    start: "2026-12-06T18:30", end: "2026-12-06T19:30",
    venue: "AcuPUNKture & The Whimsical Wellness Boutique", address: "37 E Central St", city: "Franklin, MA",
    lat: 42.0838, lng: -71.3955,
    price: 80, priceNote: "Pre-registration required",
    host: "Crystal Farnsworth, L.Ac. & Tina Grzyboski (Reiki Vibes)",
    description: "Acupuncture and crystals, then a guided Reiki meditation into a quiet redwood forest. Mats, cushions, a fuzzy blanket and an eye mask are provided — just show up and rest for an hour.",
    url: "https://franklinacupunkture.com/upcoming-events-and-workshops/",
    phone: "(508) 507-8015"
  },
  {
    id: "acupunkture-winter-solstice",
    title: "Winter Solstice: Acupuncture & Acoustic Sound Healing",
    category: "sound",
    start: "2026-12-20T18:30", end: "2026-12-20T19:30",
    venue: "AcuPUNKture & The Whimsical Wellness Boutique", address: "37 E Central St", city: "Franklin, MA",
    lat: 42.0838, lng: -71.3955,
    price: 80, priceNote: "Pre-registration required",
    host: "Crystal Farnsworth, L.Ac. & Maria Gauthier (Haven Sound)",
    description: "A peaceful evening to honor the solstice: acupuncture with gentle guitar, vocals and healing sounds. Rest, release the past season and welcome the return of the light.",
    url: "https://franklinacupunkture.com/upcoming-events-and-workshops/",
    phone: "(508) 507-8015"
  },
  {
    id: "acupunkture-acupuncture",
    title: "Acupuncture & Cupping",
    category: "acupuncture",
    schedule: "By appointment (new patients: waitlist)",
    venue: "AcuPUNKture & The Whimsical Wellness Boutique", address: "37 E Central St", city: "Franklin, MA",
    lat: 42.0838, lng: -71.3955,
    price: null, priceNote: "Accepts some insurance (BCBS, Harvard Pilgrim, MGB, Aetna) — confirm when you book",
    host: "Crystal Farnsworth, L.Ac.",
    description: "Private Chinese and Japanese style acupuncture, plus cupping, gua sha and moxibustion. The boutique also hosts monthly Needles & Namaste evenings, sound healing and reflexology clinics.",
    url: "https://acupunkture.janeapp.com/",
    phone: "(508) 507-8015"
  },

  // ---------- Salt caves ----------
  {
    id: "scituate-salt-cave",
    title: "Himalayan Salt Cave Session",
    category: "salt",
    schedule: "Open daily 9 AM – 5 PM · 45-minute sessions",
    venue: "Scituate Salt Cave", address: "164 Front St", city: "Scituate, MA",
    lat: 42.1990, lng: -70.7235,
    price: 40, priceNote: "$40 community cave · $50 private small cave",
    host: "Scituate Salt Cave",
    description: "Settle into a zero-gravity chair in the South Shore's Himalayan salt cave, right in Scituate Harbor. Quiet, dim and warm — 45 minutes to just breathe.",
    url: "https://scituatesaltcave.com/",
    phone: "(781) 545-7258"
  },
  {
    id: "just-breathe-salt-room",
    title: "Salt Room Session",
    category: "salt",
    schedule: "By appointment",
    venue: "Just Breathe A Salt Room", address: "45 E Main St", city: "Westborough, MA",
    lat: 42.2695, lng: -71.6135,
    price: null,
    host: "Just Breathe",
    description: "A calm salt room in downtown Westborough for a quiet, restful halotherapy session.",
    url: "",
    phone: "(508) 366-8292"
  },
  {
    id: "salted-soul-acton",
    title: "Salt Cave Relaxation",
    category: "salt",
    schedule: "By appointment",
    venue: "The Salted Soul Salt Cave", address: "340 Great Rd", city: "Acton, MA",
    lat: 42.4895, lng: -71.4475,
    price: null,
    host: "The Salted Soul",
    description: "Sit quietly in a Himalayan salt cave — a peaceful reset a little north of MetroWest.",
    url: "",
    phone: "(978) 206-9034"
  }
];
