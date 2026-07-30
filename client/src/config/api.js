const configuredBaseUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export const API_BASE_URL = configuredBaseUrl.endsWith("/api")
  ? configuredBaseUrl
  : `${configuredBaseUrl}/api`;

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('careconnect_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, config);

  if (response.status === 401) {
    sessionStorage.removeItem('careconnect_token');
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}
