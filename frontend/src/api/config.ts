export const API_CONFIG = {
  authBaseUrl: import.meta.env.VITE_AUTH_API_URL ?? 'http://127.0.0.1:8020',
  schoolBaseUrl: import.meta.env.VITE_SCHOOL_API_URL ?? 'http://127.0.0.1:8020',
} as const
