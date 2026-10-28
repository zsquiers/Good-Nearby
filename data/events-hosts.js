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
