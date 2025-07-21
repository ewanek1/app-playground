const handler = require('../commands/convertTime.js');
jest.mock('@slack/web-api'); // mock Slack API

describe('/convert command (Bolt integration)', () => {
  let app;
  let respondMock;

  beforeEach(() => {
    respondMock = jest.fn();
  });

   test('basic success with valid time, known zones', async () => {
    const payload = {
      command: '/convert',
      text: '3PM EST PST',
      user_id: 'U12345',
      channel_id: 'C12345',
    };

    await handler({ command: payload, ack: jest.fn(), respond: respondMock });

    expect(respondMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('➡️'),
      })
    );
    expect(respondMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('EST'),
      })
    );
    expect(respondMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('PST'),
      })
    );
  });

  test('invalid format: missing time zone args', async () => {
    const payload = {
      command: '/convert',
      text: '3PM',
      user_id: 'U12345',
      channel_id: 'C12345',
    };

    await handler({ command: payload, ack: jest.fn(), respond: respondMock });

    expect(respondMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('Invalid input format'),
      })
    );
  });

  test('unknown from zone', async () => {
    const payload = {
      command: '/convert',
      text: '3PM XYZ PST',
      user_id: 'U12345',
      channel_id: 'C12345',
    };

    await handler({ command: payload, ack: jest.fn(), respond: respondMock });

    expect(respondMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("don't recognize the time zone abbreviation XYZ"),
      })
    );
  });

  test('unknown to zone', async () => {
    const payload = {
      command: '/convert',
      text: '3PM EST ABC',
      user_id: 'U12345',
      channel_id: 'C12345',
    };

    await handler({ command: payload, ack: jest.fn(), respond: respondMock });

    expect(respondMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("don't recognize the time zone abbreviation ABC"),
      })
    );
  });
});