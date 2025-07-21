const moment = require("moment-timezone");
const handler = require("../commands/timeFor.js");

const mockFns = {
  usersInfo: jest.fn(),
};

const ackMock = jest.fn();
const respondMock = jest.fn();

// Mock Slack API
jest.mock("@slack/web-api", () => ({
  WebClient: jest.fn().mockImplementation(() => ({
    users: {
      info: (...args) => mockFns.usersInfo(...args),
    },
  })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("/time_for command", () => {
  test("responds with error on invalid user mention format", async () => {
    mockFns.usersInfo.mockResolvedValueOnce({
      user: { tz: "America/New_York", real_name: "User1" },
    });

    await handler({
      command: { text: "3PM invalidUser", user_id: "U1" },
      ack: ackMock,
      respond: respondMock,
    });

    expect(ackMock).toHaveBeenCalled();
    expect(respondMock).toHaveBeenCalledWith({
      text: "Invalid user format. Please mention a user like @username.",
    });
  });

  test("responds with error on invalid time input", async () => {
    mockFns.usersInfo.mockResolvedValue({
      user: { tz: "America/New_York", real_name: "User1" },
    });

    await handler({
      command: { text: "xxx <@U2>", user_id: "U1" },
      ack: ackMock,
      respond: respondMock,
    });

    expect(respondMock).toHaveBeenCalledWith({
    text: "Invalid time provided. Please check the time format.",
    });
  });

  test("responds with error on missing input", async () => {
    await handler({
      command: { text: "", user_id: "U1" },
      ack: ackMock,
      respond: respondMock,
    });

    expect(respondMock).toHaveBeenCalledWith({
      text: "Invalid input format. Please use the `/time_for <time> @user`\nExample: `/time_for 3PM @username`",
    });
  });
test("handles Slack API unknown user", async () => {
  mockFns.usersInfo.mockImplementation(({ user }) => {
    if (user === "U1") {
      return Promise.resolve({
        user: { tz: "America/New_York", real_name: "User1" },
      });
    }
    if (user === "U9") {
      // Simulate Slack returning no user
      return Promise.resolve({ user: null }); // Important: mock `user` as null
    }
    throw new Error("Unknown user");
  });

  await handler({
    command: { text: "3PM <@U9>", user_id: "U1" },
    ack: ackMock,
    respond: respondMock,
  });

  expect(respondMock).toHaveBeenCalledWith({
    text: "Unable to fetch user information from Slack.",
  });
});

test("handles Slack API call failure", async () => {
  mockFns.usersInfo.mockImplementation(() => {
    throw new Error("Slack API failure");
  });

  await expect(
    handler({
      command: { text: "3PM <@U2>", user_id: "U1" },
      ack: ackMock,
      respond: respondMock,
    })
  ).rejects.toThrow("Slack API failure");
});
});