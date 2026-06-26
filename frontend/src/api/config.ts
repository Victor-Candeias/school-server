const defaultApiBaseUrl = `http://${window.location.hostname}:8020`

export const API_CONFIG = {
  authBaseUrl: import.meta.env.VITE_AUTH_API_URL ?? defaultApiBaseUrl,
  schoolBaseUrl: import.meta.env.VITE_SCHOOL_API_URL ?? defaultApiBaseUrl,
} as const
