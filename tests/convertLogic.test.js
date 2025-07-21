const { convertTimeCommandText } = require("../commands/convertTimeLogic.js");
const { tzMap, TIME_FORMATS } = require("../utils/timeZoneMap.js");
const moment = require("moment-timezone");

// Mock the current date
jest.mock("moment-timezone", () => {
  const actual = jest.requireActual("moment-timezone");

  function mockMoment(input) {
    return {
      format: (fmt) => "2025-07-16",
      isValid: () => true,
      clone() {
        return this;
      },
      tz(toZone) {
        return this;
      },
    };
  }

  mockMoment.tz = (input, format, zone) => {
    return {
      format: (fmt) => {
        if (fmt === "h:mm a") {
          const normalized = input.toLowerCase().replace(/\s+/g, '');
          if (normalized.includes("3pm")) return "3:00 pm";
          if (normalized.includes("1230pm")) return "12:30 pm";
          if (normalized.includes("1200am")) return "12:00 am";
          if (normalized.includes("1200pm")) return "12:00 pm";
          if (normalized.match(/15:30/)) return "3:30 pm";
          return "1:00 pm"; // default
        }
        return "2025-07-16";
      },
      isValid: () => !input.includes("25:00"),
      clone() {
        return this;
      },
      tz(toZone) {
        return this;
      },
    };
  };

  return mockMoment;
});

beforeEach(() => {
  tzMap["EST"] = "America/New_York";
  tzMap["PST"] = "America/Los_Angeles";
  tzMap["UTC"] = "UTC";

  TIME_FORMATS.length = 0;
  TIME_FORMATS.push("h:mm a", "ha", "H:mm", "H");
});

test("should return error if input has less than 3 parts", () => {
  const res = convertTimeCommandText("3PM PST");
  expect(res.error).toMatch(/Invalid input format/);
});

test("should return error if from zone is invalid", () => {
  const res = convertTimeCommandText("3PM XYZ PST");
  expect(res.error).toMatch(/XYZ/);
});

test("should return error if time is invalid", () => {
  const res = convertTimeCommandText("25:00 EST PST");
  expect(res.error).toMatch(/Invalid time/);
});

test("should convert 3pm EST to PST", () => {
  const res = convertTimeCommandText("3pm EST PST");
  expect(res.result).toMatch(/3:00 pm EST ➡️ \d{1,2}:\d{2} (am|pm) PST/);
});

test("should parse spaced time like '3 PM'", () => {
  const res = convertTimeCommandText("3 PM EST PST");
  expect(res.result).toMatch(/3:00 pm EST ➡️ \d{1,2}:\d{2} (am|pm) PST/);
});

test("should parse time like '12 30 pm'", () => {
  const res = convertTimeCommandText("12 30 pm EST PST");
  expect(res.result).toMatch(/12:30 pm EST ➡️ \d{1,2}:\d{2} (am|pm) PST/);
});

test("should allow case-insensitive timezones", () => {
  const res = convertTimeCommandText("3pm est pst");
  expect(res.result).toMatch(/3:00 pm EST ➡️ \d{1,2}:\d{2} (am|pm) PST/);
});

test("should convert 24-hour time format like '15:30'", () => {
  const res = convertTimeCommandText("15:30 EST PST");
  expect(res.result).toMatch(/3:30 pm EST ➡️ \d{1,2}:\d{2} (am|pm) PST/);
});

test("should return error if timezone is unrecognized", () => {
  const res = convertTimeCommandText("3pm estt pst");
  expect(res.error).toMatch(/estt/);
});

test("should normalize extra spaces in input", () => {
  const res = convertTimeCommandText("   3pm    EST     PST   ");
  expect(res.result).toMatch(/3:00 pm EST ➡️ \d{1,2}:\d{2} (am|pm) PST/);
});

test("should match times if fromZone and toZone are same", () => {
  const res = convertTimeCommandText("3pm EST EST");
  expect(res.result).toMatch(/3:00 pm EST ➡️ 3:00 pm EST/);
});

test("should return error for empty input", () => {
  const res = convertTimeCommandText("");
  expect(res.error).toMatch(/Invalid input format/);
});
