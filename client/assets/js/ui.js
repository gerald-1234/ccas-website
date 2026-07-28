const ICON_FILE = 'assets/images/icons.svg';

export function icon(name, className = '') {
  return `
    <svg class="icon ${className}" aria-hidden="true">
      <use href="${ICON_FILE}#icon-${name}"></use>
    </svg>
  `;
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function fullName(person, prefix = '') {
  if (!person) return 'Not available';
  const name = `${person.first_name || ''} ${person.last_name || ''}`.trim();
  return name ? `${prefix}${name}` : 'Not available';
}

export function initials(person) {
  if (!person) return 'CC';
  const first = String(person.first_name || '').charAt(0);
  const last = String(person.last_name || '').charAt(0);
  return `${first}${last}`.toUpperCase() || 'CC';
}

export function titleCase(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function localDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return new Date(`${value}T00:00:00`);
  }
  return new Date(value);
}

export function formatDate(value, options = {}) {
  const date = localDate(value);
  if (!date || Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateTime(value) {
  const date = localDate(value);
  if (!date || Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatTime(value) {
  if (!value) return 'Not available';
  const [hours, minutes] = String(value).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return String(value);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

export function todayValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function firstDayOfMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

export function statusBadge(status) {
  const cssStatus = String(status || 'unknown').replaceAll('_', '-');
  return `<span class="status-pill status-${escapeHtml(cssStatus)}">${escapeHtml(titleCase(status))}</span>`;
}

export function setPageHeader(title, subtitle) {
  document.querySelector('#page-title').textContent = title;
  document.querySelector('#page-subtitle').textContent = subtitle;
  document.title = `${title} | CareConnect`;
}

export function renderPageLoading(message = 'Loading information...') {
  return `
    <div class="page-loading">
      <span class="large-spinner" aria-hidden="true"></span>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

export function renderEmpty(title, message, iconName = 'file-heart', actionHtml = '') {
  return `
    <div class="empty-state">
      <span class="empty-state-icon">${icon(iconName)}</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
      ${actionHtml}
    </div>
  `;
}

export function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

export function setButtonLoading(button, loading) {
  button.classList.toggle('is-loading', loading);
  button.disabled = loading;
}

export function showToast(message, type = 'success') {
  const region = document.querySelector('#toast-region');
  if (!region) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'is-error' : ''}`;
  toast.innerHTML = `
    ${icon(type === 'error' ? 'alert' : 'check')}
    <p>${escapeHtml(message)}</p>
    <button type="button" aria-label="Dismiss notification" title="Dismiss">${icon('x')}</button>
  `;

  toast.querySelector('button').addEventListener('click', () => toast.remove());
  region.append(toast);
  window.setTimeout(() => toast.remove(), 5000);
}

export function openModal({
  title,
  eyebrow = 'CareConnect',
  content,
  submitLabel = 'Save',
  onSubmit,
  wide = false,
  hideSubmit = false,
}) {
  const dialog = document.querySelector('#app-modal');
  const form = document.querySelector('#modal-form');
  const submit = document.querySelector('#modal-submit');

  dialog.classList.toggle('modal-wide', wide);
  document.querySelector('#modal-eyebrow').textContent = eyebrow;
  document.querySelector('#modal-title').textContent = title;
  document.querySelector('#modal-body').innerHTML = content;
  submit.querySelector('span:first-child').textContent = submitLabel;
  submit.hidden = hideSubmit;

  form.onsubmit = async (event) => {
    event.preventDefault();
    if (!onSubmit) return;

    setButtonLoading(submit, true);
    try {
      await onSubmit(form);
      dialog.close();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setButtonLoading(submit, false);
    }
  };

  dialog.showModal();
  return dialog;
}

export function closeModal() {
  const dialog = document.querySelector('#app-modal');
  if (dialog?.open) dialog.close();
}

export function initializeModal() {
  const dialog = document.querySelector('#app-modal');
  if (!dialog) return;

  dialog.addEventListener('click', (event) => {
    if (event.target.matches('[data-close-modal]')) {
      dialog.close();
    }
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

export function renderPagination(pagination, pageName) {
  const page = Number(pagination?.page || 1);
  const limit = Number(pagination?.limit || 20);
  const total = Number(pagination?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return `
    <div class="pagination">
      <span>${total} record${total === 1 ? '' : 's'} | Page ${page} of ${totalPages}</span>
      <div class="pagination-actions">
        <button class="icon-button" type="button" title="Previous page" aria-label="Previous page"
          data-page-target="${escapeHtml(pageName)}" data-page-number="${page - 1}" ${page <= 1 ? 'disabled' : ''}>
          ${icon('chevron-left')}
        </button>
        <button class="icon-button" type="button" title="Next page" aria-label="Next page"
          data-page-target="${escapeHtml(pageName)}" data-page-number="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>
          ${icon('chevron-right')}
        </button>
      </div>
    </div>
  `;
}
