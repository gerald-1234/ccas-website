import { apiRequest } from '../api.js';
import { loadDoctors, state } from '../state.js';
import {
  escapeHtml,
  formatTime,
  fullName,
  icon,
  initials,
  openModal,
  renderEmpty,
  setPageHeader,
  showToast,
  statusBadge,
} from '../ui.js';
import { openBookingModal } from './appointments.js';

const DAYS = [
  [1, 'Monday'],
  [2, 'Tuesday'],
  [3, 'Wednesday'],
  [4, 'Thursday'],
  [5, 'Friday'],
  [6, 'Saturday'],
  [7, 'Sunday'],
];

function periodsForDay(doctor, day) {
  return (doctor.doctor_availability || []).filter(
    (period) => Number(period.day_of_week) === day
  );
}

function canEditAvailability(doctor) {
  return state.user.role === 'admin' ||
    (state.user.role === 'doctor' && state.profile?.id === doctor.id);
}

function doctorCard(doctor) {
  const canBook = ['patient', 'receptionist', 'admin'].includes(state.user.role);
  const periods = doctor.doctor_availability || [];
  const workingDays = new Set(periods.map((period) => period.day_of_week)).size;

  return `
    <article class="doctor-card">
      <div class="doctor-card-header">
        <span class="avatar avatar-blue">${escapeHtml(initials(doctor))}</span>
        <div>
          <h3>${escapeHtml(fullName(doctor, 'Dr. '))}</h3>
          <p>${escapeHtml(doctor.specialization)}</p>
        </div>
      </div>
      <div class="doctor-card-details">
        <span>${icon('calendar')} ${workingDays} working day${workingDays === 1 ? '' : 's'} configured</span>
        <span>${icon('phone')} ${escapeHtml(doctor.phone || 'Phone not provided')}</span>
        <span>${icon('home')} ${escapeHtml(doctor.consultation_room || 'Room not assigned')}</span>
      </div>
      <div>${statusBadge(doctor.availability_status)}</div>
      <div class="doctor-card-actions">
        <button class="button button-secondary button-small" type="button" data-doctor-action="schedule" data-id="${doctor.id}">
          ${icon('clock')} Schedule
        </button>
        ${canBook && doctor.availability_status === 'available' ? `
          <button class="button button-primary button-small" type="button" data-doctor-action="book" data-id="${doctor.id}">
            ${icon('plus')} Book
          </button>
        ` : ''}
        ${canEditAvailability(doctor) ? `
          <button class="icon-button" type="button" title="Edit availability" aria-label="Edit availability" data-doctor-action="availability" data-id="${doctor.id}">
            ${icon('edit')}
          </button>
        ` : ''}
      </div>
    </article>
  `;
}

function scheduleHtml(doctor) {
  return `
    <div class="schedule-list">
      ${DAYS.map(([dayNumber, dayName]) => {
        const periods = periodsForDay(doctor, dayNumber);
        return `
          <div class="schedule-row">
            <strong>${dayName}</strong>
            <div class="schedule-periods">
              ${periods.length ? periods.map((period) => `
                <span class="time-chip">
                  ${escapeHtml(formatTime(period.start_time))} - ${escapeHtml(formatTime(period.end_time))}
                  (${escapeHtml(period.slot_duration_minutes)} min)
                </span>
              `).join('') : '<span class="status-pill">Not available</span>'}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function openSchedule(doctor) {
  openModal({
    title: `${fullName(doctor, 'Dr. ')} - weekly schedule`,
    eyebrow: doctor.specialization,
    hideSubmit: true,
    content: scheduleHtml(doctor),
  });
}

function availabilityForm(doctor) {
  return `
    <div class="notice">
      ${icon('clock')}
      <span>Tick each working day and enter the start time, end time, and appointment duration.</span>
    </div>
    <div class="availability-grid">
      ${DAYS.map(([dayNumber, dayName]) => {
        const period = periodsForDay(doctor, dayNumber)[0];
        return `
          <div class="availability-row" data-availability-row="${dayNumber}">
            <label class="availability-day">
              <input type="checkbox" name="day_${dayNumber}" ${period ? 'checked' : ''}>
              <span>${dayName}</span>
            </label>
            <label class="field">
              <span>Start</span>
              <input type="time" name="start_${dayNumber}" value="${escapeHtml(period?.start_time?.slice(0, 5) || '09:00')}">
            </label>
            <label class="field">
              <span>End</span>
              <input type="time" name="end_${dayNumber}" value="${escapeHtml(period?.end_time?.slice(0, 5) || '17:00')}">
            </label>
            <label class="field">
              <span>Minutes</span>
              <input type="number" name="duration_${dayNumber}" min="10" max="240" step="5" value="${escapeHtml(period?.slot_duration_minutes || 30)}">
            </label>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function openAvailability(doctor, afterSave) {
  openModal({
    title: 'Set doctor availability',
    eyebrow: fullName(doctor, 'Dr. '),
    submitLabel: 'Save schedule',
    wide: true,
    content: availabilityForm(doctor),
    onSubmit: async (form) => {
      const periods = [];

      for (const [dayNumber] of DAYS) {
        if (!form.elements[`day_${dayNumber}`].checked) continue;
        const start = form.elements[`start_${dayNumber}`].value;
        const end = form.elements[`end_${dayNumber}`].value;

        if (!start || !end || end <= start) {
          throw new Error(`Enter a valid start and end time for day ${dayNumber}.`);
        }

        periods.push({
          day_of_week: dayNumber,
          start_time: start,
          end_time: end,
          slot_duration_minutes: Number(form.elements[`duration_${dayNumber}`].value),
        });
      }

      if (!periods.length) throw new Error('Select at least one working day.');

      const data = await apiRequest(`/doctors/${doctor.id}/availability`, {
        method: 'PUT',
        body: JSON.stringify({ periods }),
      });
      showToast(data.message);
      state.doctors = [];
      if (afterSave) await afterSave();
    },
  });
}

export async function renderDoctors(container) {
  setPageHeader('Doctors', 'View specialties and weekly clinic schedules.');
  await loadDoctors(true);
  const search = (container.dataset.doctorSearch || '').toLowerCase();
  const doctors = state.doctors.filter((doctor) => {
    const text = `${doctor.first_name} ${doctor.last_name} ${doctor.specialization}`.toLowerCase();
    return text.includes(search);
  });

  container.innerHTML = `
    <div class="page-stack">
      <div class="page-toolbar">
        <div class="page-toolbar-copy">
          <h2>Doctor directory</h2>
          <p>${state.doctors.length} doctor${state.doctors.length === 1 ? '' : 's'} registered</p>
        </div>
        <form class="search-field" data-doctor-search-form>
          ${icon('search')}
          <input type="search" name="search" value="${escapeHtml(container.dataset.doctorSearch || '')}" placeholder="Search doctors">
        </form>
      </div>
      ${doctors.length
        ? `<section class="doctor-grid">${doctors.map(doctorCard).join('')}</section>`
        : `<section class="panel">${renderEmpty('No doctors found', 'Try a different name or specialization.', 'stethoscope')}</section>`}
    </div>
  `;

  const refresh = async () => renderDoctors(container);

  container.querySelector('[data-doctor-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    container.dataset.doctorSearch = new FormData(event.currentTarget).get('search').trim();
    renderDoctors(container);
  });

  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-doctor-action]');
    if (!button) return;
    const doctor = state.doctors.find((item) => item.id === button.dataset.id);
    if (!doctor) return;

    if (button.dataset.doctorAction === 'schedule') openSchedule(doctor);
    if (button.dataset.doctorAction === 'book') {
      openBookingModal({ doctorId: doctor.id, afterSave: refresh });
    }
    if (button.dataset.doctorAction === 'availability') openAvailability(doctor, refresh);
  });
}
