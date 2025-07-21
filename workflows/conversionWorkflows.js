const moment = require("moment-timezone");
const { WebClient } = require("@slack/web-api");
const tzMap = require("/utils/timeZoneMap"); 
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

// Gets user information
async function getUserInfo(userId) {
  const result = await client.users.info({ user: userId });
  if (!result.ok || !result.user) {
    throw new Error(`Failed to fetch user info for ${userId}`);
  }
  return result.user;
}

/* Formats a moment object into a time string and its timezone abbreviation
 * Example: 3pm EST
 */
function formatTimeWithAbbr(momentObject) {
  const formattedTime = momentObject.format("h:mm a");
  const abbr = momentObject.format('z'); // Get current abbreviation for the timezone
  return {formattedTime, abbr};
}

/* Handles the time zone conversion workflow
 * Converts a time in the sender's timezone to a target timezone
 */
async function handleUserConversionWF({ inputs, complete, fail }) {
  try {
    // Gets users info 
    const sender_user = inputs.user_of_wf;
    const target_user = inputs.user_id_to_conv;
    const senderUser = await getUserInfo(sender_user);
    const targetUser = await getUserInfo(target_user);

    // Gets time and tz info
    const time_wanted_unix = inputs.time_to_conv;
    const sender_user_tz = senderUser.tz; // Now senderUser is defined
    const target_user_tz = targetUser.tz; // Now targetUser is defined

    // Formats input time
    const initialMoment = moment.unix(time_wanted_unix).tz(sender_user_tz);
    const { formattedTime: initialTimeFormatted, abbr: initialAbbr } = formatTimeWithAbbr(initialMoment);

    // Formats output time
    const outputMoment = moment.unix(time_wanted_unix).tz(target_user_tz);
    const { formattedTime: outputTimeFormatted, abbr: outputAbbr } = formatTimeWithAbbr(outputMoment);

    // Output DM message
    await complete({
      outputs: {
        conv_time_op: `:wave: ${initialTimeFormatted} (${initialAbbr}) ➡️ ${outputTimeFormatted} in ${targetUser.real_name}'s time zone (${outputAbbr})`,
      },
    });
  } catch (error) {
    console.error("Workflow failed unexpectedly:", error);
    await fail(`Workflow failed unexpectedly (error: ${error.message})`);
  }
}

/* Handles the user conversion workflow
 * Converts a time in the sender's timezone to another user's timezone 
 */
async function handleUserConversionWF({ inputs, complete, fail }) {
  try {
    // Gets time and tz info 
    const time_wanted_unix = inputs.time_to_conv;
    const sender_user_tz = senderUser.tz;
    const target_user_tz = targetUser.tz;

    // Gets users info
    const sender_user = inputs.user_of_wf;
    const target_user = inputs.user_id_to_conv;
    const senderUser = await getUserInfo(sender_user);
    const targetUser = await getUserInfo(target_user);

    // Formats input time 
    const initialMoment = moment.unix(time_wanted_unix).tz(sender_user_tz);
    const { formattedTime: initialTimeFormatted, abbr: initialAbbr } = formatTimeWithAbbr(initialMoment);

    // Formats output time 
    const outputMoment = moment.unix(time_wanted_unix).tz(target_user_tz);
    const { formattedTime: outputTimeFormatted, abbr: outputAbbr } = formatTimeWithAbbr(outputMoment);

    // Output DM message 
    await complete({
      outputs: {
        conv_time_op: `:wave: ${initialTimeFormatted} (${initialAbbr}) ➡️ ${outputTimeFormatted} in ${targetUser.real_name}'s time zone (${outputAbbr})`,
      },
    });
  } catch (error) {
    console.error("Workflow failed unexpectedly:", error);
    await fail(`Workflow failed unexpectedly (error: ${error.message})`);
  }
}

// Export functions
module.exports = {
  handleTimeZoneConversionWF,
  handleUserConversionWF,
};