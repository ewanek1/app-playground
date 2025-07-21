/* Handles the /time_for slash command
 * Converts a given time from the sender's timezone to a target user's timezone 
 * Expects input: '/convert <time> @user'
 */

const moment = require("moment-timezone");
const { TIME_FORMATS } = require("../utils/timeZoneMap.js");

/* The `convertTimeBetweenUsers` function
 * performs time parsing, conversion, and formatting
 * given the sender and target user. 
 */
function convertTimeBetweenUsers({ timeVal, fromTz, toTz, toUserName }) {
  const currentDate = moment().format("YYYY-MM-DD");
  let parsedTime = '';

  // Find a valid time format from the given input 
  for (const fmt of TIME_FORMATS) {
    const naive = moment(`${currentDate} ${timeVal}`, `YYYY-MM-DD ${fmt}`, true);
    if (naive.isValid()) {
      parsedTime = naive.tz(fromTz);
      break;
    }
  }

  if (!parsedTime || !parsedTime.isValid()) {
    return {
      error: "Invalid time provided. Please check the time format.",
    };
  }

  // Format times and time zone abbreviations
  const converted = parsedTime.clone().tz(toTz);
  const fromTimeFormatted = parsedTime.format("h:mm a");
  const toTimeFormatted = converted.format("h:mm a");
  const fromZone = moment.tz(fromTz).format("z");
  const toZone = moment.tz(toTz).format("z");

  // Format output function 
  const output_message = `${fromTimeFormatted} (${fromZone}) ➡️ ${toTimeFormatted} in ${toUserName}'s time zone (${toZone})`;
  return { output_message };
}

module.exports = { convertTimeBetweenUsers };
