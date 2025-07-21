const handler = require('../commands/teamClock.js');
const moment = require('moment-timezone');

// Mock Slack API
jest.mock('@slack/web-api', () => {
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

const slackApi = require('@slack/web-api');
const {
  mUsersInfo,
  mConversationsMembers,
  mUsergroupsUsersList, // ✅ FIXED: Now included
} = slackApi.__mocks;

describe('/teamclock command', () => {
  let ackMock, respondMock;

  beforeEach(() => {
    jest.clearAllMocks();
    ackMock = jest.fn(() => Promise.resolve());
    respondMock = jest.fn(() => Promise.resolve());
  });

  test('basic success with channel members', async () => {
    mConversationsMembers.mockResolvedValue({ members: ['U1', 'U2'] });

    mUsersInfo.mockImplementation(({ user }) => {
      if (user === 'U1') {
        return Promise.resolve({
          user: {
            real_name: 'User1',
            tz: 'America/New_York',
            is_bot: false,
            deleted: false,
          },
        });
      }
      if (user === 'U2') {
        return Promise.resolve({
          user: {
            real_name: 'User2',
            tz: 'America/Los_Angeles',
            is_bot: false,
            deleted: false,
          },
        });
      }
      return Promise.reject(new Error('Unknown user'));
    });

    const payload = {
      command: { text: '', channel_id: 'C1' },
      ack: ackMock,
      respond: respondMock,
    };

    await handler(payload);

    expect(ackMock).toHaveBeenCalled();
    expect(respondMock).toHaveBeenCalled();
    const text = respondMock.mock.calls[0][0];
    expect(text).toContain('User1');
    expect(text).toContain('User2');
  });

  test('handles usergroup input', async () => {
    mUsergroupsUsersList.mockResolvedValue({ users: ['U3', 'U4'] });

    mUsersInfo.mockImplementation(({ user }) => {
      if (user === 'U3') {
        return Promise.resolve({
          user: {
            real_name: 'Charlie',
            tz: 'Europe/London',
            is_bot: false,
            deleted: false,
          },
        });
      }
      if (user === 'U4') {
        return Promise.resolve({
          user: {
            real_name: 'Diana',
            tz: 'Asia/Tokyo',
            is_bot: false,
            deleted: false,
          },
        });
      }
      return Promise.reject(new Error('Unknown user'));
    });

    await handler({
      command: { text: '<!subteam^S12345>', channel_id: 'C2' },
      ack: ackMock,
      respond: respondMock,
    });

    expect(ackMock).toHaveBeenCalled();
    expect(respondMock).toHaveBeenCalled();
    expect(respondMock.mock.calls[0][0]).toContain('Charlie');
    expect(respondMock.mock.calls[0][0]).toContain('Diana');
  });

  test('skips bot and deleted users', async () => {
    mConversationsMembers.mockResolvedValue({ members: ['U5', 'U6'] });

    mUsersInfo.mockImplementation(({ user }) => {
      if (user === 'U5') {
        return Promise.resolve({
          user: { real_name: 'BotUser', tz: 'UTC', is_bot: true, deleted: false },
        });
      }
      if (user === 'U6') {
        return Promise.resolve({
          user: { real_name: 'DeletedUser', tz: 'UTC', is_bot: false, deleted: true },
        });
      }
      return Promise.reject(new Error('Unknown user'));
    });

    await handler({
      command: { text: '', channel_id: 'C5' },
      ack: ackMock,
      respond: respondMock,
    });

    expect(ackMock).toHaveBeenCalled();
    expect(respondMock).toHaveBeenCalled();
    const output = respondMock.mock.calls[0][0];
    expect(output).not.toContain('BotUser');
    expect(output).not.toContain('DeletedUser');
  });

  test('handles error fetching user info', async () => {
    mConversationsMembers.mockResolvedValue({ members: ['U7'] });
    mUsersInfo.mockRejectedValue(new Error('API failure'));

    await handler({
      command: { text: '', channel_id: 'C3' },
      ack: ackMock,
      respond: respondMock,
    });

    expect(ackMock).toHaveBeenCalled();
    expect(respondMock).toHaveBeenCalled();
    expect(respondMock.mock.calls[0][0]).toMatch(/could not retrieve valid user/i); // Adjusted to match actual text
  });

  test('returns meaningful message if no users', async () => {
    mConversationsMembers.mockResolvedValue({ members: [] });

    await handler({
      command: { text: '', channel_id: 'C4' },
      ack: ackMock,
      respond: respondMock,
    });

    expect(ackMock).toHaveBeenCalled();
    expect(respondMock).toHaveBeenCalled();
    expect(respondMock.mock.calls[0][0]).toMatch(/no users/i);
  });

  test('responds with error if conversations.members API fails', async () => {
    mConversationsMembers.mockRejectedValue(new Error('Conversations API failure'));

    await handler({
      command: { text: '', channel_id: 'C1' },
      ack: ackMock,
      respond: respondMock,
    });

    expect(respondMock).toHaveBeenCalledWith(expect.stringContaining('Sorry'));
  });

  test('responds with error if usergroups.users.list API fails', async () => {
    mUsergroupsUsersList.mockRejectedValue(new Error('Usergroups API failure'));

    await handler({
      command: { text: '<!subteam^S12345>', channel_id: 'C1' },
      ack: ackMock,
      respond: respondMock,
    });

    expect(respondMock).toHaveBeenCalledWith(expect.stringContaining('Sorry'));
  });
});
