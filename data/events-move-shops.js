// Community runs, walks & hikes · salt caves · holistic shops.
// Gathered and checked against each group's own website (or public listings) in Oct 2026.
// Weekly listings without an `until` date repeat for the next few months automatically.
// tags (optional): free, beginner, come-alone, women, outdoors, all-paces

window.GOOD_NEARBY_EVENTS = (window.GOOD_NEARBY_EVENTS || []).concat([

  // ---------- Community runs ----------
  {
    id: "jamaica-pond-parkrun",
    title: "Jamaica Pond parkrun (free 5K)",
    category: "run",
    weekly: { day: "Saturday", time: "09:00", endTime: "10:00" },
    venue: "Jamaica Pond", address: "Jamaicaway", city: "Jamaica Plain, MA",
    lat: 42.3166, lng: -71.1206,
    price: 0, priceNote: "Free — register once at parkrun.us",
    host: "parkrun",
    description: "A free, friendly, timed 5K around the pond every Saturday. Walk, jog, run, volunteer or cheer — it's up to you. Many people grab coffee together afterward at Life Alive.",
    url: "https://www.parkrun.us/jamaicapond/",
    tags: ["free", "come-alone", "all-paces", "beginner", "outdoors"]
  },
  {
    id: "november-project-harvard-stadium",
    title: "November Project: Harvard Stadium Stairs",
    category: "run",
    weekly: { day: "Wednesday", time: "06:30", endTime: "07:15" },
    venue: "Harvard Stadium (meet at section 37)", address: "95 N Harvard St", city: "Allston, MA",
    lat: 42.3670, lng: -71.1265,
    price: 0, priceNote: "Free — sign the one-time waiver first (earlier wave at 5:55 AM)",
    host: "November Project Boston",
    description: "A free, high-five-filled community workout climbing the stadium stairs together. Every ability welcome — just show up.",
    url: "https://november-project.com/boston/",
    tags: ["free", "come-alone", "all-paces", "outdoors"]
  },
  {
    id: "november-project-summit-ave",
    title: "November Project: Summit Ave Hills",
    category: "run",
    weekly: { day: "Friday", time: "06:30", endTime: "07:15" },
    venue: "Corey Hill Outlook (top of Summit Ave)", address: "Summit Ave", city: "Brookline, MA",
    lat: 42.3437, lng: -71.1361,
    price: 0, priceNote: "Free — sign the one-time waiver first",
    host: "November Project Boston",
    description: "Hill repeats with the November Project crew, with a great view of the city. Movement at any speed — walking, jogging and running are all very welcome.",
    url: "https://november-project.com/boston/",
    tags: ["free", "come-alone", "all-paces", "outdoors"]
  },
  {
    id: "boston-road-runners-saturday",
    title: "Boston Road Runners Saturday Run",
    category: "run",
    schedule: "Saturday mornings · check the meet-up spot each week",
    venue: "Back Bay / Charles River", address: "", city: "Boston, MA",
    lat: 42.3505, lng: -71.0810,
    price: null,
    host: "Boston Road Runners",
    description: "A weekly social group run along the Charles for a range of paces, with several distance options. The meeting spot is posted each week.",
    url: "https://www.heylo.com/event/-OZirSSbWYcQ0tVsRIYt",
    tags: ["come-alone", "outdoors"]
  },
  {
    id: "261-fearless-boston",
    title: "261 Fearless: Women's Run/Walk Group",
    category: "run",
    schedule: "Seasonal weekly meetups · check their schedule",
    venue: "Arthur Fiedler statue, Charles River Esplanade", address: "Fiedler Field", city: "Boston, MA",
    lat: 42.3556, lng: -71.0743,
    price: null,
    host: "261 Fearless Club New England",
    description: "A social, non-competitive running and walking group for women of all abilities, led by certified coaches. Starts with gentle drills, then loops along the Esplanade.",
    url: "https://events.humanitix.com/jogs-with-261-fearless-club",
    tags: ["women", "come-alone", "all-paces", "beginner", "outdoors"]
  },
  {
    id: "wrentham-runners",
    title: "Wrentham Runners Group Runs",
    category: "run",
    schedule: "Saturday mornings & weeknights · 5K–10K",
    venue: "Locations vary around Wrentham", address: "", city: "Wrentham, MA",
    lat: 42.0668, lng: -71.3281,
    price: 0, priceNote: "Free membership, open to all",
    host: "Wrentham Runners",
    description: "Friendly weekly group training runs on a mix of road and trail. Meet-up times and places are posted on their calendar.",
    url: "https://www.wrenthamrunners.org/",
    tags: ["free", "come-alone", "outdoors"]
  },

  // ---------- Hikes & walks ----------
  {
    id: "blue-hills-sunset-hike-2026",
    title: "Sunset Hike & Hilltop Concert on Great Blue Hill",
    category: "hike",
    start: "2026-10-10T16:00", end: "2026-10-10T18:45",
    venue: "Blue Hills Trailside Museum area", address: "1904 Canton Ave", city: "Milton, MA",
    lat: 42.2125, lng: -71.1146,
    price: null,
    host: "Friends of the Blue Hills",
    description: "A fall tradition: guided hikes leave the Trailside Museum area around 4 PM for live music on top of Great Blue Hill before sunset (about 6:39 PM). You can also head up on your own.",
    url: "https://www.friendsofthebluehills.org/news/sunset-hike-hilltop-concert-returns-october-10/",
    tags: ["come-alone", "outdoors"]
  },
  {
    id: "amc-boston-walks-hikes",
    title: "AMC Boston: Local Walks & Hikes",
    category: "hike",
    schedule: "Many volunteer-led outings every week",
    venue: "Trails around Greater Boston", address: "", city: "Boston, MA",
    lat: 42.3601, lng: -71.0589,
    price: null, priceNote: "Usually free or a small fee for non-members",
    host: "Appalachian Mountain Club, Boston Chapter",
    description: "Thousands of volunteer-led walks and hikes for every ability level — many are \"show and go,\" no sign-up needed. A friendly way to get outside with people.",
    url: "https://amcboston.org/",
    tags: ["come-alone", "beginner", "outdoors"]
  },
  {
    id: "hike-boston-park-rangers",
    title: "Hike Boston: Guided Park Walks",
    category: "walk",
    schedule: "Seasonal guided walks · see the city calendar",
    venue: "Franklin Park, Jamaica Pond, the Fens & more", address: "", city: "Boston, MA",
    lat: 42.3060, lng: -71.0930,
    price: 0,
    host: "Boston Park Rangers",
    description: "Free guided walks in Boston's parks and urban wilds, from half a mile to a few miles, led by Park Rangers who share the history and nature along the way.",
    url: "https://www.boston.gov/departments/parks-and-recreation/hike-boston",
    tags: ["free", "come-alone", "beginner", "outdoors"]
  },
  {
    id: "friends-of-the-fells-walks",
    title: "Guided Walks in the Middlesex Fells",
    category: "hike",
    schedule: "Guided walks throughout the year",
    venue: "Middlesex Fells Reservation", address: "", city: "Medford, MA",
    lat: 42.4410, lng: -71.1050,
    price: null,
    host: "Friends of the Fells",
    description: "Guided hikes through 2,500 acres of woods, ponds and rocky hilltops just north of Boston — plus chances to volunteer or become a hike leader.",
    url: "https://www.fells.org/",
    tags: ["come-alone", "outdoors"]
  },

  // ---------- Salt caves (in addition to the three listed in events.js) ----------
  {
    id: "framingham-himalayan-salt-cave",
    title: "Himalayan Salt Cave Session",
    category: "salt",
    schedule: "Sessions most days · family hour Saturdays 11 AM & 12:30 PM",
    venue: "Himalayan Salt Cave (at Thanh's Eyemazing Lashes)", address: "33 Cochituate Rd", city: "Framingham, MA",
    lat: 42.3020, lng: -71.3960,
    price: null, priceNote: "Private cave $50/guest (min. 2); 3-session package $105",
    host: "Himalayan Salt Cave Framingham",
    description: "45 minutes in a zero-gravity chair surrounded by 10,000 pounds of Himalayan salt, with a guided meditation to start and warm tea after. Kids welcome at family hour.",
    url: "https://www.thanhseyemazinglashes.com/himalayansaltcave",
    phone: "(508) 202-9586"
  },
  {
    id: "indoor-oasis-salt-booth",
    title: "Halotherapy Salt Booth",
    category: "salt",
    schedule: "By appointment · 20-minute sessions",
    venue: "The Indoor Oasis", address: "383 Elliot St, Suite 200", city: "Newton, MA",
    lat: 42.3170, lng: -71.2120,
    price: null,
    host: "The Indoor Oasis",
    description: "A private salt booth — a quick 20-minute alternative to a full salt cave session.",
    url: "https://theindooroasis.com/halotherapy/",
    phone: "(617) 964-3737"
  },
  {
    id: "elite-medspa-salt-sanctuary",
    title: "Salt Sanctuary",
    category: "salt",
    schedule: "Tue & Thu 9–6 · Wed & Fri 9–3 · evenings by appointment",
    venue: "Elite Medspa", address: "", city: "Needham, MA",
    lat: 42.2809, lng: -71.2378,
    price: null, priceNote: "Monthly packages available",
    host: "Elite Medspa",
    description: "A quiet salt room in Needham for halotherapy sessions — breathe, rest and recharge.",
    url: "https://www.myelitemedspa.com/salt-sanctuary",
    phone: "(781) 559-3433"
  },
  {
    id: "saltitude-lincoln-ri",
    title: "Himalayan Salt Cave",
    category: "salt",
    schedule: "By appointment",
    venue: "Saltitude Himalayan Salt Cave", address: "204 Front St", city: "Lincoln, RI",
    lat: 41.9210, lng: -71.4350,
    price: null,
    host: "Saltitude",
    description: "A Himalayan salt cave just over the Rhode Island line — about 20 minutes from Franklin.",
    url: "https://www.visitrhodeisland.com/listing/saltitude-himalayan-salt-cave/9006/",
    phone: "(401) 359-7937"
  },
  {
    id: "oceanair-salt-cave-orleans",
    title: "Himalayan Salt Cave (Cape Cod)",
    category: "salt",
    schedule: "By appointment",
    venue: "OceanAir Himalayan Salt Cave", address: "34 Main St", city: "Orleans, MA",
    lat: 41.7895, lng: -69.9895,
    price: null,
    host: "OceanAir",
    description: "A Cape Cod salt cave offering quiet sessions, plus sound healing and reflexology in the cave.",
    url: "https://www.oceanairhimalayansaltcave.com/",
    phone: "(774) 801-2641"
  },
  {
    id: "pura-salt-cave-mashpee",
    title: "Salt Cave & Spa (Cape Cod)",
    category: "salt",
    schedule: "By appointment",
    venue: "Pura Salt Cave & Spa", address: "12 Center Square, Mashpee Commons", city: "Mashpee, MA",
    lat: 41.6190, lng: -70.4900,
    price: null,
    host: "Pura Salt Cave & Spa",
    description: "A salt cave and spa at Mashpee Commons for halotherapy and relaxation.",
    url: "https://www.purasaltcave.com/"
  },
  {
    id: "just-breathe-salt-spa-hyannis",
    title: "Salt Spa (Cape Cod)",
    category: "salt",
    schedule: "By appointment",
    venue: "Just Breathe Salt Spa", address: "39 North St", city: "Hyannis, MA",
    lat: 41.6530, lng: -70.2830,
    price: null,
    host: "Just Breathe Salt Spa",
    description: "A salt spa in Hyannis for calm, restful halotherapy sessions.",
    url: "https://justbreathesaltspa.com/",
    phone: "(508) 771-7258"
  },

  // ---------- Holistic & wellness shops ----------
  {
    id: "shop-enchanted-fox",
    title: "The Enchanted Fox",
    category: "shop",
    schedule: "Mon–Sat 11–5 · Sun 12–5",
    venue: "The Enchanted Fox", address: "174A Main St (Route 109)", city: "Medway, MA",
    lat: 42.1400, lng: -71.3950,
    price: null,
    host: "The Enchanted Fox",
    description: "A cozy new-age shop full of crystals, jewelry, books, candles, incense and Native American instruments, with intuitive readings too.",
    url: "https://enchantedfox.com/",
    phone: "(508) 533-4440"
  },
  {
    id: "shop-whimsical-wellness",
    title: "Whimsical Wellness Boutique",
    category: "shop",
    schedule: "Mon–Thu 1–7 PM",
    venue: "AcuPUNKture & The Whimsical Wellness Boutique", address: "37 E Central St", city: "Franklin, MA",
    lat: 42.0838, lng: -71.3955,
    price: null,
    host: "AcuPUNKture",
    description: "Crystals, essential oils, bath salts and little treasures — plus the community event space for Needles & Namaste nights.",
    url: "https://franklinacupunkture.com/",
    phone: "(508) 507-8015"
  },
  {
    id: "shop-zeldas-minerals",
    title: "Zelda's Minerals",
    category: "shop",
    schedule: "Check before you go",
    venue: "Zelda's Minerals", address: "74 Main St (Gould's Colonial Plaza)", city: "Medway, MA",
    lat: 42.1385, lng: -71.4010,
    price: null,
    host: "Zelda's Minerals",
    description: "A local crystal and mineral shop that reviewers call one of the coolest spots in Medway.",
    url: ""
  },
  {
    id: "shop-serendipity-place",
    title: "The Serendipity Place",
    category: "shop",
    schedule: "Check their website for hours",
    venue: "The Serendipity Place", address: "", city: "Framingham, MA",
    lat: 42.2793, lng: -71.4162,
    price: null,
    host: "The Serendipity Place",
    description: "Crystals and candles, plus readings, energy healing, Reiki, meditations and workshops.",
    url: "https://www.theserendipityplace.com/",
    phone: "(978) 219-6742"
  },
  {
    id: "shop-open-doors-braintree",
    title: "Open Doors Metaphysical Gifts & Books",
    category: "shop",
    schedule: "Open 7 days · 9 AM – 9 PM",
    venue: "Open Doors", address: "395 Washington St", city: "Braintree, MA",
    lat: 42.2050, lng: -71.0000,
    price: null,
    host: "Open Doors",
    description: "A long-running South Shore shop for crystals, books and holistic gifts, with readings, classes and events.",
    url: "https://www.opendoors7.com/",
    phone: "(781) 843-8224"
  },
  {
    id: "shop-body-stone-soul",
    title: "Body, Stone and Soul",
    category: "shop",
    schedule: "Check before you go",
    venue: "Body, Stone and Soul", address: "", city: "Jamaica Plain, MA",
    lat: 42.3097, lng: -71.1151,
    price: null,
    host: "Body, Stone and Soul",
    description: "A mother-and-son crystal shop tucked beneath a triple-decker — crystals, tarot decks, books, sage and incense, plus Reiki sessions.",
    url: "https://www.wbur.org/news/2024/01/11/body-stone-soul-crystal-shop-jamaica-plain"
  },

  // ---------- Nature walks you can do anytime ----------
  {
    id: "mass-audubon-stony-brook",
    title: "Stony Brook Wildlife Sanctuary Trails",
    category: "walk",
    schedule: "Trails open daily, dawn to dusk",
    venue: "Mass Audubon Stony Brook Wildlife Sanctuary", address: "108 North St", city: "Norfolk, MA",
    lat: 42.1150, lng: -71.3450,
    price: null, priceNote: "Small trail fee for non-members",
    host: "Mass Audubon",
    description: "Gentle, flat trails and boardwalks over ponds and marsh — a peaceful walk just minutes from Franklin. Watch for turtles, herons and swans.",
    url: "https://www.massaudubon.org/places-to-explore/wildlife-sanctuaries/stony-brook",
    tags: ["come-alone", "beginner", "outdoors"]
  },
  {
    id: "mass-audubon-broadmoor",
    title: "Broadmoor Wildlife Sanctuary Trails",
    category: "walk",
    schedule: "Trails open daily, dawn to dusk",
    venue: "Mass Audubon Broadmoor Wildlife Sanctuary", address: "280 Eliot St", city: "Natick, MA",
    lat: 42.2560, lng: -71.3420,
    price: null, priceNote: "Small trail fee for non-members",
    host: "Mass Audubon",
    description: "Quiet woodland and wetland trails along the Charles River — a calm place to walk and breathe in MetroWest.",
    url: "https://www.massaudubon.org/places-to-explore/wildlife-sanctuaries/broadmoor",
    tags: ["come-alone", "beginner", "outdoors"]
  }
]);
