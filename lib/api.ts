const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function getApiUrl() {
  return API_URL;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('admin_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('admin_token');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ───── Public fetch (server-side safe) with timeout ───── */
export async function fetchPublic(path: string, fallback: any = null, timeoutMs: number = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) return fallback;
    return res.json();
  } catch (err: any) {
    clearTimeout(id);
    console.error(`fetchPublic error for path ${path}:`, err.message || err);
    return fallback;
  }
}

/* ───── Admin fetch (client-side only) ───── */
export async function fetchAdmin(path: string, options: RequestInit = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    clearAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized');
  }
  return res;
}
