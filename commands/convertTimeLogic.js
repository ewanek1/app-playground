/* Handles the /convert slash command
 * Converts a given time from a given timezone to a target timezone 
 * Expects input: '/convert <time> <from_zone> <to_zone>'
 */

const moment = require("moment-timezone");  // Plugin for Moment.js library
const { tzMap, TIME_FORMATS } = require("../utils/timeZoneMap.js");

/* The `convertTimeCommandText` function parses 
 * and converts a time between time zones 
 */
function convertTimeCommandText(text) {
  // Split the input string into parts, trimming whitespace 
  // using a regular expression
  const parts = text.trim().split(/\s+/);

  // Need at least 3 parts: time, from_zone, and to_zone
  if (parts.length < 3) {
    return {
      error:
        "Invalid input format. Please use the `/convert <time> <from_zone> <to_zone>`\nExample: `/convert 3PM EST PST`",
    };
  }

  // Calculates how many parts belong to the time value (can include spaces e.g. 12 30)
  const timePartCount = parts.length - 2;
  const timeVal = parts.slice(0, timePartCount).join(" ");
  const fromZoneAbbr = parts[timePartCount];
  const toZoneAbbr = parts[timePartCount + 1];

  // Look up the full time zone names from the abbreviation map
  // e.g. EST to America/New_York
  const fromZone = tzMap[fromZoneAbbr.toUpperCase()];
  const toZone = tzMap[toZoneAbbr.toUpperCase()];

  // Validate to and from zones
  if (!fromZone) {
    return {
      error: `Sorry, I don't recognize the time zone abbreviation ${fromZoneAbbr}`,
    };
  } else if (!toZone) {
    return {
      error: `Sorry, I don't recognize the time zone abbreviation ${toZoneAbbr}`,
    };
  }

  // Get the current date and attach to the time input
  const currentDate = moment().format("YYYY-MM-DD");
  let naiveTime = null;

  // Find a valid time format from the given input 
  for (const format of TIME_FORMATS) {
    naiveTime = moment.tz(`${currentDate} ${timeVal}`, `YYYY-MM-DD ${format}`, fromZone);
    if (naiveTime.isValid()) break;
  }

  if (!naiveTime || !naiveTime.isValid()) {
    return {
      error: "Invalid time provided. Please check the time format.",
    };
  }

  const converted = naiveTime.clone().tz(toZone);

  // Construct the response message showing original and converted time
  const output_message = `${naiveTime.format("h:mm a")} ${fromZoneAbbr.toUpperCase()} ➡️ ${converted.format(
    "h:mm a"
  )} ${toZoneAbbr.toUpperCase()}`;
  return { result: output_message }; 
}

module.exports = { convertTimeCommandText };
