import { apiRequest } from './api.js';

// Shared page data is kept in one small object.
export const state = {
  user: null,
  profile: null,
  doctors: [],
  patients: [],
  appointments: [],
  notifications: [],
};

export async function loadCurrentAccount() {
  const data = await apiRequest('/auth/me');
  state.user = data.user;
  state.profile = data.profile;
  return data;
}

export async function loadDoctors(force = false) {
  if (!force && state.doctors.length) return state.doctors;
  const data = await apiRequest('/doctors');
  state.doctors = data.doctors || [];
  return state.doctors;
}

export async function loadPatients(search = '') {
  const query = new URLSearchParams({ page: '1', limit: '100' });
  if (search) query.set('search', search);
  const data = await apiRequest(`/patients?${query}`);
  state.patients = data.patients || [];
  return data;
}

export async function loadAppointments(filters = {}) {
  const query = new URLSearchParams({ page: '1', limit: '100' });

  for (const [key, value] of Object.entries(filters)) {
    if (value) query.set(key, value);
  }

  const data = await apiRequest(`/appointments?${query}`);
  state.appointments = data.appointments || [];
  return data;
}

export async function loadNotifications() {
  const data = await apiRequest('/notifications?page=1&limit=100');
  state.notifications = data.notifications || [];
  return data;
}
