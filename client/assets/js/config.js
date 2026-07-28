// This is the only file where the frontend API address is configured.
const LOCAL_HOSTS = ['localhost', '127.0.0.1'];
const isLocalDevelopment = LOCAL_HOSTS.includes(window.location.hostname);

export const API_BASE_URL = isLocalDevelopment
  ? 'http://localhost:5000/api'
  : 'https://careconnect-clinic-appointment-system.onrender.com/api';

export const TOKEN_KEY = 'careconnect_token';
export const USER_KEY = 'careconnect_user';
