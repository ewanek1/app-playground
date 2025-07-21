const { WebClient } = require("@slack/web-api");
const { convertTimeBetweenUsers } = require("./timeForLogic.js");
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

/* The `timeForCommandText` function converts a given time 
 * in the sender's timezone to the target user's timezone.
 */
async function timeForCommandText(commandText, senderId) {

  // Split input into time and user mention
  const parts = commandText.trim().split(" ");

  if (parts.length !== 2) {
    return {
      error:
        "Invalid input format. Please use the `/time_for <time> @user`\nExample: `/time_for 3PM @username`",
    };
  }

  const [timeVal, targetUserMention] = parts;

  // Extract user ID from using a regular expression
  // E.g. <@U12345>
  const targetUserIdMatch = targetUserMention.match(/<@(\w+)\|?.*>/);
  if (!targetUserIdMatch) {
    return {
      error: "Invalid user format. Please mention a user like @username.",
    };
  }

  const targetUserId = targetUserIdMatch[1];

  // Get sender + target user info from Slack
  const [senderInfo, targetInfo] = await Promise.all([
    client.users.info({ user: senderId }),
    client.users.info({ user: targetUserId }),
  ]);

  if (!senderInfo.user || !targetInfo.user) {
    return {
      error: "Unable to fetch user information from Slack.",
    };
  }

  const senderTz = senderInfo.user.tz;
  const targetTz = targetInfo.user.tz;
  const targetUserName = targetInfo.user.real_name;

  // Call logic function
  return convertTimeBetweenUsers({timeVal, senderTz, targetTz, targetUserName});
}

const timeForCommand = async ({ command, ack, respond }) => {
  await ack();
  const { error, output_message } = await timeForCommandText(command.text, command.user_id);
  if (error) {
    await respond({ text: error });
  } else {
    await respond({ text: output_message });
  }
};

module.exports = timeForCommand; 
