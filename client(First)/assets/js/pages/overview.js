import { apiRequest } from '../api.js';
import {
  loadAppointments,
  loadDoctors,
  loadNotifications,
  state,
} from '../state.js';
import {
  escapeHtml,
  firstDayOfMonth,
  formatDate,
  formatDateTime,
  formatTime,
  fullName,
  icon,
  setPageHeader,
  statusBadge,
  todayValue,
} from '../ui.js';

function appointmentItem(appointment) {
  const person = state.user.role === 'patient'
    ? fullName(appointment.doctor, 'Dr. ')
    : fullName(appointment.patient);

  return `
    <div class="list-item">
      <span class="date-tile">
        <strong>${escapeHtml(new Date(`${appointment.appointment_date}T00:00:00`).getDate())}</strong>
        <span>${escapeHtml(formatDate(appointment.appointment_date, { month: 'short', year: undefined }))}</span>
      </span>
      <div class="list-item-main">
        <strong>${escapeHtml(person)}</strong>
        <p>${escapeHtml(formatTime(appointment.appointment_time))} | ${escapeHtml(appointment.reason_for_visit)}</p>
      </div>
      <div class="list-item-meta">
        ${statusBadge(appointment.status)}
        <span>${escapeHtml(appointment.doctor?.consultation_room || '')}</span>
      </div>
    </div>
  `;
}

function notificationItem(notification) {
  return `
    <div class="list-item">
      <span class="stat-icon is-blue">${icon('bell')}</span>
      <div class="list-item-main">
        <strong>${escapeHtml(notification.title)}</strong>
        <p>${escapeHtml(notification.message)}</p>
      </div>
      <div class="list-item-meta">
        <span>${escapeHtml(formatDateTime(notification.show_at))}</span>
      </div>
    </div>
  `;
}

function quickActionHtml() {
  const role = state.user.role;
  const actions = [];

  if (['patient', 'receptionist', 'admin'].includes(role)) {
    actions.push({
      page: 'appointments',
      iconName: 'plus',
      title: 'Book appointment',
      copy: role === 'patient' ? 'Choose a doctor and available time.' : 'Create a booking for a patient.',
    });
  }

  if (['receptionist', 'doctor', 'nurse', 'admin'].includes(role)) {
    actions.push({
      page: 'patients',
      iconName: 'users',
      title: 'Open patient list',
      copy: 'Find patient details and clinic records.',
    });
  }

  if (['manager', 'admin'].includes(role)) {
    actions.push({
      page: 'reports',
      iconName: 'chart',
      title: 'View clinic reports',
      copy: 'Review attendance and doctor utilization.',
    });
  }

  actions.push({
    page: 'doctors',
    iconName: 'stethoscope',
    title: 'Doctor directory',
    copy: 'View specializations and weekly schedules.',
  });

  return actions.slice(0, 3).map((action) => `
    <button class="list-item" type="button" data-go-page="${action.page}">
      <span class="stat-icon">${icon(action.iconName)}</span>
      <span class="list-item-main">
        <strong>${escapeHtml(action.title)}</strong>
        <p>${escapeHtml(action.copy)}</p>
      </span>
      ${icon('chevron-right')}
    </button>
  `).join('');
}

async function renderManagerOverview(container) {
  const from = firstDayOfMonth();
  const to = todayValue();
  const query = new URLSearchParams({ from, to });
  const [summary, utilization, doctors] = await Promise.all([
    apiRequest(`/reports/summary?${query}`),
    apiRequest(`/reports/doctor-utilization?${query}`),
    loadDoctors(),
    loadNotifications(),
  ]);

  const status = summary.appointments_by_status;
  const topDoctor = [...utilization.doctors].sort(
    (a, b) => b.total_appointments - a.total_appointments
  )[0];
  const unread = state.notifications.filter((item) => !item.is_read).length;

  container.innerHTML = `
    <div class="page-stack">
      <div class="page-toolbar">
        <div class="page-toolbar-copy">
          <h2>Clinic performance</h2>
          <p>${escapeHtml(formatDate(from))} to ${escapeHtml(formatDate(to))}</p>
        </div>
        <button class="button button-primary" type="button" data-go-page="reports">
          ${icon('chart')} Open full reports
        </button>
      </div>

      <section class="stats-grid" aria-label="Clinic summary">
        <article class="stat-card">
          <span class="stat-icon">${icon('calendar')}</span>
          <span class="stat-copy"><strong>${summary.total_appointments}</strong><span>Total appointments</span></span>
        </article>
        <article class="stat-card">
          <span class="stat-icon is-blue">${icon('chart')}</span>
          <span class="stat-copy"><strong>${summary.attendance_rate_percent}%</strong><span>Attendance rate</span></span>
        </article>
        <article class="stat-card">
          <span class="stat-icon is-amber">${icon('stethoscope')}</span>
          <span class="stat-copy"><strong>${doctors.length}</strong><span>Doctors listed</span></span>
        </article>
        <article class="stat-card">
          <span class="stat-icon is-coral">${icon('bell')}</span>
          <span class="stat-copy"><strong>${unread}</strong><span>Unread notifications</span></span>
        </article>
      </section>

      <div class="content-grid">
        <section class="panel">
          <div class="panel-header">
            <div><h2>Appointments by status</h2><p>Current reporting period</p></div>
          </div>
          <div class="panel-body">
            <div class="report-bars">
              ${Object.entries(status).map(([name, value], index) => `
                <div class="report-bar-row">
                  <span>${escapeHtml(name.replace('_', ' '))}</span>
                  <div class="report-bar-track">
                    <div class="report-bar-value ${index === 3 ? 'is-coral' : index === 4 ? 'is-amber' : index === 1 ? 'is-blue' : ''}"
                      style="width:${summary.total_appointments ? (value / summary.total_appointments) * 100 : 0}%"></div>
                  </div>
                  <strong>${value}</strong>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header"><div><h2>Management note</h2><p>Current period</p></div></div>
          <div class="panel-body">
            <dl class="detail-list">
              <div class="detail-row"><dt>Most booked doctor</dt><dd>${escapeHtml(topDoctor?.doctor_name || 'No bookings yet')}</dd></div>
              <div class="detail-row"><dt>Completed visits</dt><dd>${status.completed}</dd></div>
              <div class="detail-row"><dt>Cancelled visits</dt><dd>${status.cancelled}</dd></div>
              <div class="detail-row"><dt>No-show visits</dt><dd>${status.no_show}</dd></div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  `;
}

export async function renderOverview(container) {
  setPageHeader('Overview', 'Your clinic activity at a glance.');

  if (state.user.role === 'manager') {
    await renderManagerOverview(container);
    return;
  }

  await Promise.all([
    loadAppointments(),
    loadDoctors(),
    loadNotifications(),
  ]);

  const today = todayValue();
  const active = state.appointments.filter(
    (item) => ['scheduled', 'checked_in'].includes(item.status)
  );
  const upcoming = active
    .filter((item) => item.appointment_date >= today)
    .sort((a, b) => `${a.appointment_date}${a.appointment_time}`.localeCompare(
      `${b.appointment_date}${b.appointment_time}`
    ));
  const todayAppointments = state.appointments.filter(
    (item) => item.appointment_date === today
  );
  const completed = state.appointments.filter((item) => item.status === 'completed').length;
  const unread = state.notifications.filter((item) => !item.is_read).length;
  const role = state.user.role;

  const firstMetric = role === 'patient' ? upcoming.length : todayAppointments.length;
  const firstLabel = role === 'patient' ? 'Upcoming appointments' : "Today's appointments";
  const secondMetric = role === 'patient'
    ? completed
    : todayAppointments.filter((item) => item.status === 'checked_in').length;
  const secondLabel = role === 'patient' ? 'Completed visits' : 'Patients checked in';

  container.innerHTML = `
    <div class="page-stack">
      <div class="page-toolbar">
        <div class="page-toolbar-copy">
          <h2>Welcome, ${escapeHtml(state.user.first_name)}</h2>
          <p>${escapeHtml(formatDate(today, { weekday: 'long' }))}</p>
        </div>
        ${['patient', 'receptionist', 'admin'].includes(role) ? `
          <button class="button button-primary" type="button" data-go-page="appointments">
            ${icon('plus')} Book appointment
          </button>
        ` : ''}
      </div>

      <section class="stats-grid" aria-label="Account summary">
        <article class="stat-card">
          <span class="stat-icon">${icon('calendar')}</span>
          <span class="stat-copy"><strong>${firstMetric}</strong><span>${escapeHtml(firstLabel)}</span></span>
        </article>
        <article class="stat-card">
          <span class="stat-icon is-blue">${icon('check')}</span>
          <span class="stat-copy"><strong>${secondMetric}</strong><span>${escapeHtml(secondLabel)}</span></span>
        </article>
        <article class="stat-card">
          <span class="stat-icon is-amber">${icon('stethoscope')}</span>
          <span class="stat-copy"><strong>${state.doctors.length}</strong><span>Doctors available</span></span>
        </article>
        <article class="stat-card">
          <span class="stat-icon is-coral">${icon('bell')}</span>
          <span class="stat-copy"><strong>${unread}</strong><span>Unread notifications</span></span>
        </article>
      </section>

      <div class="content-grid">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Upcoming appointments</h2>
              <p>Your next scheduled clinic activity</p>
            </div>
            <button class="button button-quiet button-small" type="button" data-go-page="appointments">View all</button>
          </div>
          <div class="panel-body-flush">
            ${upcoming.length
              ? `<div class="list">${upcoming.slice(0, 6).map(appointmentItem).join('')}</div>`
              : `<div class="empty-state">
                  <span class="empty-state-icon">${icon('calendar')}</span>
                  <h3>No upcoming appointments</h3>
                  <p>New appointments will appear here after they are booked.</p>
                </div>`}
          </div>
        </section>

        <div class="page-stack">
          <section class="panel">
            <div class="panel-header"><div><h2>Quick actions</h2><p>Common clinic tasks</p></div></div>
            <div class="panel-body-flush list">${quickActionHtml()}</div>
          </section>

          <section class="panel">
            <div class="panel-header">
              <div><h2>Latest notifications</h2><p>Account updates</p></div>
              <button class="button button-quiet button-small" type="button" data-go-page="notifications">View all</button>
            </div>
            <div class="panel-body-flush">
              ${state.notifications.length
                ? `<div class="list">${state.notifications.slice(0, 3).map(notificationItem).join('')}</div>`
                : `<div class="empty-state"><p>No notifications yet.</p></div>`}
            </div>
          </section>
        </div>
      </div>
    </div>
  `;
}
