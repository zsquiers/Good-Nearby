// Towns people can pick on the first screen, grouped by area.
// lat/lng are approximate town centers — used to measure distance to events.
// To add a town, copy a line into the right group. `id` must be unique (lowercase, dashes).

window.GOOD_NEARBY_TOWNS = [
  { area: "Franklin & nearby", towns: [
    { id: "franklin",     name: "Franklin",     lat: 42.0834, lng: -71.3967 },
    { id: "medway",       name: "Medway",       lat: 42.1392, lng: -71.3967 },
    { id: "bellingham",   name: "Bellingham",   lat: 42.0868, lng: -71.4745 },
    { id: "norfolk",      name: "Norfolk",      lat: 42.1195, lng: -71.3251 },
    { id: "wrentham",     name: "Wrentham",     lat: 42.0668, lng: -71.3281 },
    { id: "foxborough",   name: "Foxborough",   lat: 42.0654, lng: -71.2478 },
    { id: "walpole",      name: "Walpole",      lat: 42.1417, lng: -71.2495 },
    { id: "mansfield",    name: "Mansfield",    lat: 42.0334, lng: -71.2190 },
    { id: "milford",      name: "Milford",      lat: 42.1398, lng: -71.5162 },
    { id: "medfield",     name: "Medfield",     lat: 42.1876, lng: -71.3062 },
  ]},
  { area: "MetroWest", towns: [
    { id: "framingham",   name: "Framingham",   lat: 42.2793, lng: -71.4162 },
    { id: "natick",       name: "Natick",       lat: 42.2834, lng: -71.3495 },
    { id: "marlborough",  name: "Marlborough",  lat: 42.3459, lng: -71.5523 },
    { id: "hopkinton",    name: "Hopkinton",    lat: 42.2287, lng: -71.5226 },
    { id: "holliston",    name: "Holliston",    lat: 42.2001, lng: -71.4245 },
    { id: "wellesley",    name: "Wellesley",    lat: 42.2968, lng: -71.2924 },
    { id: "needham",      name: "Needham",      lat: 42.2809, lng: -71.2378 },
    { id: "sudbury",      name: "Sudbury",      lat: 42.3834, lng: -71.4162 },
    { id: "waltham",      name: "Waltham",      lat: 42.3765, lng: -71.2356 },
    { id: "newton",       name: "Newton",       lat: 42.3370, lng: -71.2092 },
  ]},
  { area: "Boston area", towns: [
    { id: "boston",       name: "Boston",       lat: 42.3601, lng: -71.0589 },
    { id: "cambridge",    name: "Cambridge",    lat: 42.3736, lng: -71.1097 },
    { id: "somerville",   name: "Somerville",   lat: 42.3876, lng: -71.0995 },
    { id: "brookline",    name: "Brookline",    lat: 42.3318, lng: -71.1212 },
    { id: "allston",      name: "Allston",      lat: 42.3539, lng: -71.1337 },
    { id: "jamaica-plain",name: "Jamaica Plain",lat: 42.3097, lng: -71.1151 },
    { id: "dorchester",   name: "Dorchester",   lat: 42.3016, lng: -71.0676 },
    { id: "dedham",       name: "Dedham",       lat: 42.2418, lng: -71.1662 },
    { id: "norwood",      name: "Norwood",      lat: 42.1945, lng: -71.1995 },
  ]},
  { area: "South Shore", towns: [
    { id: "quincy",       name: "Quincy",       lat: 42.2529, lng: -71.0023 },
    { id: "braintree",    name: "Braintree",    lat: 42.2079, lng: -71.0040 },
    { id: "weymouth",     name: "Weymouth",     lat: 42.2207, lng: -70.9396 },
    { id: "hingham",      name: "Hingham",      lat: 42.2418, lng: -70.8898 },
    { id: "cohasset",     name: "Cohasset",     lat: 42.2418, lng: -70.8037 },
    { id: "scituate",     name: "Scituate",     lat: 42.1959, lng: -70.7259 },
    { id: "marshfield",   name: "Marshfield",   lat: 42.0918, lng: -70.7056 },
    { id: "duxbury",      name: "Duxbury",      lat: 42.0418, lng: -70.6723 },
    { id: "plymouth",     name: "Plymouth",     lat: 41.9584, lng: -70.6673 },
  ]},
];
