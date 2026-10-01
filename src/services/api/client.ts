import { simulateDelay } from '../../utils/helpers';

const USE_MOCK = import.meta.env?.VITE_USE_MOCK !== 'false';
export const API_BASE = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:4000/api';

/** Key used by the auth store to persist the access token. */
const ACCESS_TOKEN_KEY = 'sb_access_token';

export function getStoredAccessToken(): string | null {
  try {
    // Auth store persists the full state; extract the token directly
    const raw = localStorage.getItem('sb_access_token');
    if (raw) return raw;
    // Fallback: look inside the zustand-persisted auth store
    const authRaw = localStorage.getItem('stylebazaar-auth');
    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      return parsed?.state?.accessToken ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/** Generic fetch wrapper for real API calls. */
export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include', // Send httpOnly refresh cookie
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error?.message || body?.message || message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

/** Generic fetch wrapper for binary blob downloads (e.g. PDF invoices). */
export async function apiBlob(
  path: string,
  options: RequestInit = {}
): Promise<Blob> {
  const token = getStoredAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to download resource: HTTP ${res.status}`);
  }

  return res.blob();
}

/**
 * Dual-mode API call wrapper.
 *
 * - When `VITE_USE_MOCK=true` (default): runs the mock function with a
 *   simulated network delay. Keeps the app fully functional with no backend.
 * - When `VITE_USE_MOCK=false`: delegates to `realFn` which makes real HTTP
 *   calls to `VITE_API_BASE_URL`.
 */
export async function apiCall<T>(
  mockFn: () => T,
  realFn?: () => Promise<T>
): Promise<T> {
  if (USE_MOCK) {
    await simulateDelay(200, 600);
    return mockFn();
  }
  if (!realFn) {
    throw new Error('Real API not configured for this call.');
  }
  return realFn();
}

export { USE_MOCK };
