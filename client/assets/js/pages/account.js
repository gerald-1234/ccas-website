import { apiRequest } from '../api.js';
import { state } from '../state.js';
import {
  escapeHtml,
  formatDate,
  formToObject,
  fullName,
  icon,
  openModal,
  setPageHeader,
  showToast,
  titleCase,
} from '../ui.js';

function openChangePassword() {
  openModal({
    title: 'Change password',
    eyebrow: 'Account security',
    submitLabel: 'Change password',
    content: `
      <div class="form-grid">
        <label class="field">
          <span>Current password</span>
          <input type="password" name="current_password" autocomplete="current-password" required>
        </label>
        <label class="field">
          <span>New password</span>
          <input type="password" name="new_password" autocomplete="new-password" minlength="8" required>
          <small>Use at least 8 characters with uppercase, lowercase, and a number.</small>
        </label>
        <label class="field">
          <span>Confirm new password</span>
          <input type="password" name="confirm_password" autocomplete="new-password" minlength="8" required>
        </label>
      </div>
    `,
    onSubmit: async (form) => {
      const values = formToObject(form);
      if (values.new_password !== values.confirm_password) {
        throw new Error('The new passwords do not match.');
      }
      delete values.confirm_password;
      const data = await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      showToast(data.message);
    },
  });
}

function openPatientProfile(afterSave) {
  const patient = state.profile;
  openModal({
    title: 'Edit patient profile',
    eyebrow: fullName(patient),
    submitLabel: 'Save profile',
    wide: true,
    content: `
      <div class="form-grid">
        <div class="form-grid form-grid-two">
          <label class="field"><span>First name</span><input type="text" name="first_name" value="${escapeHtml(patient.first_name)}" required></label>
          <label class="field"><span>Last name</span><input type="text" name="last_name" value="${escapeHtml(patient.last_name)}" required></label>
          <label class="field">
            <span>Gender</span>
            <select name="gender" required>
              ${['Female', 'Male', 'Other'].map((gender) => `<option ${patient.gender === gender ? 'selected' : ''}>${gender}</option>`).join('')}
            </select>
          </label>
          <label class="field"><span>Date of birth</span><input type="date" name="date_of_birth" max="${new Date().toISOString().slice(0, 10)}" value="${escapeHtml(patient.date_of_birth)}" required></label>
          <label class="field"><span>Phone</span><input type="tel" name="phone" value="${escapeHtml(patient.phone)}" required></label>
          <label class="field"><span>Email</span><input type="email" name="email" value="${escapeHtml(patient.email || '')}"></label>
          <label class="field">
            <span>Blood group</span>
            <select name="blood_group" required>
              ${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => `<option ${patient.blood_group === group ? 'selected' : ''}>${group}</option>`).join('')}
            </select>
          </label>
        </div>
        <label class="field"><span>Residential address</span><textarea name="residential_address" rows="2" required>${escapeHtml(patient.residential_address)}</textarea></label>
        <div class="form-grid form-grid-two">
          <label class="field"><span>Emergency contact name</span><input type="text" name="emergency_contact_name" value="${escapeHtml(patient.emergency_contact_name)}" required></label>
          <label class="field"><span>Emergency contact phone</span><input type="tel" name="emergency_contact_phone" value="${escapeHtml(patient.emergency_contact_phone)}" required></label>
        </div>
      </div>
    `,
    onSubmit: async (form) => {
      const data = await apiRequest(`/patients/${patient.id}`, {
        method: 'PATCH',
        body: JSON.stringify(formToObject(form)),
      });
      state.profile = data.patient;
      showToast(data.message);
      if (afterSave) await afterSave();
    },
  });
}

function profileDetails() {
  if (state.user.role === 'patient' && state.profile) {
    return `
      <dl class="detail-list">
        <div class="detail-row"><dt>Full name</dt><dd>${escapeHtml(fullName(state.profile))}</dd></div>
        <div class="detail-row"><dt>Gender</dt><dd>${escapeHtml(state.profile.gender)}</dd></div>
        <div class="detail-row"><dt>Date of birth</dt><dd>${escapeHtml(formatDate(state.profile.date_of_birth))}</dd></div>
        <div class="detail-row"><dt>Blood group</dt><dd>${escapeHtml(state.profile.blood_group)}</dd></div>
        <div class="detail-row"><dt>Phone</dt><dd>${escapeHtml(state.profile.phone)}</dd></div>
        <div class="detail-row"><dt>Address</dt><dd>${escapeHtml(state.profile.residential_address)}</dd></div>
        <div class="detail-row"><dt>Emergency contact</dt><dd>${escapeHtml(state.profile.emergency_contact_name)} | ${escapeHtml(state.profile.emergency_contact_phone)}</dd></div>
      </dl>
    `;
  }

  if (state.user.role === 'doctor' && state.profile) {
    return `
      <dl class="detail-list">
        <div class="detail-row"><dt>Doctor name</dt><dd>${escapeHtml(fullName(state.profile, 'Dr. '))}</dd></div>
        <div class="detail-row"><dt>Specialization</dt><dd>${escapeHtml(state.profile.specialization)}</dd></div>
        <div class="detail-row"><dt>Consultation room</dt><dd>${escapeHtml(state.profile.consultation_room || 'Not assigned')}</dd></div>
        <div class="detail-row"><dt>Availability</dt><dd>${escapeHtml(titleCase(state.profile.availability_status))}</dd></div>
      </dl>
    `;
  }

  return `
    <div class="notice">
      ${icon('user')}
      <span>Your role uses the main user account details shown above.</span>
    </div>
  `;
}

export async function renderAccount(container) {
  setPageHeader('My account', 'Review your profile and security settings.');
  const canEditPatient = state.user.role === 'patient' && state.profile;

  container.innerHTML = `
    <div class="page-stack">
      <div class="content-grid equal">
        <section class="panel">
          <div class="panel-header">
            <div><h2>Account details</h2><p>Your login identity</p></div>
          </div>
          <div class="panel-body">
            <dl class="detail-list">
              <div class="detail-row"><dt>Name</dt><dd>${escapeHtml(fullName(state.user))}</dd></div>
              <div class="detail-row"><dt>Email</dt><dd>${escapeHtml(state.user.email)}</dd></div>
              <div class="detail-row"><dt>Phone</dt><dd>${escapeHtml(state.user.phone || 'Not provided')}</dd></div>
              <div class="detail-row"><dt>Role</dt><dd>${escapeHtml(titleCase(state.user.role))}</dd></div>
            </dl>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div><h2>Security</h2><p>Password-protected access</p></div>
          </div>
          <div class="panel-body page-stack">
            <div class="notice">${icon('shield')}<span>Your password is verified by the backend and stored only as a secure hash.</span></div>
            <button class="button button-secondary" type="button" data-change-password>${icon('settings')} Change password</button>
          </div>
        </section>
      </div>

      <section class="panel">
        <div class="panel-header">
          <div><h2>${state.user.role === 'patient' ? 'Patient profile' : state.user.role === 'doctor' ? 'Doctor profile' : 'Role profile'}</h2><p>Clinic information linked to this account</p></div>
          ${canEditPatient ? `<button class="button button-secondary button-small" type="button" data-edit-profile>${icon('edit')} Edit profile</button>` : ''}
        </div>
        <div class="panel-body">${profileDetails()}</div>
      </section>
    </div>
  `;

  container.querySelector('[data-change-password]').addEventListener('click', openChangePassword);
  container.querySelector('[data-edit-profile]')?.addEventListener('click', () => {
    openPatientProfile(() => renderAccount(container));
  });
}
