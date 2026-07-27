const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildAvailableSlots,
  fitsDoctorSchedule,
  timesOverlap,
} = require('../src/utils/appointment');

test('appointments that touch at their edges do not overlap', () => {
  assert.equal(timesOverlap('09:00', 30, '09:30', 30), false);
});

test('overlapping appointments are detected', () => {
  assert.equal(timesOverlap('09:00', 30, '09:15', 30), true);
});

test('an appointment must fit the doctor schedule and slot size', () => {
  const schedule = [{
    start_time: '09:00',
    end_time: '11:00',
    slot_duration_minutes: 30,
  }];

  assert.equal(fitsDoctorSchedule('09:30', 30, schedule), true);
  assert.equal(fitsDoctorSchedule('10:45', 30, schedule), false);
});

test('available slot generation removes already booked times', () => {
  const schedule = [{
    start_time: '09:00',
    end_time: '10:30',
    slot_duration_minutes: 30,
  }];
  const appointments = [{
    appointment_time: '09:30',
    duration_minutes: 30,
  }];

  assert.deepEqual(buildAvailableSlots(schedule, appointments), [
    { appointment_time: '09:00', duration_minutes: 30 },
    { appointment_time: '10:00', duration_minutes: 30 },
  ]);
});
