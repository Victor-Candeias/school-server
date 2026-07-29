import type { ReactNode } from 'react'
import { AppSettingsContext } from './appSettingsContextValue'
import type { AppSettingsContextValue } from './appSettingsContextValue'
import type { SchoolApplicationModel } from '../hooks/useSchoolApplication'

type AppSettingsProviderProps = {
  model: SchoolApplicationModel
  children: ReactNode
}

export function AppSettingsProvider({ model, children }: AppSettingsProviderProps) {
  const value: AppSettingsContextValue = {
    hasUnsavedAppSettingsChanges: model.hasUnsavedAppSettingsChanges,
    handleSettingsAction: model.handleSettingsAction,
    isLoadingClasses: model.isLoadingClasses,
    academicPeriodType: model.academicPeriodType,
    setAcademicPeriodType: model.setAcademicPeriodType,
    semesterPeriods: model.semesterPeriods,
    trimesterPeriods: model.trimesterPeriods,
    updatePeriodDate: model.updatePeriodDate,
    inactiveLogoutMinutes: model.inactiveLogoutMinutes,
    setInactiveLogoutMinutes: model.setInactiveLogoutMinutes,
    normalizePositiveInteger: model.normalizePositiveInteger,
    DEFAULT_INACTIVITY_LOGOUT_MINUTES: model.DEFAULT_INACTIVITY_LOGOUT_MINUTES,
    messageTimeoutSeconds: model.messageTimeoutSeconds,
    setMessageTimeoutSeconds: model.setMessageTimeoutSeconds,
    DEFAULT_MESSAGE_TIMEOUT_SECONDS: model.DEFAULT_MESSAGE_TIMEOUT_SECONDS,
    evaluationMomentTemplates: model.evaluationMomentTemplates,
    addEvaluationMomentTemplate: model.addEvaluationMomentTemplate,
    updateEvaluationMomentTemplate: model.updateEvaluationMomentTemplate,
    removeEvaluationMomentTemplate: model.removeEvaluationMomentTemplate,
    percentageRanges: model.percentageRanges,
    updatePercentageRange: model.updatePercentageRange,
  }

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}
