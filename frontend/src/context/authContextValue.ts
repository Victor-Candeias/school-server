import { createContext } from 'react'
import type { FormEvent } from 'react'
import type { PasswordStrength } from '../types'

type AuthMode = 'login' | 'register'

export type AuthContextValue = {
  mode: AuthMode
  name: string
  email: string
  password: string
  confirmPassword: string
  passwordStrength: PasswordStrength
  message: string | null
  error: string | null
  isLoading: boolean
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onLogin: (event: FormEvent<HTMLFormElement>) => void
  onRegister: (event: FormEvent<HTMLFormElement>) => void
  onModeChange: (mode: AuthMode) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
