// Seasonal collections: one page that gathers every upcoming listing about a theme,
// e.g. findgoodnearby.com/#/find/halloween. Each shows from `from` to `to` (month-day).
// `match` is checked against each listing's title and description. Add a season by copying one.
// Any other word works too: #/find/pottery lists everything mentioning "pottery".
window.GOOD_NEARBY_COLLECTIONS = [
  { id: "halloween", emoji: "🎃", title: "Halloween & spooky season", from: "09-20", to: "10-31",
    blurb: "pumpkin painting, spooky pottery, candlelit sound baths and more",
    match: /hallowe|spooky|pumpkin|trick.or.treat|haunt|ghost|witch|hocus pocus|d[ií]a de (los )?muertos|samhain/i },
  { id: "thanksgiving", emoji: "🍂", title: "Harvest & Thanksgiving", from: "11-01", to: "11-28",
    blurb: "harvest classes, gratitude gatherings and Thanksgiving baking",
    match: /thanksgiving|friendsgiving|harvest|gratitude|thankful|apple pick|cider/i },
  { id: "holidays", emoji: "✨", title: "Holiday makers & markets", from: "11-15", to: "12-31",
    blurb: "wreath making, holiday markets, ornaments and cozy winter workshops",
    match: /holiday|christmas|hanukkah|chanukah|kwanzaa|wreath|ornament|gingerbread|winter market|solstice|yule|festive|santa/i },
  { id: "new-year", emoji: "🌱", title: "Fresh start: New Year intentions", from: "12-26", to: "01-31",
    blurb: "intention setting, vision boards and gentle resets",
    match: /new year|intention|vision board|fresh start|\breset\b/i },
  { id: "valentines", emoji: "💌", title: "Valentine's & Galentine's", from: "01-25", to: "02-14",
    blurb: "classes for two, Galentine's nights and self-love sessions",
    match: /valentine|galentine|self.love|love yourself/i },
  { id: "mothers-day", emoji: "💐", title: "Mother's Day", from: "04-25", to: "05-14",
    blurb: "flower arranging, tea, and things to do together",
    match: /mother.?s day|\bmoms?\b|\bmama\b/i },
];
