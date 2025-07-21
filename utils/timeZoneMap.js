const tzMap = {
  // North America
  EST: "America/New _York",
  EDT: "America/New_York",
  CST: "America/Chicago",
  CDT: "America/Chicago",
  MST: "America/Denver",
  MDT: "America/Denver",
  PST: "America/Los_Angeles",
  PDT: "America/Los_Angeles",
  PT: "America/Los_Angeles",
  HAST: "Pacific/Honolulu",
  AKST: "America/Anchorage",
  AKDT: "America/Anchorage",

  // Universal
  GMT: "GMT",
  UTC: "UTC",

  // Europe

  WET: "Europe/Lisbon",
  WEST: "Europe/Lisbon",
  EET: "Europe/Athens",
  EEST: "Europe/Athens",
  MSK: "Europe/Moscow",
  BST: "Europe/London",
  CET: "Europe/Berlin",
  CEST: "Europe/Berlin",

  // Asia
  IST: "Asia/Kolkata",
  JST: "Asia/Tokyo",
  CST_CHINA: "Asia/Shanghai",
  HKT: "Asia/Hong_Kong",
  SGT: "Asia/Singapore",
  KST: "Asia/Seoul",
  ICT: "Asia/Bangkok",

  // Australia
  AEST: "Australia/Sydney",
  AEDT: "Australia/Sydney",
  ACST: "Australia/Darwin",
  ACDT: "Australia/Darwin",
  AWST: "Australia/Perth",

  // South America
  ART: "America/Argentina/Buenos_Aires", 
  BRT: "America/Sao_Paulo", 
  CLT: "America/Santiago", 
  CLST: "America/Santiago",

  // Africa
  CAT: "Africa/Maputo",
  EAT: "Africa/Nairobi", 
  WAT: "Africa/Lagos", 
  SAST: "Africa/Johannesburg", 
};

const TIME_FORMATS = [
  "h:mma", // 1:30pm
  "ha",    // 1pm
  "H:m",   // 13:30
  "h:mm A", // 1:30 PM (added for consistency with tests)
  "h A" // 1 PM (added for consistency with tests, handles "3 PM")
];

module.exports = {
  TIME_FORMATS,
  tzMap, // Now exporting the tzMap
};
