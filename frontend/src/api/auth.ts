import { apiRequest } from './client'
import { API_CONFIG } from './config'
import forge from 'node-forge'

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

type PublicKeyResponse = {
  publicKey: string
}

let publicKeyPromise: Promise<string> | null = null

function getPasswordPublicKey() {
  publicKeyPromise ??= apiRequest<PublicKeyResponse>(
    API_CONFIG.authBaseUrl,
    '/auth/password-public-key',
  ).then((response) => response.publicKey)

  return publicKeyPromise
}

async function encryptPassword(password: string) {
  const publicKeyPem = await getPasswordPublicKey()
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)
  const encryptedPassword = publicKey.encrypt(password, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create(),
    },
  })

  return forge.util.encode64(encryptedPassword)
}

async function retryWithFreshPublicKey<T>(request: () => Promise<T>) {
  try {
    return await request()
  } catch {
    publicKeyPromise = null
    return request()
  }
}

export const authApi = {
  login(payload: LoginPayload) {
    return retryWithFreshPublicKey(async () => {
      const encryptedPassword = await encryptPassword(payload.password)

      return apiRequest<LoginResponse>(API_CONFIG.authBaseUrl, '/auth/login', {
        method: 'POST',
        body: {
          email: payload.email,
          encryptedPassword,
        },
      })
    })
  },

  register(payload: RegisterPayload) {
    return retryWithFreshPublicKey(async () => {
      const encryptedPassword = await encryptPassword(payload.password)

      return apiRequest<{ message: string }>(API_CONFIG.authBaseUrl, '/auth/register', {
        method: 'POST',
        body: {
          name: payload.name,
          email: payload.email,
          encryptedPassword,
          role: payload.role,
        },
      })
    })
  },

  logout() {
    return apiRequest<{ message: string }>(API_CONFIG.authBaseUrl, '/auth/logout', {
      method: 'POST',
    })
  },
}
