import { apiRequest } from '../api.js';
import { loadNotifications, state } from '../state.js';
import {
  escapeHtml,
  formatDateTime,
  icon,
  renderEmpty,
  setPageHeader,
  showToast,
} from '../ui.js';

function syncNotificationBadge() {
  const unread = state.notifications.filter((notification) => !notification.is_read).length;
  const badge = document.querySelector('[data-notification-count]');
  if (!badge) return;
  badge.textContent = unread > 99 ? '99+' : String(unread);
  badge.hidden = unread === 0;
}

function notificationHtml(notification) {
  return `
    <article class="notification-item ${notification.is_read ? '' : 'is-unread'}">
      <span class="notification-icon">${icon(notification.notification_type === 'reminder' ? 'clock' : 'bell')}</span>
      <div class="notification-copy">
        <h3>${escapeHtml(notification.title)}</h3>
        <p>${escapeHtml(notification.message)}</p>
        <time datetime="${escapeHtml(notification.show_at)}">${escapeHtml(formatDateTime(notification.show_at))}</time>
      </div>
      ${notification.is_read ? '' : `
        <button class="button button-secondary button-small" type="button" data-read-notification="${notification.id}">
          Mark read
        </button>
      `}
    </article>
  `;
}

export async function renderNotifications(container) {
  setPageHeader('Notifications', 'Appointment confirmations, changes, and reminders.');
  await loadNotifications();
  syncNotificationBadge();
  const unread = state.notifications.filter((notification) => !notification.is_read);

  container.innerHTML = `
    <div class="page-stack">
      <div class="page-toolbar">
        <div class="page-toolbar-copy">
          <h2>Account notifications</h2>
          <p>${unread.length} unread notification${unread.length === 1 ? '' : 's'}</p>
        </div>
        ${unread.length ? `
          <button class="button button-secondary" type="button" data-read-all>${icon('check')} Mark all as read</button>
        ` : ''}
      </div>
      ${state.notifications.length
        ? `<section class="notification-list">${state.notifications.map(notificationHtml).join('')}</section>`
        : `<section class="panel">${renderEmpty('No notifications', 'Appointment updates will appear here.', 'bell')}</section>`}
    </div>
  `;

  const markRead = async (id) => {
    await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
  };

  container.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-read-notification]');
    if (!button) return;

    try {
      await markRead(button.dataset.readNotification);
      showToast('Notification marked as read.');
      await renderNotifications(container);
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  container.querySelector('[data-read-all]')?.addEventListener('click', async () => {
    try {
      await Promise.all(unread.map((notification) => markRead(notification.id)));
      showToast('All notifications marked as read.');
      await renderNotifications(container);
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}
