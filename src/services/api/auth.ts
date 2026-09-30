/**
 * Auth API service — supports both mock (VITE_USE_MOCK=true) and real backend.
 *
 * The real backend endpoints:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   POST /api/auth/refresh
 *   POST /api/auth/forgot-password
 *   POST /api/auth/reset-password
 *   GET  /api/account/profile
 *   PATCH /api/account/profile
 */
import { apiCall, api, setStoredAccessToken, clearStoredAccessToken } from './client';
import { DEMO_USER } from '../../store/useAuthStore';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  role?: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/* ─── Register ─── */
export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  return apiCall(
    () => ({
      user: {
        id: `usr-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
      } as AuthUser,
      accessToken: 'mock-access-token',
    }),
    async () => {
      const res = await api<{ success: boolean; data: LoginResponse }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStoredAccessToken(res.data.accessToken);
      return res.data;
    }
  );
}

/* ─── Login ─── */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiCall(
    () => {
      if (payload.email === 'rahul@example.com' || payload.email === DEMO_USER.email) {
        return {
          user: { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email } as AuthUser,
          accessToken: 'mock-access-token',
        };
      }
      throw new Error('Invalid email or password');
    },
    async () => {
      const res = await api<{ success: boolean; data: LoginResponse }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStoredAccessToken(res.data.accessToken);
      return res.data;
    }
  );
}

/* ─── Logout ─── */
export async function logout(): Promise<void> {
  return apiCall(
    () => undefined,
    async () => {
      await api('/auth/logout', { method: 'POST' });
      clearStoredAccessToken();
    }
  );
}

/* ─── Refresh token ─── */
export async function refreshToken(): Promise<string> {
  return apiCall(
    () => 'mock-access-token',
    async () => {
      const res = await api<{ success: boolean; data: { accessToken: string } }>('/auth/refresh', {
        method: 'POST',
      });
      setStoredAccessToken(res.data.accessToken);
      return res.data.accessToken;
    }
  );
}

/* ─── Forgot password ─── */
export async function forgotPassword(email: string): Promise<void> {
  return apiCall(
    () => undefined,
    async () => {
      await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    }
  );
}

/* ─── Reset password ─── */
export async function resetPassword(token: string, password: string): Promise<void> {
  return apiCall(
    () => undefined,
    async () => {
      await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
    }
  );
}

/* ─── Get profile ─── */
export async function getProfile(): Promise<AuthUser> {
  return apiCall(
    () => ({
      id: DEMO_USER.id,
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      phone: DEMO_USER.phone,
      gender: DEMO_USER.gender,
      birthday: DEMO_USER.birthday,
    } as AuthUser),
    async () => {
      const res = await api<{ success: boolean; data: AuthUser }>('/account/profile');
      return res.data;
    }
  );
}

/* ─── Update profile ─── */
export async function updateProfile(
  updates: Partial<Pick<AuthUser, 'name' | 'phone' | 'gender' | 'birthday'>>
): Promise<AuthUser> {
  return apiCall(
    () => ({
      id: DEMO_USER.id,
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      ...updates,
    } as AuthUser),
    async () => {
      const res = await api<{ success: boolean; data: AuthUser }>('/account/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return res.data;
    }
  );
}
