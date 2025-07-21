const { App } = require('@slack/bolt');

// Import slash commands
const convertCommand = require("./commands/convertTime");
const timeForCommand = require("./commands/timeFor");
const teamClockCommand = require("./commands/teamClock");

// Import workflows
const timeZoneConvertedWorkflow = require("./workflows/conversionWorkflows");
const userConversionWorkflow = require("./workflows/userConversionWorkflow");

// Initializing Bolt App with Socket Mode
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  //logLevel: LogLevel. // DEBUG, INFO, WARN, and ERROR
});

// Handle app_mention events
app.event("app_mention", async ({ event, say }) => {
  await say(`Hello there, <@${event.user}>!`);
});

// Register slash commands
app.command("/convert", convertCommand);
app.command("/time_for", timeForCommand);
app.command("/teamclock", teamClockCommand);

// Register workflow functions
app.function("Time_zone_converted_WF", timeZoneConvertedWorkflow);
app.function("Userconv", userConversionWorkflow);

// Start Bolt app
(async () => {
  await app.start();
  console.log("⚡️ Bolt app is running!");
})();