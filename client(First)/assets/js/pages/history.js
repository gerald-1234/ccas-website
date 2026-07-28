import { apiRequest } from '../api.js';
import { state } from '../state.js';
import {
  escapeHtml,
  formatDate,
  fullName,
  icon,
  openModal,
  renderEmpty,
  setPageHeader,
  showToast,
} from '../ui.js';

function recordTimeline(records) {
  return `
    <div class="timeline">
      ${records.map((record) => `
        <article class="timeline-item">
          <span class="timeline-dot"></span>
          <div class="timeline-content">
            <h3>${escapeHtml(record.diagnosis)}</h3>
            <p>
              ${escapeHtml(formatDate(record.visit_date))}
              ${record.doctor ? ` | ${escapeHtml(fullName(record.doctor, 'Dr. '))}` : ''}
            </p>
            <div class="record-grid">
              <div class="record-section">
                <h4>Treatment</h4>
                <p>${escapeHtml(record.treatment || 'Not provided')}</p>
              </div>
              <div class="record-section">
                <h4>Prescription</h4>
                <p>${escapeHtml(record.prescription || 'Not provided')}</p>
              </div>
              ${record.doctor_notes !== undefined ? `
                <div class="record-section">
                  <h4>Doctor notes</h4>
                  <p>${escapeHtml(record.doctor_notes || 'Not provided')}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

async function getPatientHistory(patientId) {
  return apiRequest(`/medical/patients/${patientId}/history`);
}

export async function openPatientHistory(patient) {
  try {
    const data = await getPatientHistory(patient.id);
    openModal({
      title: `${fullName(patient)} - medical history`,
      eyebrow: 'Patient records',
      wide: true,
      hideSubmit: true,
      content: data.medical_records.length
        ? recordTimeline(data.medical_records)
        : renderEmpty('No medical records', 'Completed consultation records will appear here.', 'file-heart'),
    });
  } catch (error) {
    showToast(error.message, 'error');
  }
}

export async function renderHistory(container) {
  setPageHeader('Medical history', 'Review your completed consultation records.');

  if (!state.profile?.id) {
    container.innerHTML = `
      <section class="panel">
        ${renderEmpty('Profile not available', 'Your patient profile could not be loaded.', 'alert')}
      </section>
    `;
    return;
  }

  const data = await getPatientHistory(state.profile.id);

  container.innerHTML = `
    <div class="page-stack">
      <div class="page-toolbar">
        <div class="page-toolbar-copy">
          <h2>Consultation records</h2>
          <p>${data.medical_records.length} medical record${data.medical_records.length === 1 ? '' : 's'}</p>
        </div>
      </div>
      <section class="panel">
        <div class="panel-body">
          ${data.medical_records.length
            ? recordTimeline(data.medical_records)
            : renderEmpty('No medical records', 'Your records will appear here after a doctor completes a consultation.', 'file-heart')}
        </div>
      </section>
    </div>
  `;
}
