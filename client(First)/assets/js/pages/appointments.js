import { apiRequest } from '../api.js';
import {
  loadAppointments,
  loadDoctors,
  loadPatients,
  state,
} from '../state.js';
import {
  escapeHtml,
  formatDate,
  formatTime,
  formToObject,
  fullName,
  icon,
  openModal,
  renderEmpty,
  setPageHeader,
  showToast,
  statusBadge,
  todayValue,
} from '../ui.js';
import { openClinicalRecord } from './clinical.js';

function doctorOptions(selectedId = '') {
  return state.doctors.map((doctor) => `
    <option value="${doctor.id}" ${doctor.id === selectedId ? 'selected' : ''}
      ${doctor.availability_status !== 'available' ? 'disabled' : ''}>
      ${escapeHtml(fullName(doctor, 'Dr. '))} - ${escapeHtml(doctor.specialization)}
    </option>
  `).join('');
}

function patientOptions(selectedId = '') {
  return state.patients.map((patient) => `
    <option value="${patient.id}" ${patient.id === selectedId ? 'selected' : ''}>
      ${escapeHtml(fullName(patient))} - ${escapeHtml(patient.phone)}
    </option>
  `).join('');
}

function appointmentActions(appointment) {
  const role = state.user.role;
  const closed = ['completed', 'cancelled', 'no_show'].includes(appointment.status);
  const buttons = [
    `<button class="icon-button" type="button" title="View appointment" aria-label="View appointment" data-appointment-action="view" data-id="${appointment.id}">${icon('eye')}</button>`,
  ];

  if (appointment.status === 'scheduled' && ['patient', 'receptionist', 'admin'].includes(role)) {
    buttons.push(`<button class="icon-button" type="button" title="Reschedule" aria-label="Reschedule appointment" data-appointment-action="reschedule" data-id="${appointment.id}">${icon('refresh')}</button>`);
  }

  if (!closed && ['patient', 'receptionist', 'doctor', 'admin'].includes(role)) {
    buttons.push(`<button class="icon-button" type="button" title="Cancel" aria-label="Cancel appointment" data-appointment-action="cancel" data-id="${appointment.id}">${icon('x')}</button>`);
  }

  if (appointment.status === 'scheduled' && ['receptionist', 'admin'].includes(role)) {
    buttons.push(`<button class="icon-button" type="button" title="Check patient in" aria-label="Check patient in" data-appointment-action="checked_in" data-id="${appointment.id}">${icon('check')}</button>`);
    buttons.push(`<button class="icon-button" type="button" title="Mark no-show" aria-label="Mark patient as no-show" data-appointment-action="no_show" data-id="${appointment.id}">${icon('alert')}</button>`);
  }

  if (!['cancelled', 'no_show'].includes(appointment.status) && ['nurse', 'admin'].includes(role)) {
    buttons.push(`<button class="icon-button" type="button" title="Record vital signs" aria-label="Record vital signs" data-appointment-action="clinical" data-id="${appointment.id}">${icon('file-heart')}</button>`);
  } else if (!['cancelled', 'no_show'].includes(appointment.status) && ['doctor'].includes(role)) {
    buttons.push(`<button class="icon-button" type="button" title="Open clinical record" aria-label="Open clinical record" data-appointment-action="clinical" data-id="${appointment.id}">${icon('file-heart')}</button>`);
  } else if (appointment.status === 'completed' && state.user.role === 'patient') {
    buttons.push(`<button class="icon-button" type="button" title="View clinical record" aria-label="View clinical record" data-appointment-action="clinical" data-id="${appointment.id}">${icon('file-heart')}</button>`);
  }

  return buttons.join('');
}

function appointmentRows() {
  return state.appointments.map((appointment) => `
    <tr>
      <td>
        <strong>${escapeHtml(formatDate(appointment.appointment_date))}</strong><br>
        <span>${escapeHtml(formatTime(appointment.appointment_time))}</span>
      </td>
      <td>
        <div class="table-person">
          <span class="avatar avatar-blue">${escapeHtml(
            `${appointment.patient?.first_name?.[0] || ''}${appointment.patient?.last_name?.[0] || ''}`
          )}</span>
          <div>
            <strong>${escapeHtml(fullName(appointment.patient))}</strong>
            <span>${escapeHtml(appointment.patient?.phone || 'No phone')}</span>
          </div>
        </div>
      </td>
      <td>
        <strong>${escapeHtml(fullName(appointment.doctor, 'Dr. '))}</strong><br>
        <span>${escapeHtml(appointment.doctor?.specialization || '')}</span>
      </td>
      <td>${escapeHtml(appointment.reason_for_visit)}</td>
      <td>${statusBadge(appointment.status)}</td>
      <td><div class="table-actions">${appointmentActions(appointment)}</div></td>
    </tr>
  `).join('');
}

async function fillAvailableSlots(form) {
  const doctorId = form.elements.doctor_id.value;
  const date = form.elements.appointment_date.value;
  const slotsContainer = form.querySelector('[data-slot-container]');
  const timeInput = form.elements.appointment_time;
  const durationInput = form.elements.duration_minutes;

  timeInput.value = '';
  durationInput.value = '';

  if (!doctorId || !date) {
    slotsContainer.innerHTML = '<p class="notice">Choose a doctor and date to see available times.</p>';
    return;
  }

  slotsContainer.innerHTML = '<div class="page-loading"><span class="large-spinner"></span><p>Checking available times...</p></div>';

  try {
    const data = await apiRequest(`/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`);

    if (!data.slots.length) {
      slotsContainer.innerHTML = `
        <div class="notice is-warning">
          ${icon('alert')}
          <span>No appointment times are available for this doctor on the selected date.</span>
        </div>
      `;
      return;
    }

    slotsContainer.innerHTML = `
      <div class="slot-grid">
        ${data.slots.map((slot) => `
          <button class="slot-button" type="button"
            data-slot-time="${escapeHtml(slot.appointment_time)}"
            data-slot-duration="${escapeHtml(slot.duration_minutes)}">
            ${escapeHtml(formatTime(slot.appointment_time))}
          </button>
        `).join('')}
      </div>
    `;

    slotsContainer.querySelectorAll('[data-slot-time]').forEach((button) => {
      button.addEventListener('click', () => {
        slotsContainer.querySelectorAll('[data-slot-time]').forEach((item) => item.classList.remove('is-selected'));
        button.classList.add('is-selected');
        timeInput.value = button.dataset.slotTime;
        durationInput.value = button.dataset.slotDuration;
      });
    });
  } catch (error) {
    slotsContainer.innerHTML = `<div class="notice is-danger">${icon('alert')}<span>${escapeHtml(error.message)}</span></div>`;
  }
}

export async function openBookingModal({ doctorId = '', patientId = '', afterSave } = {}) {
  const role = state.user.role;
  await loadDoctors();

  if (['receptionist', 'admin'].includes(role) && !state.patients.length) {
    await loadPatients();
  }

  const staffBooking = ['receptionist', 'admin'].includes(role);
  const dialog = openModal({
    title: 'Book appointment',
    eyebrow: 'Appointment scheduling',
    submitLabel: 'Book appointment',
    wide: true,
    content: `
      <div class="form-grid">
        ${staffBooking ? `
          <label class="field">
            <span>Patient</span>
            <select name="patient_id" required>
              <option value="">Select a patient</option>
              ${patientOptions(patientId)}
            </select>
          </label>
        ` : ''}
        <div class="form-grid form-grid-two">
          <label class="field">
            <span>Doctor</span>
            <select name="doctor_id" required>
              <option value="">Select a doctor</option>
              ${doctorOptions(doctorId)}
            </select>
          </label>
          <label class="field">
            <span>Appointment date</span>
            <input type="date" name="appointment_date" min="${todayValue()}" required>
          </label>
        </div>
        <div class="field">
          <span class="field-label">Available appointment times</span>
          <input type="hidden" name="appointment_time">
          <input type="hidden" name="duration_minutes">
          <div data-slot-container>
            <p class="notice">Choose a doctor and date to see available times.</p>
          </div>
        </div>
        <label class="field">
          <span>Reason for visit</span>
          <textarea name="reason_for_visit" rows="3" required></textarea>
        </label>
      </div>
    `,
    onSubmit: async (form) => {
      const values = formToObject(form);
      if (!values.appointment_time) {
        throw new Error('Select one of the available appointment times.');
      }
      values.duration_minutes = Number(values.duration_minutes);
      if (!staffBooking) delete values.patient_id;

      const data = await apiRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      showToast(data.message);
      state.appointments = [];
      if (afterSave) await afterSave();
    },
  });

  const form = dialog.querySelector('#modal-form');
  form.elements.doctor_id.addEventListener('change', () => fillAvailableSlots(form));
  form.elements.appointment_date.addEventListener('change', () => fillAvailableSlots(form));
}

function openRescheduleModal(appointment, afterSave) {
  const dialog = openModal({
    title: 'Reschedule appointment',
    eyebrow: fullName(appointment.doctor, 'Dr. '),
    submitLabel: 'Save new time',
    content: `
      <div class="form-grid">
        <label class="field">
          <span>New appointment date</span>
          <input type="date" name="appointment_date" min="${todayValue()}" value="${escapeHtml(appointment.appointment_date)}" required>
        </label>
        <div class="field">
          <span class="field-label">Available appointment times</span>
          <input type="hidden" name="doctor_id" value="${appointment.doctor_id}">
          <input type="hidden" name="appointment_time">
          <input type="hidden" name="duration_minutes">
          <div data-slot-container></div>
        </div>
      </div>
    `,
    onSubmit: async (form) => {
      const values = formToObject(form);
      if (!values.appointment_time) throw new Error('Select a new appointment time.');
      const data = await apiRequest(`/appointments/${appointment.id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({
          appointment_date: values.appointment_date,
          appointment_time: values.appointment_time,
          duration_minutes: Number(values.duration_minutes),
        }),
      });
      showToast(data.message);
      if (afterSave) await afterSave();
    },
  });

  const form = dialog.querySelector('#modal-form');
  form.elements.appointment_date.addEventListener('change', () => fillAvailableSlots(form));
  fillAvailableSlots(form);
}

function openCancelModal(appointment, afterSave) {
  openModal({
    title: 'Cancel appointment',
    eyebrow: `${formatDate(appointment.appointment_date)} at ${formatTime(appointment.appointment_time)}`,
    submitLabel: 'Cancel appointment',
    content: `
      <div class="notice is-warning">
        ${icon('alert')}
        <span>The appointment will remain in clinic records with a cancelled status.</span>
      </div>
      <label class="field">
        <span>Reason for cancellation</span>
        <textarea name="cancellation_reason" rows="3" required></textarea>
      </label>
    `,
    onSubmit: async (form) => {
      const data = await apiRequest(`/appointments/${appointment.id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify(formToObject(form)),
      });
      showToast(data.message);
      if (afterSave) await afterSave();
    },
  });
}

function openStatusModal(appointment, status, afterSave) {
  openModal({
    title: status === 'checked_in' ? 'Check patient in' : 'Mark as no-show',
    eyebrow: fullName(appointment.patient),
    submitLabel: status === 'checked_in' ? 'Confirm check-in' : 'Confirm no-show',
    content: `
      <div class="notice ${status === 'no_show' ? 'is-warning' : ''}">
        ${icon(status === 'checked_in' ? 'check' : 'alert')}
        <span>
          Change this appointment from ${escapeHtml(appointment.status.replace('_', ' '))}
          to ${escapeHtml(status.replace('_', ' '))}.
        </span>
      </div>
    `,
    onSubmit: async () => {
      const data = await apiRequest(`/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showToast(data.message);
      if (afterSave) await afterSave();
    },
  });
}

function openAppointmentDetails(appointment, afterSave) {
  const clinicalAllowed = ['patient', 'doctor', 'nurse', 'admin'].includes(state.user.role);
  const dialog = openModal({
    title: 'Appointment details',
    eyebrow: `Reference ${appointment.id.slice(0, 8).toUpperCase()}`,
    hideSubmit: true,
    content: `
      <dl class="detail-list">
        <div class="detail-row"><dt>Patient</dt><dd>${escapeHtml(fullName(appointment.patient))}</dd></div>
        <div class="detail-row"><dt>Doctor</dt><dd>${escapeHtml(fullName(appointment.doctor, 'Dr. '))}</dd></div>
        <div class="detail-row"><dt>Specialization</dt><dd>${escapeHtml(appointment.doctor?.specialization || 'Not available')}</dd></div>
        <div class="detail-row"><dt>Date</dt><dd>${escapeHtml(formatDate(appointment.appointment_date))}</dd></div>
        <div class="detail-row"><dt>Time</dt><dd>${escapeHtml(formatTime(appointment.appointment_time))}</dd></div>
        <div class="detail-row"><dt>Duration</dt><dd>${escapeHtml(appointment.duration_minutes)} minutes</dd></div>
        <div class="detail-row"><dt>Consultation room</dt><dd>${escapeHtml(appointment.doctor?.consultation_room || 'To be assigned')}</dd></div>
        <div class="detail-row"><dt>Status</dt><dd>${statusBadge(appointment.status)}</dd></div>
        <div class="detail-row"><dt>Reason for visit</dt><dd>${escapeHtml(appointment.reason_for_visit)}</dd></div>
        ${appointment.cancellation_reason ? `<div class="detail-row"><dt>Cancellation reason</dt><dd>${escapeHtml(appointment.cancellation_reason)}</dd></div>` : ''}
      </dl>
      ${clinicalAllowed && !['cancelled', 'no_show'].includes(appointment.status) ? `
        <button class="button button-secondary button-block" type="button" data-open-clinical>
          ${icon('file-heart')} Open clinical record
        </button>
      ` : ''}
    `,
  });

  dialog.querySelector('[data-open-clinical]')?.addEventListener('click', async () => {
    dialog.close();
    try {
      await openClinicalRecord(appointment, afterSave);
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

export async function renderAppointments(container) {
  setPageHeader('Appointments', 'Book, review, and update clinic visits.');
  const role = state.user.role;
  const filters = {
    status: container.dataset.statusFilter || '',
    date: container.dataset.dateFilter || '',
  };

  await Promise.all([
    loadAppointments(filters),
    loadDoctors(),
    ['receptionist', 'admin'].includes(role) ? loadPatients() : Promise.resolve(),
  ]);

  const canBook = ['patient', 'receptionist', 'admin'].includes(role);

  container.innerHTML = `
    <div class="page-stack">
      <div class="page-toolbar">
        <div class="page-toolbar-copy">
          <h2>Appointment list</h2>
          <p>${state.appointments.length} appointment${state.appointments.length === 1 ? '' : 's'} found</p>
        </div>
        <div class="toolbar-actions">
          <label class="toolbar-field">
            <span>Status</span>
            <select data-appointment-filter="status">
              <option value="">All statuses</option>
              ${['scheduled', 'checked_in', 'completed', 'cancelled', 'no_show'].map((status) => `
                <option value="${status}" ${filters.status === status ? 'selected' : ''}>${escapeHtml(status.replace('_', ' '))}</option>
              `).join('')}
            </select>
          </label>
          <label class="toolbar-field">
            <span>Date</span>
            <input type="date" value="${escapeHtml(filters.date)}" data-appointment-filter="date">
          </label>
          ${canBook ? `<button class="button button-primary" type="button" data-book-appointment>${icon('plus')} Book appointment</button>` : ''}
        </div>
      </div>

      <section class="panel">
        ${state.appointments.length ? `
          <div class="data-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date and time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th><span class="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>${appointmentRows()}</tbody>
            </table>
          </div>
        ` : renderEmpty('No appointments found', 'Change the filters or create a new appointment.', 'calendar')}
      </section>
    </div>
  `;

  const refresh = async () => {
    await renderAppointments(container);
  };

  container.querySelectorAll('[data-appointment-filter]').forEach((field) => {
    field.addEventListener('change', () => {
      container.dataset[`${field.dataset.appointmentFilter}Filter`] = field.value;
      renderAppointments(container);
    });
  });

  container.querySelector('[data-book-appointment]')?.addEventListener('click', () => {
    openBookingModal({ afterSave: refresh });
  });

  container.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-appointment-action]');
    if (!button) return;
    const appointment = state.appointments.find((item) => item.id === button.dataset.id);
    if (!appointment) return;

    try {
      const action = button.dataset.appointmentAction;
      if (action === 'view') openAppointmentDetails(appointment, refresh);
      if (action === 'reschedule') openRescheduleModal(appointment, refresh);
      if (action === 'cancel') openCancelModal(appointment, refresh);
      if (action === 'checked_in' || action === 'no_show') {
        openStatusModal(appointment, action, refresh);
      }
      if (action === 'clinical') await openClinicalRecord(appointment, refresh);
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}
