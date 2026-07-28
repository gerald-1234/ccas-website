import { apiRequest } from '../api.js';
import { state } from '../state.js';
import {
  escapeHtml,
  formatDate,
  formatDateTime,
  formToObject,
  fullName,
  icon,
  initials,
  openModal,
  renderEmpty,
  setPageHeader,
  showToast,
  statusBadge,
  titleCase,
} from '../ui.js';

async function getUsers(role = '') {
  const query = new URLSearchParams({ page: '1', limit: '100' });
  if (role) query.set('role', role);
  return apiRequest(`/admin/users?${query}`);
}

async function getAuditLogs() {
  return apiRequest('/admin/audit-logs?page=1&limit=100');
}

function openCreateStaff(afterSave) {
  const dialog = openModal({
    title: 'Create staff account',
    eyebrow: 'Administration',
    submitLabel: 'Create account',
    wide: true,
    content: `
      <div class="form-grid">
        <div class="form-grid form-grid-two">
          <label class="field">
            <span>First name</span>
            <input type="text" name="first_name" required>
          </label>
          <label class="field">
            <span>Last name</span>
            <input type="text" name="last_name" required>
          </label>
          <label class="field">
            <span>Email address</span>
            <input type="email" name="email" required>
          </label>
          <label class="field">
            <span>Phone number</span>
            <input type="tel" name="phone">
          </label>
          <label class="field">
            <span>Role</span>
            <select name="role" required>
              <option value="">Select a role</option>
              <option value="receptionist">Receptionist</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </label>
          <label class="field">
            <span>Temporary password</span>
            <input type="password" name="password" minlength="8" required>
            <small>Use uppercase, lowercase, and a number.</small>
          </label>
        </div>
        <div class="form-grid form-grid-two" data-doctor-fields hidden>
          <label class="field">
            <span>Specialization</span>
            <input type="text" name="specialization">
          </label>
          <label class="field">
            <span>Consultation room</span>
            <input type="text" name="consultation_room">
          </label>
        </div>
      </div>
    `,
    onSubmit: async (form) => {
      const values = formToObject(form);
      if (values.role !== 'doctor') {
        delete values.specialization;
        delete values.consultation_room;
      }
      const data = await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      showToast(data.message);
      if (afterSave) await afterSave();
    },
  });

  const roleSelect = dialog.querySelector('[name="role"]');
  const doctorFields = dialog.querySelector('[data-doctor-fields]');
  const specialization = dialog.querySelector('[name="specialization"]');

  roleSelect.addEventListener('change', () => {
    const isDoctor = roleSelect.value === 'doctor';
    doctorFields.hidden = !isDoctor;
    specialization.required = isDoctor;
  });
}

function openResetPassword(user) {
  openModal({
    title: 'Reset staff password',
    eyebrow: fullName(user),
    submitLabel: 'Reset password',
    content: `
      <div class="notice is-warning">
        ${icon('alert')}
        <span>The user should change this temporary password after signing in.</span>
      </div>
      <label class="field">
        <span>New temporary password</span>
        <input type="password" name="new_password" minlength="8" required>
        <small>Use uppercase, lowercase, and a number.</small>
      </label>
    `,
    onSubmit: async (form) => {
      const data = await apiRequest(`/admin/users/${user.id}/reset-password`, {
        method: 'PATCH',
        body: JSON.stringify(formToObject(form)),
      });
      showToast(data.message);
    },
  });
}

function openStatusChange(user, afterSave) {
  const nextStatus = !user.is_active;
  openModal({
    title: nextStatus ? 'Activate account' : 'Deactivate account',
    eyebrow: fullName(user),
    submitLabel: nextStatus ? 'Activate' : 'Deactivate',
    content: `
      <div class="notice ${nextStatus ? '' : 'is-warning'}">
        ${icon(nextStatus ? 'check' : 'alert')}
        <span>
          ${nextStatus
            ? 'This user will be able to sign in again.'
            : 'This user will lose access to the clinic portal.'}
        </span>
      </div>
    `,
    onSubmit: async () => {
      const data = await apiRequest(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: nextStatus }),
      });
      showToast(data.message);
      if (afterSave) await afterSave();
    },
  });
}

function usersTable(users) {
  return `
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Created</th>
            <th><span class="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          ${users.map((user) => `
            <tr>
              <td>
                <div class="table-person">
                  <span class="avatar avatar-blue">${escapeHtml(initials(user))}</span>
                  <div><strong>${escapeHtml(fullName(user))}</strong><span>${escapeHtml(user.email)}</span></div>
                </div>
              </td>
              <td>${escapeHtml(titleCase(user.role))}</td>
              <td>${escapeHtml(user.phone || 'Not provided')}</td>
              <td>${statusBadge(user.is_active ? 'active' : 'inactive')}</td>
              <td>${escapeHtml(formatDate(user.created_at))}</td>
              <td>
                <div class="table-actions">
                  <button class="icon-button" type="button" title="Reset password" aria-label="Reset password" data-admin-action="password" data-id="${user.id}">
                    ${icon('refresh')}
                  </button>
                  ${user.id !== state.user.id ? `
                    <button class="icon-button" type="button" title="${user.is_active ? 'Deactivate account' : 'Activate account'}"
                      aria-label="${user.is_active ? 'Deactivate account' : 'Activate account'}" data-admin-action="status" data-id="${user.id}">
                      ${icon(user.is_active ? 'x' : 'check')}
                    </button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function auditTable(logs) {
  return `
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date and time</th>
            <th>User</th>
            <th>Role</th>
            <th>Action</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map((log) => `
            <tr>
              <td>${escapeHtml(formatDateTime(log.created_at))}</td>
              <td>${escapeHtml(log.user ? fullName(log.user) : 'System')}</td>
              <td>${escapeHtml(titleCase(log.user?.role || 'system'))}</td>
              <td><strong>${escapeHtml(titleCase(log.action))}</strong></td>
              <td>${escapeHtml(log.details || 'No details')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export async function renderAdmin(container) {
  setPageHeader('Administration', 'Manage staff accounts and audit activity.');
  const activeTab = container.dataset.adminTab || 'users';
  const roleFilter = container.dataset.userRole || '';
  const data = activeTab === 'users' ? await getUsers(roleFilter) : await getAuditLogs();

  container.innerHTML = `
    <div class="page-stack">
      <div class="tabs" role="tablist" aria-label="Administration views">
        <button class="tab ${activeTab === 'users' ? 'is-active' : ''}" type="button" data-admin-tab="users">Staff accounts</button>
        <button class="tab ${activeTab === 'audit' ? 'is-active' : ''}" type="button" data-admin-tab="audit">Audit logs</button>
      </div>

      ${activeTab === 'users' ? `
        <div class="page-toolbar">
          <div class="page-toolbar-copy">
            <h2>System users</h2>
            <p>${data.pagination.total} user account${data.pagination.total === 1 ? '' : 's'}</p>
          </div>
          <div class="toolbar-actions">
            <label class="toolbar-field">
              <span>Role</span>
              <select data-user-role-filter>
                <option value="">All roles</option>
                ${['patient', 'receptionist', 'doctor', 'nurse', 'manager', 'admin'].map((role) => `
                  <option value="${role}" ${roleFilter === role ? 'selected' : ''}>${escapeHtml(titleCase(role))}</option>
                `).join('')}
              </select>
            </label>
            <button class="button button-primary" type="button" data-create-staff>${icon('plus')} Add staff</button>
          </div>
        </div>
        <section class="panel">
          ${data.users.length ? usersTable(data.users) : renderEmpty('No users found', 'No accounts match this role filter.', 'users')}
        </section>
      ` : `
        <div class="page-toolbar">
          <div class="page-toolbar-copy">
            <h2>Audit activity</h2>
            <p>${data.pagination.total} recorded system action${data.pagination.total === 1 ? '' : 's'}</p>
          </div>
        </div>
        <section class="panel">
          ${data.audit_logs.length ? auditTable(data.audit_logs) : renderEmpty('No audit logs', 'System activity will appear here.', 'shield')}
        </section>
      `}
    </div>
  `;

  const refresh = async () => renderAdmin(container);

  container.querySelectorAll('[data-admin-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      container.dataset.adminTab = tab.dataset.adminTab;
      renderAdmin(container);
    });
  });

  container.querySelector('[data-user-role-filter]')?.addEventListener('change', (event) => {
    container.dataset.userRole = event.currentTarget.value;
    renderAdmin(container);
  });

  container.querySelector('[data-create-staff]')?.addEventListener('click', () => {
    openCreateStaff(refresh);
  });

  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-admin-action]');
    if (!button || !data.users) return;
    const user = data.users.find((item) => item.id === button.dataset.id);
    if (!user) return;

    if (button.dataset.adminAction === 'password') openResetPassword(user);
    if (button.dataset.adminAction === 'status') openStatusChange(user, refresh);
  });
}
