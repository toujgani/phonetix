const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

export const apiRequest = async <T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.message || Object.values(payload.errors || {}).flat()[0] || `Request failed (${response.status}).`;
    throw new Error(String(message));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const apiUrl = (path: string) => `${API_BASE}${path}`;
