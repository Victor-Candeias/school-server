import { useContext } from 'react'
import { AppSettingsContext } from '../context/appSettingsContextValue'

export function useAppSettingsContext() {
  const context = useContext(AppSettingsContext)
  if (!context) {
    throw new Error('useAppSettingsContext deve ser usado dentro de AppSettingsProvider.')
  }
  return context
}
