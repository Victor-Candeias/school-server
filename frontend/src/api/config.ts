export const API_CONFIG = {
  authBaseUrl: import.meta.env.VITE_AUTH_API_URL ?? '/auth-api',
  schoolBaseUrl: import.meta.env.VITE_SCHOOL_API_URL ?? '/school-api',
  dbBaseUrl: import.meta.env.VITE_DB_API_URL ?? '/db-api',
} as const
