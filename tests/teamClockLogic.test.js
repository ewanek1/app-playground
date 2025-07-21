const handler = require('../commands/teamClock.js'); 

jest.mock("@slack/web-api", () => {
  const mUsersInfo = jest.fn();
  const mConversationsMembers = jest.fn();
  const mUsergroupsUsersList = jest.fn();

  return {
    WebClient: jest.fn().mockImplementation(() => ({
      users: { info: mUsersInfo },
      conversations: { members: mConversationsMembers },
      usergroups: { users: { list: mUsergroupsUsersList } },
    })),
    __mocks: { mUsersInfo, mConversationsMembers, mUsergroupsUsersList },
  };
});

const slackApi = require("@slack/web-api");
const { mUsersInfo, mConversationsMembers, mUsergroupsUsersList } = slackApi.__mocks;

describe('teamClock command logic', () => {
  let ackMock, respondMock;

  beforeEach(() => {
    jest.clearAllMocks();
    ackMock = jest.fn(() => Promise.resolve());
    respondMock = jest.fn(() => Promise.resolve());
  });

  test('returns formatted time for multiple users in different timezones', async () => {
    mConversationsMembers.mockResolvedValue({ members: ['U1', 'U2'] });

    mUsersInfo.mockImplementation(({ user }) => {
      if (user === 'U1') return Promise.resolve({ user: { real_name: 'User1', tz: 'America/New_York', is_bot: false, deleted: false } });
      if (user === 'U2') return Promise.resolve({ user: { real_name: 'User2', tz: 'America/Los_Angeles', is_bot: false, deleted: false } });
      return Promise.reject(new Error('Unknown user'));
    });

    await handler({
      command: { text: '', channel_id: 'C1' },
      ack: ackMock,
      respond: respondMock,
    });

    expect(ackMock).toHaveBeenCalled();
    expect(respondMock).toHaveBeenCalled();

    const responseText = respondMock.mock.calls[0][0];
    expect(responseText).toContain('User1');
    expect(responseText).toContain('User2');
    expect(responseText).toMatch(/(AM|PM|am|pm)/); 
  });

  test('handles empty member list gracefully', async () => {
    mConversationsMembers.mockResolvedValue({ members: [] });

    await handler({
      command: { text: '', channel_id: 'C2' },
      ack: ackMock,
      respond: respondMock,
    });

    expect(ackMock).toHaveBeenCalled();
    expect(respondMock).toHaveBeenCalled();
    expect(respondMock.mock.calls[0][0]).toMatch(/no users/i);
  });

  test('filters out bots and deleted users', async () => {
    mConversationsMembers.mockResolvedValue({ members: ['U3', 'U4'] });

    mUsersInfo.mockImplementation(({ user }) => {
      if (user === 'U3') return Promise.resolve({ user: { real_name: 'BotUser', tz: 'UTC', is_bot: true, deleted: false } });
      if (user === 'U4') return Promise.resolve({ user: { real_name: 'DeletedUser', tz: 'UTC', is_bot: false, deleted: true } });
      return Promise.reject(new Error('Unknown user'));
    });

    await handler({
      command: { text: '', channel_id: 'C3' },
      ack: ackMock,
      respond: respondMock,
    });

    expect(ackMock).toHaveBeenCalled();
    expect(respondMock).toHaveBeenCalled();

    const responseText = respondMock.mock.calls[0][0];
    expect(responseText).not.toContain('BotUser');
    expect(responseText).not.toContain('DeletedUser');
  });

  test('returns error message if Slack API call fails', async () => {
    mConversationsMembers.mockRejectedValue(new Error('Slack API failure'));

    await handler({
      command: { text: '', channel_id: 'C4' },
      ack: ackMock,
      respond: respondMock,
    });

    expect(ackMock).toHaveBeenCalled();
    expect(respondMock).toHaveBeenCalled();
    expect(respondMock.mock.calls[0][0]).toMatch(/sorry/i);
  });
});
