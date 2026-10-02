// Good Nearby event data.
// This is the site's "database" for now: one object per event.
// Add, edit or remove entries below. Times are local, in ISO format.
//
// Fields:
//   id          unique slug
//   title       event name
//   category    one of: yoga, sound, meditation, massage, breathwork, reiki, tai-chi, workshop
//   start, end  "YYYY-MM-DDTHH:MM"
//   venue       place name
//   address     street address
//   city        city / neighborhood
//   lat, lng    coordinates (used for "Near me" distance sorting)
//   price       number in dollars, 0 for free; priceNote for "sliding scale" etc.
//   host        teacher, practitioner or studio
//   description short, friendly summary
//   url         link to book or learn more (optional)

window.GOOD_NEARBY_EVENTS = [
  {
    id: "sunrise-flow-chautauqua",
    title: "Sunrise Flow in the Meadow",
    category: "yoga",
    start: "2026-10-04T07:00", end: "2026-10-04T08:15",
    venue: "Chautauqua Park Meadow", address: "900 Baseline Rd", city: "Boulder, CO",
    lat: 39.9997, lng: -105.2816,
    price: 0, priceNote: "Donations welcome",
    host: "Maya Ellison",
    description: "A gentle vinyasa as the sun comes over the Flatirons. Bring a mat and a layer — mornings are crisp.",
    url: ""
  },
  {
    id: "crystal-bowl-bath",
    title: "Full Moon Crystal Bowl Sound Bath",
    category: "sound",
    start: "2026-10-06T19:30", end: "2026-10-06T21:00",
    venue: "The Quiet Room", address: "1825 Pearl St", city: "Boulder, CO",
    lat: 40.0190, lng: -105.2740,
    price: 30,
    host: "Rowan Hale",
    description: "Lie back and let crystal bowls, gongs and chimes wash over you. Mats, blankets and eye pillows provided.",
    url: ""
  },
  {
    id: "lunchtime-sit",
    title: "Lunchtime Stillness: 30-Minute Sit",
    category: "meditation",
    start: "2026-10-05T12:15", end: "2026-10-05T12:45",
    venue: "Boulder Public Library, Canyon Room", address: "1001 Arapahoe Ave", city: "Boulder, CO",
    lat: 40.0137, lng: -105.2830,
    price: 0,
    host: "Community Sangha",
    description: "A short guided meditation to reset the middle of your day. Beginners very welcome — chairs and cushions available.",
    url: ""
  },
  {
    id: "community-massage-clinic",
    title: "Community Massage Clinic",
    category: "massage",
    start: "2026-10-10T10:00", end: "2026-10-10T16:00",
    venue: "Front Range Healing Arts", address: "2510 N 47th St", city: "Boulder, CO",
    lat: 40.0290, lng: -105.2390,
    price: 40, priceNote: "50-minute session",
    host: "Front Range Healing Arts students",
    description: "Affordable Swedish and deep-tissue sessions from supervised final-term massage students. Book a slot ahead.",
    url: ""
  },
  {
    id: "breath-by-the-creek",
    title: "Breath by the Creek",
    category: "breathwork",
    start: "2026-10-11T09:30", end: "2026-10-11T10:45",
    venue: "Eben G. Fine Park", address: "101 Arapahoe Ave", city: "Boulder, CO",
    lat: 40.0128, lng: -105.2935,
    price: 15, priceNote: "Sliding scale $5–25",
    host: "Theo Park",
    description: "Slow, grounding breathwork beside Boulder Creek. We close with a few minutes of quiet listening to the water.",
    url: ""
  },
  {
    id: "reiki-share",
    title: "Monthly Reiki Share",
    category: "reiki",
    start: "2026-10-08T18:30", end: "2026-10-08T20:30",
    venue: "Willow House", address: "3020 Valmont Rd", city: "Boulder, CO",
    lat: 40.0270, lng: -105.2560,
    price: 10,
    host: "Willow House Collective",
    description: "Practitioners of all levels gather to give and receive Reiki. Curious newcomers can simply come to receive.",
    url: ""
  },
  {
    id: "tai-chi-in-the-park",
    title: "Tai Chi in the Park",
    category: "tai-chi",
    start: "2026-10-03T08:30", end: "2026-10-03T09:30",
    venue: "Central Park Bandshell", address: "1212 Canyon Blvd", city: "Boulder, CO",
    lat: 40.0156, lng: -105.2800,
    price: 0,
    host: "Master Lin Wei",
    description: "Yang-style tai chi for every body and every age. Wear loose clothes; we move slowly and laugh often.",
    url: ""
  },
  {
    id: "restorative-yin",
    title: "Candlelit Restorative Yin",
    category: "yoga",
    start: "2026-10-09T19:00", end: "2026-10-09T20:15",
    venue: "Saffron Yoga Studio", address: "4800 Baseline Rd", city: "Boulder, CO",
    lat: 39.9990, lng: -105.2340,
    price: 22,
    host: "Saffron Yoga",
    description: "Long, supported holds with bolsters and blankets by candlelight. The softest way to end a week.",
    url: ""
  },
  {
    id: "gong-and-cacao",
    title: "Gong Bath & Ceremonial Cacao",
    category: "sound",
    start: "2026-10-17T18:00", end: "2026-10-17T20:00",
    venue: "Lyons Riverside Pavilion", address: "4th Ave & Park St", city: "Lyons, CO",
    lat: 40.2240, lng: -105.2710,
    price: 45,
    host: "Rowan Hale & Ana Duarte",
    description: "Warm cacao, a short intention circle, then an hour of gongs. A cozy autumn evening in the foothills.",
    url: ""
  },
  {
    id: "walking-meditation",
    title: "Autumn Walking Meditation",
    category: "meditation",
    start: "2026-10-18T10:00", end: "2026-10-18T11:30",
    venue: "Wonderland Lake Trailhead", address: "4201 N Broadway", city: "Boulder, CO",
    lat: 40.0500, lng: -105.2860,
    price: 0,
    host: "Community Sangha",
    description: "An unhurried, silent walk among the changing cottonwoods, followed by tea and conversation.",
    url: ""
  },
  {
    id: "self-massage-workshop",
    title: "Self-Massage for Desk Bodies",
    category: "workshop",
    start: "2026-10-14T18:00", end: "2026-10-14T19:30",
    venue: "Longmont Wellness Co-op", address: "350 Main St", city: "Longmont, CO",
    lat: 40.1650, lng: -105.1010,
    price: 25,
    host: "Jess Moreno, LMT",
    description: "Learn simple techniques for necks, shoulders, wrists and hips. You'll leave with a tennis ball and a looser back.",
    url: ""
  },
  {
    id: "prenatal-yoga",
    title: "Prenatal Yoga Circle",
    category: "yoga",
    start: "2026-10-07T17:30", end: "2026-10-07T18:45",
    venue: "Nest Family Wellness", address: "1650 38th St", city: "Boulder, CO",
    lat: 40.0180, lng: -105.2480,
    price: 18,
    host: "Priya Shah",
    description: "Gentle movement, breath and connection for expecting parents in any trimester.",
    url: ""
  },
  {
    id: "sound-healing-louisville",
    title: "Sunday Sound Healing",
    category: "sound",
    start: "2026-10-25T16:00", end: "2026-10-25T17:15",
    venue: "Harmony Hall", address: "820 Main St", city: "Louisville, CO",
    lat: 39.9780, lng: -105.1320,
    price: 25,
    host: "Harmony Hall",
    description: "Tuning forks, harp and singing bowls for deep rest. A lovely way to land before the week begins.",
    url: ""
  },
  {
    id: "hot-stone-open-house",
    title: "Hot Stone Mini-Session Open House",
    category: "massage",
    start: "2026-10-24T11:00", end: "2026-10-24T15:00",
    venue: "Stillwater Spa", address: "2045 Broadway", city: "Boulder, CO",
    lat: 40.0200, lng: -105.2780,
    price: 20, priceNote: "20-minute session",
    host: "Stillwater Spa",
    description: "Drop in for a warm, short hot-stone session on the back and shoulders. Herbal tea while you wait.",
    url: ""
  },
  {
    id: "breathwork-sound-journey",
    title: "Breathwork & Sound Journey",
    category: "breathwork",
    start: "2026-11-01T18:30", end: "2026-11-01T20:30",
    venue: "The Quiet Room", address: "1825 Pearl St", city: "Boulder, CO",
    lat: 40.0190, lng: -105.2740,
    price: 40,
    host: "Theo Park & Rowan Hale",
    description: "An evening of connected breathing followed by live sound to help you integrate and rest.",
    url: ""
  },
  {
    id: "loving-kindness-day",
    title: "Day of Loving-Kindness Retreat",
    category: "meditation",
    start: "2026-11-07T09:00", end: "2026-11-07T16:00",
    venue: "Shambhala Center", address: "1345 Spruce St", city: "Boulder, CO",
    lat: 40.0200, lng: -105.2770,
    price: 0, priceNote: "By donation",
    host: "Shambhala Boulder",
    description: "A gentle day-long retreat of guided metta practice, mindful lunch and silence. No experience needed.",
    url: ""
  }
];
