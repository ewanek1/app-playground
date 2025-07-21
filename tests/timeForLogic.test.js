const { convertTimeBetweenUsers } = require('../commands/timeForLogic');

describe('convertTimeBetweenUsers', () => {
  test('converts valid time between time zones', () => {
    const result = convertTimeBetweenUsers({
      timeVal: '3PM',
      fromTz: 'America/New_York',
      toTz: 'Europe/London',
      toUserName: 'Bob',
    });

    expect(result).toHaveProperty('output_message');
    expect(result.output_message).toMatch(/➡️/); // Contains arrow
    expect(result.output_message).toMatch(/in Bob's time zone/); // Mentions user
  });

  test('returns error on invalid time string', () => {
    const result = convertTimeBetweenUsers({
      timeVal: 'xyz',
      fromTz: 'America/New_York',
      toTz: 'Europe/London',
      toUserName: 'Bob',
    });

    expect(result).toEqual({
      error: 'Invalid time provided. Please check the time format.',
    });
  });

  test('respects multiple time formats (e.g., 15:30)', () => {
    const result = convertTimeBetweenUsers({
      timeVal: '15:30',
      fromTz: 'America/New_York',
      toTz: 'Europe/London',
      toUserName: 'Bob',
    });

    expect(result.output_message).toMatch(/➡️/);
    expect(result.output_message).toMatch(/in Bob's time zone/);
  });

  test('returns correctly formatted time and zones', () => {
    const result = convertTimeBetweenUsers({
      timeVal: '12 PM',
      fromTz: 'America/Los_Angeles',
      toTz: 'Asia/Tokyo',
      toUserName: 'Keiko',
    });

    expect(result.output_message).toMatch(/12:00/i);
    expect(result.output_message).toMatch(/\([A-Z]{2,4}\)/g); // e.g., (PDT)
    expect(result.output_message).toMatch(/➡️/);
    expect(result.output_message).toMatch(/in Keiko's time zone/);
  });
});
