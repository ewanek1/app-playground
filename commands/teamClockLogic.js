/* Handles the /teamclock slash command
 * Generates an output message of every channel/user group
 * member's time, timezone, and availability 
 * Expects input: '/teamclock' for channel
 * Expects input: '/teamclock @usergroup' for usergroup
 */

const moment = require("moment-timezone");

const timeRanges = [
  { start: "09:00", end: "16:00", message: "Available ✅" },
  { start: "16:00", end: "17:00", message: "Getting late 🕓" },
  { start: "17:00", end: "20:00", message: "After hours 🌙" },
  { start: "20:00", end: "24:00", message: "After hours 🌙" },
  { start: "00:00", end: "09:00", message: "Sleeping 😴" },
];

/* The `teamClockCommandText` function determines 
 * a user's availability message based on a given time string.
 */
function teamClockCommandText(text) {
  const time = moment(text, "HH:mm");
  for (const range of timeRanges) {
    const start = moment(range.start, "HH:mm");
    const end = moment(range.end, "HH:mm");

    if (end.isBefore(start)) {
      // Range crosses midnight 
      if (time.isSameOrAfter(start) || time.isBefore(end)) {
        return range.message;
      }
    } else {
      // Standard range (
      if (time.isSameOrAfter(start) && time.isBefore(end)) {
        return range.message;
      }
    }
  }
  return "Unknown status"; 
}

// Processes a list of users and returns their formatted status messages.
function formatUserAvailabilityMessages(usersData) {
  const messages = [];
  for (const user of usersData) {
    try {
      const userTz = user.tz;
      const curTime = moment.tz(userTz).format("HH:mm");
      const curTimeFormatted = moment.tz(userTz).format("h:mma");
      const status = teamClockCommandText(curTime);

      // Format output message line 
      messages.push(`${user.real_name}: ${curTimeFormatted}  ⇔  ${status}`);
    } catch (error) {
      //console.error(`Error processing user ${user.real_name || user.id}:`, error);
      messages.push(`Error getting status for user ${user.real_name || user.id}`);
    }
  }
  return messages;
}

module.exports = {
  teamClockCommandText,
  formatUserAvailabilityMessages,
  timeRanges 
};