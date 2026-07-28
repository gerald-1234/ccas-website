import { apiRequest } from '../api.js';
import { state } from '../state.js';
import {
  escapeHtml,
  formatDate,
  formatTime,
  formToObject,
  fullName,
  icon,
  openModal,
  showToast,
} from '../ui.js';

function valueOrDash(value, suffix = '') {
  return value === null || value === undefined || value === ''
    ? 'Not recorded'
    : `${escapeHtml(value)}${suffix}`;
}

function clinicalRecordContent(data) {
  const vitals = data.vital_signs;
  const record = data.medical_record;

  return `
    <div class="page-stack">
      <div class="notice">
        ${icon('calendar')}
        <div>
          <strong>${escapeHtml(formatDate(data.appointment.appointment_date))} at ${escapeHtml(formatTime(data.appointment.appointment_time))}</strong><br>
          ${escapeHtml(fullName(data.appointment.patient))} with ${escapeHtml(fullName(data.appointment.doctor, 'Dr. '))}
        </div>
      </div>

      <section>
        <div class="page-toolbar">
          <div class="page-toolbar-copy"><h2>Vital signs</h2><p>Recorded before consultation</p></div>
          ${['nurse', 'admin'].includes(state.user.role) ? `
            <button class="button button-secondary button-small" type="button" data-edit-vitals>
              ${icon('edit')} ${vitals ? 'Update vitals' : 'Record vitals'}
            </button>
          ` : ''}
        </div>
        <div class="record-grid">
          <div class="record-section"><h4>Temperature</h4><p>${valueOrDash(vitals?.temperature_c, ' C')}</p></div>
          <div class="record-section"><h4>Blood pressure</h4><p>${vitals?.systolic_bp && vitals?.diastolic_bp ? `${escapeHtml(vitals.systolic_bp)}/${escapeHtml(vitals.diastolic_bp)} mmHg` : 'Not recorded'}</p></div>
          <div class="record-section"><h4>Pulse rate</h4><p>${valueOrDash(vitals?.pulse_rate, ' bpm')}</p></div>
          <div class="record-section"><h4>Oxygen saturation</h4><p>${valueOrDash(vitals?.oxygen_saturation, '%')}</p></div>
          <div class="record-section"><h4>Weight</h4><p>${valueOrDash(vitals?.weight_kg, ' kg')}</p></div>
          <div class="record-section"><h4>Height</h4><p>${valueOrDash(vitals?.height_cm, ' cm')}</p></div>
        </div>
        ${vitals?.observations ? `<div class="record-section"><h4>Observations</h4><p>${escapeHtml(vitals.observations)}</p></div>` : ''}
      </section>

      <section>
        <div class="page-toolbar">
          <div class="page-toolbar-copy"><h2>Consultation record</h2><p>Diagnosis and treatment information</p></div>
          ${['doctor', 'admin'].includes(state.user.role) ? `
            <button class="button button-secondary button-small" type="button" data-edit-record>
              ${icon('edit')} ${record ? 'Update record' : 'Write record'}
            </button>
          ` : ''}
        </div>
        ${record ? `
          <div class="record-grid">
            <div class="record-section"><h4>Diagnosis</h4><p>${escapeHtml(record.diagnosis)}</p></div>
            <div class="record-section"><h4>Treatment</h4><p>${escapeHtml(record.treatment || 'Not provided')}</p></div>
            <div class="record-section"><h4>Prescription</h4><p>${escapeHtml(record.prescription || 'Not provided')}</p></div>
            ${record.doctor_notes !== undefined ? `<div class="record-section"><h4>Doctor notes</h4><p>${escapeHtml(record.doctor_notes || 'Not provided')}</p></div>` : ''}
          </div>
        ` : `
          <div class="empty-state">
            <span class="empty-state-icon">${icon('file-heart')}</span>
            <h3>No consultation record</h3>
            <p>The doctor has not completed a medical record for this appointment.</p>
          </div>
        `}
      </section>
    </div>
  `;
}

async function loadClinicalRecord(appointmentId) {
  return apiRequest(`/medical/appointments/${appointmentId}`);
}

function openVitalsForm(appointmentId, existing, afterSave) {
  openModal({
    title: existing ? 'Update vital signs' : 'Record vital signs',
    eyebrow: 'Clinical care',
    submitLabel: 'Save vital signs',
    wide: true,
    content: `
      <div class="form-grid form-grid-three">
        <label class="field">
          <span>Temperature (C)</span>
          <input type="number" name="temperature_c" step="0.1" min="25" max="45" value="${escapeHtml(existing?.temperature_c || '')}">
        </label>
        <label class="field">
          <span>Systolic BP</span>
          <input type="number" name="systolic_bp" min="40" max="260" value="${escapeHtml(existing?.systolic_bp || '')}">
        </label>
        <label class="field">
          <span>Diastolic BP</span>
          <input type="number" name="diastolic_bp" min="30" max="180" value="${escapeHtml(existing?.diastolic_bp || '')}">
        </label>
        <label class="field">
          <span>Pulse rate (bpm)</span>
          <input type="number" name="pulse_rate" min="20" max="240" value="${escapeHtml(existing?.pulse_rate || '')}">
        </label>
        <label class="field">
          <span>Respiratory rate</span>
          <input type="number" name="respiratory_rate" min="5" max="80" value="${escapeHtml(existing?.respiratory_rate || '')}">
        </label>
        <label class="field">
          <span>Oxygen saturation (%)</span>
          <input type="number" name="oxygen_saturation" min="0" max="100" value="${escapeHtml(existing?.oxygen_saturation || '')}">
        </label>
        <label class="field">
          <span>Weight (kg)</span>
          <input type="number" name="weight_kg" min="1" max="500" step="0.1" value="${escapeHtml(existing?.weight_kg || '')}">
        </label>
        <label class="field">
          <span>Height (cm)</span>
          <input type="number" name="height_cm" min="30" max="250" step="0.1" value="${escapeHtml(existing?.height_cm || '')}">
        </label>
      </div>
      <label class="field">
        <span>Observations</span>
        <textarea name="observations" rows="3">${escapeHtml(existing?.observations || '')}</textarea>
      </label>
    `,
    onSubmit: async (form) => {
      const values = formToObject(form);
      const data = await apiRequest(`/medical/appointments/${appointmentId}/vitals`, {
        method: 'PUT',
        body: JSON.stringify(values),
      });
      showToast(data.message);
      if (afterSave) await afterSave();
    },
  });
}

function openMedicalRecordForm(appointment, existing, afterSave) {
  openModal({
    title: existing ? 'Update consultation record' : 'Write consultation record',
    eyebrow: 'Doctor workspace',
    submitLabel: 'Save medical record',
    wide: true,
    content: `
      <div class="form-grid">
        <label class="field">
          <span>Diagnosis</span>
          <textarea name="diagnosis" rows="3" required>${escapeHtml(existing?.diagnosis || '')}</textarea>
        </label>
        <label class="field">
          <span>Treatment</span>
          <textarea name="treatment" rows="3">${escapeHtml(existing?.treatment || '')}</textarea>
        </label>
        <label class="field">
          <span>Prescription</span>
          <textarea name="prescription" rows="3">${escapeHtml(existing?.prescription || '')}</textarea>
        </label>
        <label class="field">
          <span>Private doctor notes</span>
          <textarea name="doctor_notes" rows="3">${escapeHtml(existing?.doctor_notes || '')}</textarea>
          <small>Patients cannot see this field.</small>
        </label>
        <label class="field">
          <span>Visit date</span>
          <input type="date" name="visit_date" value="${escapeHtml(existing?.visit_date || appointment.appointment_date)}" required>
        </label>
      </div>
    `,
    onSubmit: async (form) => {
      const data = await apiRequest(`/medical/appointments/${appointment.id}/record`, {
        method: 'PUT',
        body: JSON.stringify(formToObject(form)),
      });
      showToast(data.message);
      if (afterSave) await afterSave();
    },
  });
}

export async function openClinicalRecord(appointment, afterSave) {
  const data = await loadClinicalRecord(appointment.id);
  showClinicalModal(data, appointment, afterSave);
}

function showClinicalModal(data, appointment, afterSave) {
  const dialog = openModal({
    title: 'Clinical record',
    eyebrow: 'Patient care',
    content: clinicalRecordContent(data),
    wide: true,
    hideSubmit: true,
  });

  dialog.querySelector('[data-edit-vitals]')?.addEventListener('click', () => {
    dialog.close();
    openVitalsForm(appointment.id, data.vital_signs, afterSave);
  });

  dialog.querySelector('[data-edit-record]')?.addEventListener('click', () => {
    dialog.close();
    openMedicalRecordForm(appointment, data.medical_record, afterSave);
  });
}
