import { apiRequest } from './client'
import { API_CONFIG } from './config'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  message: string
  userId?: string
  email?: string
  role: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
  role: string
}

export const authApi = {
  login(payload: LoginPayload) {
    return apiRequest<LoginResponse>(API_CONFIG.authBaseUrl, '/auth/login', {
      method: 'POST',
      body: payload,
    })
  },

  register(payload: RegisterPayload) {
    return apiRequest<{ message: string }>(API_CONFIG.authBaseUrl, '/auth/register', {
      method: 'POST',
      body: payload,
    })
  },

  logout() {
    return apiRequest<{ message: string }>(API_CONFIG.authBaseUrl, '/auth/logout', {
      method: 'POST',
    })
  },
}

