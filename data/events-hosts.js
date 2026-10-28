// Events taken from hosts' own websites (facts only: what, when, where, price, link), replacing
// what used to come from Eventbrite. Checked against each host's page; add more by copying an entry.
// See sources/hosts-to-contact.csv for which hosts to read or contact.

window.GOOD_NEARBY_EVENTS = (window.GOOD_NEARBY_EVENTS || []).concat([

  // ---------- Joyful Kitchen Cooking School, Wellesley (joyfulkitchen.com/classes) ----------
  {
    id: "joyful-tuscany-2026-10-27", title: "Autumn in Tuscany: Rustic Flavors of the Italian Countryside",
    category: "craft", start: "2026-10-27T18:00", end: "2026-10-27T21:00",
    venue: "Joyful Kitchen Cooking School", address: "12 Greenwood Rd", city: "Wellesley, MA", lat: 42.3060, lng: -71.2870,
    price: 135, host: "Joyful Kitchen Cooking School",
    description: "A hands-on evening cooking class in Wellesley. See the class page for the menu and to sign up.",
    url: "https://joyfulkitchen.com/classes/tuscany-tues", tags: ["come-alone"]
  },
  {
    id: "joyful-tuscany-2026-10-29", title: "Autumn in Tuscany: Rustic Flavors of the Italian Countryside",
    category: "craft", start: "2026-10-29T10:30", end: "2026-10-29T13:30",
    venue: "Joyful Kitchen Cooking School", address: "12 Greenwood Rd", city: "Wellesley, MA", lat: 42.3060, lng: -71.2870,
    price: 135, host: "Joyful Kitchen Cooking School",
    description: "A hands-on morning cooking class in Wellesley. See the class page for the menu and to sign up.",
    url: "https://joyfulkitchen.com/classes/tuscany-thurs", tags: ["come-alone"]
  },
  {
    id: "joyful-emilia-romagna-2026-11-03", title: "Holidays in Emilia-Romagna: Abundance on the Table",
    category: "craft", start: "2026-11-03T18:00", end: "2026-11-03T21:00",
    venue: "Joyful Kitchen Cooking School", address: "12 Greenwood Rd", city: "Wellesley, MA", lat: 42.3060, lng: -71.2870,
    price: 135, host: "Joyful Kitchen Cooking School",
    description: "A hands-on evening cooking class in Wellesley. See the class page for the menu and to sign up.",
    url: "https://joyfulkitchen.com/classes/holiday-emilia-romagna-tues", tags: ["come-alone"]
  },
  {
    id: "joyful-emilia-romagna-2026-11-05", title: "Holidays in Emilia-Romagna: Abundance on the Table",
    category: "craft", start: "2026-11-05T10:30", end: "2026-11-05T13:30",
    venue: "Joyful Kitchen Cooking School", address: "12 Greenwood Rd", city: "Wellesley, MA", lat: 42.3060, lng: -71.2870,
    price: 135, host: "Joyful Kitchen Cooking School",
    description: "A hands-on morning cooking class in Wellesley. See the class page for the menu and to sign up.",
    url: "https://joyfulkitchen.com/classes/holiday-emilia-romagna-wed", tags: ["come-alone"]
  },
  {
    id: "joyful-six-seasons-pasta-2026-12-08", title: "Cookbook Addiction: Six Seasons of Pasta",
    category: "craft", start: "2026-12-08T18:00", end: "2026-12-08T21:00",
    venue: "Joyful Kitchen Cooking School", address: "12 Greenwood Rd", city: "Wellesley, MA", lat: 42.3060, lng: -71.2870,
    price: 165, host: "Joyful Kitchen Cooking School",
    description: "A hands-on evening pasta class in Wellesley, cooking from Joshua McFadden's book. See the class page to sign up.",
    url: "https://joyfulkitchen.com/classes/six-seasons-of-pasta-tues", tags: ["come-alone"]
  },
  {
    id: "joyful-six-seasons-pasta-2026-12-10", title: "Cookbook Addiction: Six Seasons of Pasta",
    category: "craft", start: "2026-12-10T10:30", end: "2026-12-10T13:30",
    venue: "Joyful Kitchen Cooking School", address: "12 Greenwood Rd", city: "Wellesley, MA", lat: 42.3060, lng: -71.2870,
    price: 165, host: "Joyful Kitchen Cooking School",
    description: "A hands-on morning pasta class in Wellesley, cooking from Joshua McFadden's book. See the class page to sign up.",
    url: "https://joyfulkitchen.com/classes/six-seasons-of-pasta-thurs", tags: ["come-alone"]
  },

  // ---------- Emerald Yoga Studio, Pembroke (emeraldyoga.com/events · /classes) — said yes to being listed, Oct 2026 ----------
  {
    id: "emerald-chakra-root-2026-11-06", title: "Restorative Journey Through the Chakras: Root",
    category: "yoga", start: "2026-11-06T17:30", end: "2026-11-06T18:45",
    venue: "Emerald Yoga Studio", address: "15 Columbia Rd, Ste 10", city: "Pembroke, MA", lat: 42.1057, lng: -70.8077,
    price: 40, priceNote: "or $210 for all 7 (members pay less)", host: "Emerald Yoga Studio",
    description: "Grounding poses and stillness, with aromatherapy and meditation. Part of a 7-week restorative series; come to one night or all. No yoga experience needed.",
    url: "https://www.emeraldyoga.com/chakra-journey", tags: ["come-alone", "beginner"]
  },
  {
    id: "emerald-chakra-sacral-2026-11-13", title: "Restorative Journey Through the Chakras: Sacral",
    category: "yoga", start: "2026-11-13T17:30", end: "2026-11-13T18:45",
    venue: "Emerald Yoga Studio", address: "15 Columbia Rd, Ste 10", city: "Pembroke, MA", lat: 42.1057, lng: -70.8077,
    price: 40, priceNote: "or $210 for all 7 (members pay less)", host: "Emerald Yoga Studio",
    description: "Soft, sensory movement, with aromatherapy and meditation. Part of a 7-week restorative series; come to one night or all. No yoga experience needed.",
    url: "https://www.emeraldyoga.com/chakra-journey", tags: ["come-alone", "beginner"]
  },
  {
    id: "emerald-chakra-solar-plexus-2026-11-20", title: "Restorative Journey Through the Chakras: Solar Plexus",
    category: "yoga", start: "2026-11-20T17:30", end: "2026-11-20T18:45",
    venue: "Emerald Yoga Studio", address: "15 Columbia Rd, Ste 10", city: "Pembroke, MA", lat: 42.1057, lng: -70.8077,
    price: 40, priceNote: "or $210 for all 7 (members pay less)", host: "Emerald Yoga Studio",
    description: "Restorative poses and intention-setting, with aromatherapy and meditation. Part of a 7-week restorative series; come to one night or all. No yoga experience needed.",
    url: "https://www.emeraldyoga.com/chakra-journey", tags: ["come-alone", "beginner"]
  },
  {
    id: "emerald-chakra-heart-2026-11-27", title: "Restorative Journey Through the Chakras: Heart",
    category: "yoga", start: "2026-11-27T17:30", end: "2026-11-27T18:45",
    venue: "Emerald Yoga Studio", address: "15 Columbia Rd, Ste 10", city: "Pembroke, MA", lat: 42.1057, lng: -70.8077,
    price: 40, priceNote: "or $210 for all 7 (members pay less)", host: "Emerald Yoga Studio",
    description: "A nurturing evening to soften and ease, with aromatherapy and meditation. Part of a 7-week restorative series; come to one night or all. No yoga experience needed.",
    url: "https://www.emeraldyoga.com/chakra-journey", tags: ["come-alone", "beginner"]
  },
  {
    id: "emerald-chakra-throat-2026-12-04", title: "Restorative Journey Through the Chakras: Throat",
    category: "yoga", start: "2026-12-04T17:30", end: "2026-12-04T18:45",
    venue: "Emerald Yoga Studio", address: "15 Columbia Rd, Ste 10", city: "Pembroke, MA", lat: 42.1057, lng: -70.8077,
    price: 40, priceNote: "or $210 for all 7 (members pay less)", host: "Emerald Yoga Studio",
    description: "Gentle poses for honest expression, with aromatherapy and meditation. Part of a 7-week restorative series; come to one night or all. No yoga experience needed.",
    url: "https://www.emeraldyoga.com/chakra-journey", tags: ["come-alone", "beginner"]
  },
  {
    id: "emerald-chakra-third-eye-2026-12-11", title: "Restorative Journey Through the Chakras: Third Eye",
    category: "yoga", start: "2026-12-11T17:30", end: "2026-12-11T18:45",
    venue: "Emerald Yoga Studio", address: "15 Columbia Rd, Ste 10", city: "Pembroke, MA", lat: 42.1057, lng: -70.8077,
    price: 40, priceNote: "or $210 for all 7 (members pay less)", host: "Emerald Yoga Studio",
    description: "Quiet, meditative postures, with aromatherapy and meditation. Part of a 7-week restorative series; come to one night or all. No yoga experience needed.",
    url: "https://www.emeraldyoga.com/chakra-journey", tags: ["come-alone", "beginner"]
  },
  {
    id: "emerald-chakra-crown-2026-12-18", title: "Restorative Journey Through the Chakras: Crown",
    category: "yoga", start: "2026-12-18T17:30", end: "2026-12-18T18:45",
    venue: "Emerald Yoga Studio", address: "15 Columbia Rd, Ste 10", city: "Pembroke, MA", lat: 42.1057, lng: -70.8077,
    price: 40, priceNote: "or $210 for all 7 (members pay less)", host: "Emerald Yoga Studio",
    description: "A peaceful, reflective close to the year, with aromatherapy and meditation. Part of a 7-week restorative series; come to one night or all. No yoga experience needed.",
    url: "https://www.emeraldyoga.com/chakra-journey", tags: ["come-alone", "beginner"]
  },

  // ---------- JPH at Ferry Hill, Marshfield (jphcommunity.org/programs-events, monthly PDF calendar) — said yes, Oct 2026 ----------
  // A nonprofit; most programs are free and grant-funded. Support groups (trauma, recovery, grief, caregivers) are left off on purpose.
  {
    id: "jph-open-art-studio-2026-11-04", title: "Open Art Studio",
    category: "craft", start: "2026-11-04T11:30", end: "2026-11-04T12:45",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: 0, priceNote: "register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "A relaxed open art studio. Drop your worries and make something. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-open-art-studio-2026-11-11", title: "Open Art Studio",
    category: "craft", start: "2026-11-11T11:30", end: "2026-11-11T12:45",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: 0, priceNote: "register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "A relaxed open art studio. Drop your worries and make something. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-open-art-studio-2026-11-18", title: "Open Art Studio",
    category: "craft", start: "2026-11-18T11:30", end: "2026-11-18T12:45",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: 0, priceNote: "register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "A relaxed open art studio. Drop your worries and make something. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-dragonfly-yoga-2026-11-04", title: "Dragonfly Yoga with Emma",
    category: "yoga", start: "2026-11-04T17:30", end: "2026-11-04T18:45",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: null, priceNote: "small fee, register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "An evening yoga class at JPH's peaceful Ferry Hill property. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-dragonfly-yoga-2026-11-11", title: "Dragonfly Yoga with Emma",
    category: "yoga", start: "2026-11-11T17:30", end: "2026-11-11T18:45",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: null, priceNote: "small fee, register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "An evening yoga class at JPH's peaceful Ferry Hill property. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-dragonfly-yoga-2026-11-18", title: "Dragonfly Yoga with Emma",
    category: "yoga", start: "2026-11-18T17:30", end: "2026-11-18T18:45",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: null, priceNote: "small fee, register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "An evening yoga class at JPH's peaceful Ferry Hill property. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-mothers-reset-2026-11-05", title: "Mother's Reset",
    category: "reiki", start: "2026-11-05T10:00", end: "2026-11-05T11:30",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: null, priceNote: "small fee, register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "A restful morning just for moms. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-mothers-reset-2026-11-19", title: "Mother's Reset",
    category: "reiki", start: "2026-11-19T10:00", end: "2026-11-19T11:30",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: null, priceNote: "small fee, register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "A restful morning just for moms. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-breathing-room-2026-11-08", title: "Breathing Room: Yin Yoga & Sound",
    category: "sound", start: "2026-11-08T10:00", end: "2026-11-08T11:15",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: null, priceNote: "small fee, register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "Slow yin yoga followed by a sound meditation. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-community-meditation-2026-11-09", title: "Community Meditation",
    category: "meditation", start: "2026-11-09T19:00", end: "2026-11-09T20:00",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: 0, priceNote: "register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "A free evening group meditation. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-qigong-2026-11-10", title: "Inner Balance Qigong",
    category: "tai-chi", start: "2026-11-10T18:00", end: "2026-11-10T19:00",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: 0, priceNote: "register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "Gentle qigong movement and breathing. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-midday-reset-2026-11-11", title: "Pause & Restore: Midday Reset",
    category: "meditation", start: "2026-11-11T12:00", end: "2026-11-11T13:30",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: null, priceNote: "small fee, register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "A midday break to pause and restore. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-restorative-yoga-2026-11-14", title: "Restorative Yoga: Reset & Recenter",
    category: "yoga", start: "2026-11-14T09:30", end: "2026-11-14T10:45",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: null, priceNote: "small fee, register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "Slow, supported restorative yoga. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-back-to-earth-2026-11-15", title: "Back to Earth",
    category: "meditation", start: "2026-11-15T10:00", end: "2026-11-15T11:00",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: 0, priceNote: "register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "A free grounding session. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-candlelight-meditation-2026-11-16", title: "Candlelight Meditation: A Journey of Deep Rest",
    category: "meditation", start: "2026-11-16T18:00", end: "2026-11-16T19:00",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: 0, priceNote: "register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "A free candlelit meditation for deep rest. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-dragonfly-experience-2026-11-22", title: "Dragonfly Experience: Yoga, Sound & Reiki",
    category: "reiki", start: "2026-11-22T10:30", end: "2026-11-22T12:00",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: null, priceNote: "small fee, register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "Yoga, a sound bath and reiki in one morning. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },
  {
    id: "jph-holiday-art-2026-11-30", title: "Community Holiday Art",
    category: "craft", start: "2026-11-30T18:00", end: "2026-11-30T19:30",
    venue: "JPH at Ferry Hill", address: "76 Ferry Hill Rd", city: "Marshfield, MA", lat: 42.1394, lng: -70.7039,
    price: 0, priceNote: "register ahead", host: "JPH at Ferry Hill (nonprofit)",
    description: "A free evening of holiday crafting together. A nonprofit wellness space.",
    url: "https://www.jphcommunity.org/programs-events", tags: ["come-alone"]
  },

  // ---------- Craft Loft, Cambridge (craft-loft.com) ----------
  {
    id: "craft-loft-cambridge", title: "Craft Loft Workshops",
    category: "craft", schedule: "Workshops most days — pick a date on their calendar",
    venue: "Craft Loft", address: "100 Cambridgeside Pl (2nd floor)", city: "Cambridge, MA", lat: 42.3680, lng: -71.0760,
    price: null, host: "Craft Loft",
    description: "Small hands-on craft classes: embroidery, knitting, calligraphy, dried florals, resin and seasonal makes. No experience needed.",
    url: "https://craft-loft.com/collections/boston-workshops", tags: ["come-alone", "beginner"]
  }
]);
