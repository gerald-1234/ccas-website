import { API_BASE_URL, TOKEN_KEY, USER_KEY } from './config.js';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveSession(token, user) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getSavedUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

// Every frontend API call passes through this function.
export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Could not reach the CareConnect server. Check your connection and try again.');
  }

  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: 'The server returned an invalid response.' };
    }
  }

  if (!response.ok) {
    const error = new Error(data.error || 'The request could not be completed.');
    error.status = response.status;
    throw error;
  }

  return data;
}
