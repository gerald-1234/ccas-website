const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getDayOfWeek,
  isValidDate,
  timeToMinutes,
  validatePassword,
} = require('../src/utils/helpers');

test('timeToMinutes converts a clock time', () => {
  assert.equal(timeToMinutes('09:30'), 570);
});

test('getDayOfWeek uses Monday as day 1', () => {
  assert.equal(getDayOfWeek('2026-07-27'), 1);
});

test('date validation requires YYYY-MM-DD', () => {
  assert.equal(isValidDate('2026-07-27'), true);
  assert.equal(isValidDate('27/07/2026'), false);
});

test('passwords need at least one letter and one number', () => {
  assert.equal(validatePassword('password'), 'Password must contain at least one letter and one number.');
  assert.equal(validatePassword('password1'), null);
});
