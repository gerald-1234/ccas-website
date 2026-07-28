import { apiRequest, getToken, saveSession } from './api.js';
import { setButtonLoading } from './ui.js';

const title = document.querySelector('#auth-title');
const subtitle = document.querySelector('#auth-subtitle');
const message = document.querySelector('#auth-message');
const tabs = document.querySelectorAll('[data-auth-tab]');
const panels = document.querySelectorAll('[data-auth-panel]');

if (getToken()) {
  window.location.replace('dashboard.html');
}

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

document.querySelector('input[name="date_of_birth"]').max = new Date()
  .toISOString()
  .slice(0, 10);

function showMessage(text, type = 'error') {
  message.textContent = text;
  message.classList.toggle('is-success', type === 'success');
  message.hidden = !text;
}

function selectTab(tabName) {
  tabs.forEach((tab) => {
    const selected = tab.dataset.authTab === tabName;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
  });

  panels.forEach((panel) => {
    panel.hidden = panel.dataset.authPanel !== tabName;
  });

  const isLogin = tabName === 'login';
  title.textContent = isLogin ? 'Sign in to your account' : 'Create your patient account';
  subtitle.textContent = isLogin
    ? 'Enter the details provided by your clinic.'
    : 'Register once to book and manage your appointments.';
  showMessage('');
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => selectTab(tab.dataset.authTab));
});

document.querySelectorAll('[data-password-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = button.parentElement.querySelector('input');
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    button.textContent = showing ? 'Show' : 'Hide';
    button.title = showing ? 'Show password' : 'Hide password';
    button.setAttribute('aria-label', button.title);
  });
});

document.querySelector('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage('');
  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  const values = Object.fromEntries(new FormData(form).entries());

  setButtonLoading(submit, true);
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    saveSession(data.token, data.user);
    window.location.replace('dashboard.html');
  } catch (error) {
    showMessage(error.message);
  } finally {
    setButtonLoading(submit, false);
  }
});

document.querySelector('#register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage('');
  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  const values = Object.fromEntries(new FormData(form).entries());

  setButtonLoading(submit, true);
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    saveSession(data.token, data.user);
    window.location.replace('dashboard.html');
  } catch (error) {
    showMessage(error.message);
  } finally {
    setButtonLoading(submit, false);
  }
});

async function checkServer() {
  const dot = document.querySelector('[data-api-status-dot]');
  const text = document.querySelector('[data-api-status-text]');

  try {
    await apiRequest('/health');
    dot.classList.add('is-online');
    text.textContent = 'Clinic server is online';
  } catch {
    dot.classList.add('is-offline');
    text.textContent = 'Clinic server is currently unreachable';
  }
}

checkServer();
