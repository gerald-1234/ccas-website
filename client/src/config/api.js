const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem("careconnect_token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && token) {
    // Token is invalid or expired, notify the app to log out
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }

  // Try to parse JSON, but handle cases with no content (e.g., 204 No Content)
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    // Use the error message from the API, or a default
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}
