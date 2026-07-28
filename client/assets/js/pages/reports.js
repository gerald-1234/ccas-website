import { apiRequest } from '../api.js';
import {
  escapeHtml,
  firstDayOfMonth,
  formatDate,
  icon,
  renderEmpty,
  setPageHeader,
  showToast,
  todayValue,
} from '../ui.js';

function downloadCsv(doctors, from, to) {
  const rows = [
    ['Doctor', 'Specialization', 'Total appointments', 'Completed appointments', 'Booked minutes', 'Completion percent'],
    ...doctors.map((doctor) => [
      doctor.doctor_name,
      doctor.specialization,
      doctor.total_appointments,
      doctor.completed_appointments,
      doctor.booked_minutes,
      doctor.completion_percent,
    ]),
  ];

  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `careconnect-report-${from}-to-${to}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function renderReports(container) {
  setPageHeader('Reports', 'Review attendance and doctor utilization.');
  const from = container.dataset.reportFrom || firstDayOfMonth();
  const to = container.dataset.reportTo || todayValue();
  const query = new URLSearchParams({ from, to });
  const [summary, utilization] = await Promise.all([
    apiRequest(`/reports/summary?${query}`),
    apiRequest(`/reports/doctor-utilization?${query}`),
  ]);
  const status = summary.appointments_by_status;
  const largestStatus = Math.max(1, ...Object.values(status));
  const totalCompleted = utilization.doctors.reduce(
    (sum, doctor) => sum + doctor.completed_appointments,
    0
  );

  container.innerHTML = `
    <div class="page-stack">
      <div class="page-toolbar">
        <div class="page-toolbar-copy">
          <h2>Clinic performance report</h2>
          <p>${escapeHtml(formatDate(from))} to ${escapeHtml(formatDate(to))}</p>
        </div>
        <form class="toolbar-actions" data-report-filter>
          <label class="toolbar-field">
            <span>From</span>
            <input type="date" name="from" value="${escapeHtml(from)}" required>
          </label>
          <label class="toolbar-field">
            <span>To</span>
            <input type="date" name="to" value="${escapeHtml(to)}" required>
          </label>
          <button class="button button-secondary" type="submit">${icon('filter')} Apply</button>
          <button class="button button-primary" type="button" data-export-report>${icon('download')} Export CSV</button>
        </form>
      </div>

      <section class="stats-grid" aria-label="Report totals">
        <article class="stat-card">
          <span class="stat-icon">${icon('calendar')}</span>
          <span class="stat-copy"><strong>${summary.total_appointments}</strong><span>Total appointments</span></span>
        </article>
        <article class="stat-card">
          <span class="stat-icon is-blue">${icon('chart')}</span>
          <span class="stat-copy"><strong>${summary.attendance_rate_percent}%</strong><span>Attendance rate</span></span>
        </article>
        <article class="stat-card">
          <span class="stat-icon is-amber">${icon('clock')}</span>
          <span class="stat-copy"><strong>${status.checked_in}</strong><span>Currently checked in</span></span>
        </article>
        <article class="stat-card">
          <span class="stat-icon is-coral">${icon('check')}</span>
          <span class="stat-copy"><strong>${totalCompleted}</strong><span>Completed consultations</span></span>
        </article>
      </section>

      <div class="content-grid equal">
        <section class="panel">
          <div class="panel-header"><div><h2>Appointments by status</h2><p>Count for each workflow stage</p></div></div>
          <div class="panel-body">
            <div class="report-bars">
              ${Object.entries(status).map(([name, value]) => {
                const cssClass = name === 'cancelled'
                  ? 'is-coral'
                  : name === 'no_show'
                    ? 'is-amber'
                    : name === 'checked_in'
                      ? 'is-blue'
                      : '';
                return `
                  <div class="report-bar-row">
                    <span>${escapeHtml(name.replace('_', ' '))}</span>
                    <div class="report-bar-track">
                      <div class="report-bar-value ${cssClass}" style="width:${(value / largestStatus) * 100}%"></div>
                    </div>
                    <strong>${value}</strong>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header"><div><h2>Report interpretation</h2><p>Important values in this period</p></div></div>
          <div class="panel-body">
            <dl class="detail-list">
              <div class="detail-row"><dt>Scheduled</dt><dd>${status.scheduled}</dd></div>
              <div class="detail-row"><dt>Attended</dt><dd>${status.checked_in + status.completed}</dd></div>
              <div class="detail-row"><dt>Cancelled</dt><dd>${status.cancelled}</dd></div>
              <div class="detail-row"><dt>No-show</dt><dd>${status.no_show}</dd></div>
            </dl>
          </div>
        </section>
      </div>

      <section class="panel">
        <div class="panel-header">
          <div><h2>Doctor utilization</h2><p>Appointments and booked consultation time</p></div>
        </div>
        ${utilization.doctors.length ? `
          <div class="data-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Appointments</th>
                  <th>Completed</th>
                  <th>Booked time</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                ${utilization.doctors.map((doctor) => `
                  <tr>
                    <td><strong>${escapeHtml(doctor.doctor_name)}</strong></td>
                    <td>${escapeHtml(doctor.specialization)}</td>
                    <td>${doctor.total_appointments}</td>
                    <td>${doctor.completed_appointments}</td>
                    <td>${doctor.booked_minutes} minutes</td>
                    <td>
                      <div class="progress" title="${doctor.completion_percent}% complete">
                        <span style="width:${doctor.completion_percent}%"></span>
                      </div>
                      <small>${doctor.completion_percent}%</small>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : renderEmpty('No doctor data', 'No doctors are available for this report.', 'chart')}
      </section>
    </div>
  `;

  container.querySelector('[data-report-filter]').addEventListener('submit', (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (values.from > values.to) {
      showToast('The start date cannot be after the end date.', 'error');
      return;
    }
    container.dataset.reportFrom = values.from;
    container.dataset.reportTo = values.to;
    renderReports(container);
  });

  container.querySelector('[data-export-report]').addEventListener('click', () => {
    downloadCsv(utilization.doctors, from, to);
  });
}
