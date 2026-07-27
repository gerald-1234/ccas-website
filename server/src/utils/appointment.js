const { timeToMinutes } = require('./helpers');

function timesOverlap(firstStart, firstDuration, secondStart, secondDuration) {
  const firstStartMinutes = timeToMinutes(firstStart);
  const firstEndMinutes = firstStartMinutes + Number(firstDuration);
  const secondStartMinutes = timeToMinutes(secondStart);
  const secondEndMinutes = secondStartMinutes + Number(secondDuration);

  return firstStartMinutes < secondEndMinutes && firstEndMinutes > secondStartMinutes;
}

function fitsDoctorSchedule(time, duration, schedule) {
  const start = timeToMinutes(time);
  const end = start + Number(duration);

  return schedule.some((period) => {
    const periodStart = timeToMinutes(period.start_time);
    const periodEnd = timeToMinutes(period.end_time);
    const slotDuration = Number(period.slot_duration_minutes);

    return (
      start >= periodStart &&
      end <= periodEnd &&
      Number(duration) === slotDuration &&
      (start - periodStart) % slotDuration === 0
    );
  });
}

function buildAvailableSlots(schedule, appointments) {
  const slots = [];

  for (const period of schedule) {
    const duration = Number(period.slot_duration_minutes);
    const end = timeToMinutes(period.end_time);

    for (
      let start = timeToMinutes(period.start_time);
      start + duration <= end;
      start += duration
    ) {
      const hours = String(Math.floor(start / 60)).padStart(2, '0');
      const minutes = String(start % 60).padStart(2, '0');
      const time = `${hours}:${minutes}`;

      const isBooked = appointments.some((appointment) =>
        timesOverlap(
          time,
          duration,
          appointment.appointment_time,
          appointment.duration_minutes
        )
      );

      if (!isBooked) {
        slots.push({ appointment_time: time, duration_minutes: duration });
      }
    }
  }

  return slots;
}

module.exports = {
  buildAvailableSlots,
  fitsDoctorSchedule,
  timesOverlap,
};
