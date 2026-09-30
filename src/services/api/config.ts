/**
 * Config API service — fetches feature flags and COD configuration from the backend.
 *
 * Real backend endpoint:
 *   GET /api/config
 *
 * The frontend should call this once on app init and cache the result.
 * Flags control UI visibility (e.g. phone OTP tab, online payment methods).
 */
import { apiCall, api } from './client';

export interface AppConfig {
  authPhoneOtpEnabled: boolean;
  onlinePaymentsEnabled: boolean;
  codEnabled: boolean;
  codMaxOrderValuePaise: number;
  codFeePaise: number;
}

interface ConfigResponse {
  success: boolean;
  data: AppConfig;
}

/** Default config matching Phase 5A non-negotiable rules. */
const DEFAULT_CONFIG: AppConfig = {
  authPhoneOtpEnabled: false,
  onlinePaymentsEnabled: false,
  codEnabled: true,
  codMaxOrderValuePaise: 500000, // ₹5,000
  codFeePaise: 5000,             // ₹50
};

let _configCache: AppConfig | null = null;

export async function getAppConfig(): Promise<AppConfig> {
  if (_configCache) return _configCache;

  const result = await apiCall(
    () => DEFAULT_CONFIG,
    async () => {
      const res = await api<ConfigResponse>('/config');
      return res.data;
    }
  );

  _configCache = result;
  return result;
}

/** Convenience: reset cache (useful for tests). */
export function clearConfigCache(): void {
  _configCache = null;
}
