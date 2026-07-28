import { apiRequest } from '../api.js';
import { loadPatients, state } from '../state.js';
import {
  escapeHtml,
  formatDate,
  formToObject,
  fullName,
  icon,
  initials,
  openModal,
  renderEmpty,
  setPageHeader,
  showToast,
} from '../ui.js';
import { openBookingModal } from './appointments.js';
import { openPatientHistory } from './history.js';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function patientForm(patient = {}) {
  return `
    <div class="form-grid">
      <div class="form-grid form-grid-two">
        <label class="field">
          <span>First name</span>
          <input type="text" name="first_name" value="${escapeHtml(patient.first_name || '')}" required>
        </label>
        <label class="field">
          <span>Last name</span>
          <input type="text" name="last_name" value="${escapeHtml(patient.last_name || '')}" required>
        </label>
        <label class="field">
          <span>Gender</span>
          <select name="gender" required>
            <option value="">Select gender</option>
            ${['Female', 'Male', 'Other'].map((gender) => `
              <option ${patient.gender === gender ? 'selected' : ''}>${gender}</option>
            `).join('')}
          </select>
        </label>
        <label class="field">
          <span>Date of birth</span>
          <input type="date" name="date_of_birth" value="${escapeHtml(patient.date_of_birth || '')}" max="${new Date().toISOString().slice(0, 10)}" required>
        </label>
        <label class="field">
          <span>Phone number</span>
          <input type="tel" name="phone" value="${escapeHtml(patient.phone || '')}" required>
        </label>
        <label class="field">
          <span>Email address</span>
          <input type="email" name="email" value="${escapeHtml(patient.email || '')}">
        </label>
        <label class="field">
          <span>Blood group</span>
          <select name="blood_group" required>
            <option value="">Select blood group</option>
            ${BLOOD_GROUPS.map((group) => `
              <option ${patient.blood_group === group ? 'selected' : ''}>${group}</option>
            `).join('')}
          </select>
        </label>
      </div>
      <label class="field">
        <span>Residential address</span>
        <textarea name="residential_address" rows="2" required>${escapeHtml(patient.residential_address || '')}</textarea>
      </label>
      <div class="form-grid form-grid-two">
        <label class="field">
          <span>Emergency contact name</span>
          <input type="text" name="emergency_contact_name" value="${escapeHtml(patient.emergency_contact_name || '')}" required>
        </label>
        <label class="field">
          <span>Emergency contact phone</span>
          <input type="tel" name="emergency_contact_phone" value="${escapeHtml(patient.emergency_contact_phone || '')}" required>
        </label>
      </div>
    </div>
  `;
}

function patientActions(patient) {
  const role = state.user.role;
  const buttons = [
    `<button class="icon-button" type="button" title="View patient" aria-label="View patient" data-patient-action="view" data-id="${patient.id}">${icon('eye')}</button>`,
  ];

  if (['receptionist', 'admin'].includes(role)) {
    buttons.push(`<button class="icon-button" type="button" title="Edit patient" aria-label="Edit patient" data-patient-action="edit" data-id="${patient.id}">${icon('edit')}</button>`);
    buttons.push(`<button class="icon-button" type="button" title="Book appointment" aria-label="Book appointment" data-patient-action="book" data-id="${patient.id}">${icon('calendar')}</button>`);
  }

  if (['doctor', 'admin'].includes(role)) {
    buttons.push(`<button class="icon-button" type="button" title="Medical history" aria-label="View medical history" data-patient-action="history" data-id="${patient.id}">${icon('file-heart')}</button>`);
  }

  return buttons.join('');
}

function patientTable() {
  return `
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Phone</th>
            <th>Gender</th>
            <th>Date of birth</th>
            <th>Blood group</th>
            <th>Registered</th>
            <th><span class="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          ${state.patients.map((patient) => `
            <tr>
              <td>
                <div class="table-person">
                  <span class="avatar avatar-blue">${escapeHtml(initials(patient))}</span>
                  <div>
                    <strong>${escapeHtml(fullName(patient))}</strong>
                    <span>${escapeHtml(patient.email || 'No email')}</span>
                  </div>
                </div>
              </td>
              <td>${escapeHtml(patient.phone)}</td>
              <td>${escapeHtml(patient.gender)}</td>
              <td>${escapeHtml(formatDate(patient.date_of_birth))}</td>
              <td><strong>${escapeHtml(patient.blood_group)}</strong></td>
              <td>${escapeHtml(formatDate(patient.registration_date))}</td>
              <td><div class="table-actions">${patientActions(patient)}</div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openPatientDetails(patient) {
  openModal({
    title: fullName(patient),
    eyebrow: `Patient reference ${patient.id.slice(0, 8).toUpperCase()}`,
    hideSubmit: true,
    content: `
      <dl class="detail-list">
        <div class="detail-row"><dt>Gender</dt><dd>${escapeHtml(patient.gender)}</dd></div>
        <div class="detail-row"><dt>Date of birth</dt><dd>${escapeHtml(formatDate(patient.date_of_birth))}</dd></div>
        <div class="detail-row"><dt>Blood group</dt><dd>${escapeHtml(patient.blood_group)}</dd></div>
        <div class="detail-row"><dt>Phone</dt><dd>${escapeHtml(patient.phone)}</dd></div>
        <div class="detail-row"><dt>Email</dt><dd>${escapeHtml(patient.email || 'Not provided')}</dd></div>
        <div class="detail-row"><dt>Address</dt><dd>${escapeHtml(patient.residential_address)}</dd></div>
        <div class="detail-row"><dt>Emergency contact</dt><dd>${escapeHtml(patient.emergency_contact_name)} | ${escapeHtml(patient.emergency_contact_phone)}</dd></div>
        <div class="detail-row"><dt>Registration date</dt><dd>${escapeHtml(formatDate(patient.registration_date))}</dd></div>
      </dl>
    `,
  });
}

function openCreatePatient(afterSave) {
  openModal({
    title: 'Register patient',
    eyebrow: 'Patient management',
    submitLabel: 'Register patient',
    wide: true,
    content: patientForm(),
    onSubmit: async (form) => {
      const data = await apiRequest('/patients', {
        method: 'POST',
        body: JSON.stringify(formToObject(form)),
      });
      showToast(data.message);
      if (afterSave) await afterSave();
    },
  });
}

function openEditPatient(patient, afterSave) {
  openModal({
    title: 'Edit patient',
    eyebrow: fullName(patient),
    submitLabel: 'Save changes',
    wide: true,
    content: patientForm(patient),
    onSubmit: async (form) => {
      const data = await apiRequest(`/patients/${patient.id}`, {
        method: 'PATCH',
        body: JSON.stringify(formToObject(form)),
      });
      showToast(data.message);
      if (afterSave) await afterSave();
    },
  });
}

export async function renderPatients(container) {
  setPageHeader('Patients', 'Find patient details and clinic records.');
  const search = container.dataset.patientSearch || '';
  const result = await loadPatients(search);
  const canCreate = ['receptionist', 'admin'].includes(state.user.role);

  container.innerHTML = `
    <div class="page-stack">
      <div class="page-toolbar">
        <div class="page-toolbar-copy">
          <h2>Patient directory</h2>
          <p>${result.pagination.total} registered patient${result.pagination.total === 1 ? '' : 's'}</p>
        </div>
        <div class="toolbar-actions">
          <form class="search-field" data-patient-search-form>
            ${icon('search')}
            <input type="search" name="search" value="${escapeHtml(search)}" placeholder="Search name or phone">
          </form>
          ${canCreate ? `<button class="button button-primary" type="button" data-create-patient>${icon('plus')} Register patient</button>` : ''}
        </div>
      </div>
      <section class="panel">
        ${state.patients.length
          ? patientTable()
          : renderEmpty('No patients found', search ? 'Try a different search term.' : 'Registered patients will appear here.', 'users')}
      </section>
    </div>
  `;

  const refresh = async () => renderPatients(container);

  container.querySelector('[data-patient-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    container.dataset.patientSearch = new FormData(event.currentTarget).get('search').trim();
    renderPatients(container);
  });

  container.querySelector('[data-create-patient]')?.addEventListener('click', () => {
    openCreatePatient(refresh);
  });

  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-patient-action]');
    if (!button) return;
    const patient = state.patients.find((item) => item.id === button.dataset.id);
    if (!patient) return;

    const action = button.dataset.patientAction;
    if (action === 'view') openPatientDetails(patient);
    if (action === 'edit') openEditPatient(patient, refresh);
    if (action === 'book') openBookingModal({ patientId: patient.id, afterSave: refresh });
    if (action === 'history') openPatientHistory(patient);
  });
}
