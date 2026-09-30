/**
 * App-wide feature flag context.
 *
 * Fetches GET /api/config on mount (or uses defaults when mock mode is on).
 * All components read flags from `useConfig()` instead of env vars directly,
 * so a single source of truth drives what is shown/hidden.
 *
 * Flags (all default false):
 *  - authPhoneOtpEnabled     → show Phone OTP tab on /login
 *  - onlinePaymentsEnabled   → enable UPI/Card/Netbanking/Razorpay tabs
 *  - codEnabled              → show COD tab
 *  - codMaxOrderValuePaise   → max order value for COD (paise)
 *  - codFeePaise             → COD handling fee (paise)
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getAppConfig, type AppConfig } from '../services/api/config';

interface ConfigContextValue {
  config: AppConfig;
  loading: boolean;
}

const DEFAULT_CONFIG: AppConfig = {
  authPhoneOtpEnabled: false,
  onlinePaymentsEnabled: false,
  codEnabled: true,
  codMaxOrderValuePaise: 500000,
  codFeePaise: 5000,
};

const ConfigContext = createContext<ConfigContextValue>({
  config: DEFAULT_CONFIG,
  loading: true,
});

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAppConfig()
      .then((cfg) => { if (!cancelled) setConfig(cfg); })
      .catch(() => { /* keep defaults on error */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigContextValue {
  return useContext(ConfigContext);
}
