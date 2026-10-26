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
