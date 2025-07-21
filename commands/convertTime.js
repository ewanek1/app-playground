// Import logic file 
const { convertTimeCommandText } = require("./convertTimeLogic");

const convertCommand = async ({ command, ack, respond }) => {
  await ack();

  const { error, result } = convertTimeCommandText(command.text);

  if (error) {
    await respond({ text: error });
    return;
  }

  await respond({ text: result });
};

module.exports = convertCommand;
