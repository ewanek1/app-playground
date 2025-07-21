const { WebClient } = require("@slack/web-api");
const client = new WebClient(process.env.SLACK_BOT_TOKEN);
const { formatUserAvailabilityMessages } = require("../commands/teamClockLogic.js"); 

/* the `getUserIdsFromCommand` function gets
 * user IDs from various Slack input types.
 * Simplifies the user input parsing logic.
 */
async function getUserIdsFromCommand(command) {
  const userInput = command.text.trim();
  const channelId = command.channel_id;  
  let userIds = [];
  let output_message = ''; 

  try {
    // Match a user group format using a regular expression
    // E.g. input: <!subteam^ID|groupname>
    const userGroupMatch = userInput.match(/<!subteam\^([A-Z0-9]+)\|?.*>/);

    // If user group is provided, get its member user IDs
    if (userGroupMatch) {
      const userGroupId = userGroupMatch[1];
      const groupMembersResult = await client.usergroups.users.list({ usergroup: userGroupId });
      userIds = groupMembersResult.users || [];

    // If not a user group, get the channel's member user IDs
    } else if (userInput === "") { 
      const membersResult = await client.conversations.members({ channel: channelId });
      userIds = membersResult.members || [];

    // Invalid input 
    } else {
      output_message = "Invalid input. Please use `/teamclock` or `/teamclock @usergroup`";
    }
  } catch (error) {
    console.error("Error fetching user list:", error);
    output_message = "Sorry, I couldn't fetch the user list right now. Please try again later.";
  }

  return { userIds, output_message }; 
}

// Handles the /teamclock slash command 
module.exports = async ({ command, ack, respond }) => {
  await ack(); 

  const { userIds, output_message } = await getUserIdsFromCommand(command);

  if (output_message) {
    await respond(output_message);
    return;
  }

  if (!userIds.length) {
    await respond("No users found.");
    return;
  }

  // Use Slack API to get user details 
  const usersDataForProcessing = [];
  for (const userId of userIds) {
    try {
      const result = await client.users.info({ user: userId });

      // Exclude bots and deleted users
      if (result.user && !result.user.is_bot && !result.user.deleted) {
        usersDataForProcessing.push({
          id: result.user.id,
          real_name: result.user.real_name,
          tz: result.user.tz,
        });
      }
    } catch (error) {
      console.error(`Error fetching info for user ${userId}:`, error);
    }
  }

  // If no valid users could be processed
  if (!usersDataForProcessing.length) {
      await respond("Could not retrieve valid user information for any members.");
      return;
  }

  // Format the user availability messages using their time zones
  const userMessages = formatUserAvailabilityMessages(usersDataForProcessing);

  await respond(userMessages.join("\n"));
};