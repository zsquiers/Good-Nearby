// Meditation & mindfulness: centers with regular drop-in sits, beginner classes and short courses.
// Checked against each center's own schedule page in Oct 2026. Most are free or by donation.
// More meditation comes in automatically from Eventbrite (events-eventbrite.js) and libraries (events-libraries.js).

window.GOOD_NEARBY_EVENTS = (window.GOOD_NEARBY_EVENTS || []).concat([

  // ---------- Franklin & nearby ----------
  {
    id: "providence-zen-sunday",
    title: "Sunday Morning Zen: beginner class + sitting",
    category: "meditation",
    weekly: { day: "Sunday", time: "09:00", endTime: "11:30" },
    venue: "Providence Zen Center", address: "99 Pound Rd", city: "Cumberland, RI",
    lat: 41.9890, lng: -71.4290,
    price: 0, priceNote: "Free · $5–10 donation welcome",
    host: "Providence Zen Center",
    description: "A free beginner meditation class at 9, then two quiet 25-minute sits with walking meditation in between, a short talk and refreshments. About 20 minutes from Franklin, on wooded grounds.",
    url: "https://providencezen.org/schedule",
    tags: ["free", "beginner", "come-alone"]
  },
  {
    id: "providence-zen-wednesday",
    title: "Wednesday Night Zen (with free community dinner)",
    category: "meditation",
    weekly: { day: "Wednesday", time: "17:30", endTime: "20:15" },
    venue: "Providence Zen Center", address: "99 Pound Rd", city: "Cumberland, RI",
    lat: 41.9890, lng: -71.4290,
    price: 0, priceNote: "Free · dinner donations of $10–15 welcome",
    host: "Providence Zen Center",
    description: "A free public dinner at 5:30, a beginner meditation class at 6:15, then chanting and two short sits. A gentle way to end a weekday.",
    url: "https://providencezen.org/schedule",
    tags: ["free", "beginner", "come-alone"]
  },

  // ---------- MetroWest / Newton ----------
  {
    id: "kadampa-newton-calm-clear-mind-2026",
    title: "Meditations for a Calm, Clear Mind (3-week course)",
    category: "meditation",
    weekly: { day: "Tuesday", time: "19:00", endTime: "20:00", from: "2026-10-20", until: "2026-11-10", skip: ["2026-11-03"] },
    venue: "Newton South High School", address: "140 Brandeis Rd", city: "Newton, MA",
    lat: 42.3132, lng: -71.1878,
    price: 69, priceNote: "$69 for all three classes · register through Newton Community Education",
    host: "Kadampa Meditation Center Boston",
    description: "Simple guided meditations for staying calm and thinking clearly, taught by Buddhist monk Gen Khedrub. No experience needed.",
    url: "https://meditationinboston.org/newton-classes",
    tags: ["beginner"]
  },

  // ---------- Boston area ----------
  {
    id: "cimc-drop-in-sits",
    title: "Free drop-in meditation sits",
    category: "meditation",
    schedule: "Mon, Tue, Thu & Fri 6–6:45 PM · Wed 6:30–7:15 PM · weekday mornings too",
    venue: "Cambridge Insight Meditation Center", address: "331 Broadway", city: "Cambridge, MA",
    lat: 42.3713, lng: -71.0989,
    price: 0,
    host: "Cambridge Insight Meditation Center",
    description: "A 45-minute silent sit with a volunteer keeping time and ringing a bell at the end. All are welcome, no registration. Closed on holidays and summer and winter breaks.",
    url: "https://cambridgeinsight.org/programs/evening-sit-in-person/",
    tags: ["free", "come-alone", "beginner"]
  },
  {
    id: "cambridge-zen-intro-thursday",
    title: "Intro to Meditation + Dharma Talk",
    category: "meditation",
    weekly: { day: "Thursday", time: "18:45", endTime: "21:00" },
    venue: "Cambridge Zen Center", address: "199 Auburn St", city: "Cambridge, MA",
    lat: 42.3644, lng: -71.1083,
    price: 0,
    host: "Cambridge Zen Center",
    description: "The best night for first-timers: a simple sitting-meditation class at 6:45, a talk with Q&A at 7:30, then tea and snacks with the community.",
    url: "https://cambridgezen.org/newcomers",
    tags: ["free", "beginner", "come-alone"]
  },
  {
    id: "cambridge-zen-daily",
    title: "Daily Zen practice (free)",
    category: "meditation",
    schedule: "Every evening 7:30 PM sitting · most mornings 6:30 AM",
    venue: "Cambridge Zen Center", address: "199 Auburn St", city: "Cambridge, MA",
    lat: 42.3644, lng: -71.1083,
    price: 0,
    host: "Cambridge Zen Center",
    description: "Morning and evening chanting and sitting meditation, open to everyone, every day. No registration — arrive 10 minutes early.",
    url: "https://cambridgezen.org/daily-practice",
    tags: ["free", "come-alone"]
  },
  {
    id: "kadampa-cambridge-wednesday",
    title: "Wednesday meditation class: Transform Your Life",
    category: "meditation",
    weekly: { day: "Wednesday", time: "19:00", endTime: "20:15" },
    venue: "Kadampa Meditation Center Boston", address: "2298 Massachusetts Ave", city: "Cambridge, MA",
    lat: 42.3966, lng: -71.1286,
    price: 15, priceNote: "$15 drop-in",
    host: "Kadampa Meditation Center Boston",
    description: "A guided breathing meditation, a short practical talk on calm and resilience, and time for questions. Join any week — beginner-friendly.",
    url: "https://meditationinboston.org/wednesdays-in-cambridge",
    tags: ["beginner", "come-alone"]
  },
  {
    id: "kadampa-cambridge-sunday",
    title: "Sunday morning meditation class",
    category: "meditation",
    weekly: { day: "Sunday", time: "11:00", endTime: "12:15" },
    venue: "Kadampa Meditation Center Boston", address: "2298 Massachusetts Ave", city: "Cambridge, MA",
    lat: 42.3966, lng: -71.1286,
    price: null, priceNote: "See the class page",
    host: "Kadampa Meditation Center Boston",
    description: "A Sunday series on a calmer mind and a more open heart, with guided meditation and practical teaching.",
    url: "https://meditationinboston.org/sundays-in-cambridge",
    tags: ["beginner", "come-alone"]
  },
  {
    id: "shambhala-boston-sunday",
    title: "Sunday Morning Meditation (drop in)",
    category: "meditation",
    weekly: { day: "Sunday", time: "09:00", endTime: "12:00" },
    venue: "Shambhala Meditation Center of Boston", address: "646 Brookline Ave", city: "Brookline, MA",
    lat: 42.3333, lng: -71.1094,
    price: null, priceNote: "Drop-in · see the center's site",
    host: "Shambhala Boston",
    description: "A quiet morning of silent sitting — come for the whole time or just part of it.",
    url: "https://boston.shambhala.org/",
    tags: ["come-alone"]
  }
]);
