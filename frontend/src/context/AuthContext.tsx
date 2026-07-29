import type { ReactNode } from 'react'
import { AuthContext } from './authContextValue'
import type { AuthContextValue } from './authContextValue'
import type { SchoolApplicationModel } from '../hooks/useSchoolApplication'

type AuthProviderProps = {
  model: SchoolApplicationModel
  children: ReactNode
}

export function AuthProvider({ model, children }: AuthProviderProps) {
  const value: AuthContextValue = {
    mode: model.authMode,
    name: model.name,
    email: model.email,
    password: model.password,
    confirmPassword: model.confirmPassword,
    passwordStrength: model.passwordStrength,
    message: model.message,
    error: model.error,
    isLoading: model.isLoading,
    onNameChange: model.setName,
    onEmailChange: model.setEmail,
    onPasswordChange: model.setPassword,
    onConfirmPasswordChange: model.setConfirmPassword,
    onLogin: model.handleLogin,
    onRegister: model.handleRegister,
    onModeChange: model.switchAuthMode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
