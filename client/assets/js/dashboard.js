import { apiRequest, clearSession, getToken } from './api.js';
import { loadCurrentAccount, loadNotifications, state } from './state.js';
import {
  escapeHtml,
  formatDate,
  icon,
  initials,
  initializeModal,
  renderPageLoading,
  setPageHeader,
  showToast,
  titleCase,
} from './ui.js';
import { renderOverview } from './pages/overview.js';
import { renderAppointments } from './pages/appointments.js';
import { renderPatients } from './pages/patients.js';
import { renderDoctors } from './pages/doctors.js';
import { renderHistory } from './pages/history.js';
import { renderReports } from './pages/reports.js';
import { renderAdmin } from './pages/admin.js';
import { renderNotifications } from './pages/notifications.js';
import { renderAccount } from './pages/account.js';

const pageContent = document.querySelector('#page-content');
const sidebar = document.querySelector('#sidebar');
const sidebarOverlay = document.querySelector('.sidebar-overlay');

const PAGE_RENDERERS = {
  overview: renderOverview,
  appointments: renderAppointments,
  patients: renderPatients,
  doctors: renderDoctors,
  history: renderHistory,
  reports: renderReports,
  admin: renderAdmin,
  notifications: renderNotifications,
  account: renderAccount,
};

const ROLE_PAGES = {
  patient: ['overview', 'appointments', 'doctors', 'history', 'notifications', 'account'],
  receptionist: ['overview', 'appointments', 'patients', 'doctors', 'notifications', 'account'],
  doctor: ['overview', 'appointments', 'patients', 'doctors', 'notifications', 'account'],
  nurse: ['overview', 'appointments', 'patients', 'doctors', 'notifications', 'account'],
  manager: ['overview', 'reports', 'doctors', 'notifications', 'account'],
  admin: ['overview', 'appointments', 'patients', 'doctors', 'reports', 'admin', 'notifications', 'account'],
};

const NAV_ITEMS = {
  overview: { label: 'Overview', icon: 'home', section: 'Workspace' },
  appointments: { label: 'Appointments', icon: 'calendar', section: 'Workspace' },
  patients: { label: 'Patients', icon: 'users', section: 'Clinic' },
  doctors: { label: 'Doctors', icon: 'stethoscope', section: 'Clinic' },
  history: { label: 'Medical history', icon: 'file-heart', section: 'Clinic' },
  reports: { label: 'Reports', icon: 'chart', section: 'Management' },
  admin: { label: 'Administration', icon: 'shield', section: 'Management' },
  notifications: { label: 'Notifications', icon: 'bell', section: 'Account' },
  account: { label: 'My account', icon: 'settings', section: 'Account' },
};

function closeSidebar() {
  sidebar.classList.remove('is-open');
  sidebarOverlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function openSidebar() {
  sidebar.classList.add('is-open');
  sidebarOverlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function allowedPages() {
  return ROLE_PAGES[state.user?.role] || ['overview', 'account'];
}

function renderNavigation() {
  const navigation = document.querySelector('#sidebar-nav');
  let currentSection = '';
  let html = '';

  for (const page of allowedPages()) {
    const item = NAV_ITEMS[page];
    if (item.section !== currentSection) {
      currentSection = item.section;
      html += `<p class="nav-section-label">${escapeHtml(currentSection)}</p>`;
    }

    html += `
      <a class="nav-link" href="#${page}" data-nav-page="${page}">
        ${icon(item.icon)}
        <span>${escapeHtml(item.label)}</span>
      </a>
    `;
  }

  navigation.innerHTML = html;
}

function fillAccountDetails() {
  const name = `${state.user.first_name} ${state.user.last_name}`;
  document.querySelectorAll('[data-user-name]').forEach((element) => {
    element.textContent = name;
  });
  document.querySelectorAll('[data-user-role]').forEach((element) => {
    element.textContent = titleCase(state.user.role);
  });
  document.querySelectorAll('[data-user-initials]').forEach((element) => {
    element.textContent = initials(state.user);
  });
  document.querySelector('[data-today-label]').textContent = formatDate(new Date(), {
    weekday: 'long',
    month: 'long',
  });
}

async function updateNotificationBadge() {
  const badge = document.querySelector('[data-notification-count]');

  try {
    await loadNotifications();
    const unread = state.notifications.filter((notification) => !notification.is_read).length;
    badge.textContent = unread > 99 ? '99+' : String(unread);
    badge.hidden = unread === 0;
  } catch {
    badge.hidden = true;
  }
}

function navigate(page) {
  if (!allowedPages().includes(page)) page = 'overview';

  if (window.location.hash.slice(1) !== page) {
    window.location.hash = page;
    return;
  }

  renderPage(page);
}

async function renderPage(requestedPage) {
  const page = allowedPages().includes(requestedPage) ? requestedPage : 'overview';
  const renderer = PAGE_RENDERERS[page];

  document.querySelectorAll('[data-nav-page]').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.navPage === page);
  });

  closeSidebar();
  pageContent.innerHTML = renderPageLoading();
  pageContent.focus();

  try {
    await renderer(pageContent, navigate);
  } catch (error) {
    if (error.status === 401) {
      clearSession();
      window.location.replace('index.html');
      return;
    }

    setPageHeader('Unable to load page', 'The requested information is not available.');
    pageContent.innerHTML = `
      <div class="panel">
        <div class="empty-state">
          <span class="empty-state-icon">${icon('alert')}</span>
          <h3>Something went wrong</h3>
          <p>${escapeHtml(error.message)}</p>
          <button class="button button-primary" type="button" data-retry-page="${page}">
            ${icon('refresh')} Try again
          </button>
        </div>
      </div>
    `;
  }
}

async function signOut() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    // The token is removed locally even when the server is unreachable.
  }

  clearSession();
  window.location.replace('index.html');
}

document.querySelectorAll('[data-open-sidebar]').forEach((button) => {
  button.addEventListener('click', openSidebar);
});

document.querySelectorAll('[data-close-sidebar]').forEach((button) => {
  button.addEventListener('click', closeSidebar);
});

document.querySelectorAll('[data-sign-out]').forEach((button) => {
  button.addEventListener('click', signOut);
});

document.addEventListener('click', (event) => {
  const pageButton = event.target.closest('[data-go-page]');
  if (pageButton) navigate(pageButton.dataset.goPage);

  const retryButton = event.target.closest('[data-retry-page]');
  if (retryButton) renderPage(retryButton.dataset.retryPage);
});

window.addEventListener('hashchange', () => {
  renderPage(window.location.hash.slice(1) || 'overview');
});

async function startDashboard() {
  if (!getToken()) {
    window.location.replace('index.html');
    return;
  }

  initializeModal();

  try {
    await loadCurrentAccount();
    fillAccountDetails();
    renderNavigation();
    updateNotificationBadge();
    navigate(window.location.hash.slice(1) || 'overview');
  } catch (error) {
    clearSession();
    showToast(error.message, 'error');
    window.setTimeout(() => window.location.replace('index.html'), 700);
  }
}

startDashboard();
