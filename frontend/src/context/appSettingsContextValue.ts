import { createContext } from 'react'
import type { SchoolApplicationModel } from '../hooks/useSchoolApplication'

export type AppSettingsContextValue = Pick<
  SchoolApplicationModel,
  | 'hasUnsavedAppSettingsChanges'
  | 'handleSettingsAction'
  | 'isLoadingClasses'
  | 'academicPeriodType'
  | 'setAcademicPeriodType'
  | 'semesterPeriods'
  | 'trimesterPeriods'
  | 'updatePeriodDate'
  | 'inactiveLogoutMinutes'
  | 'setInactiveLogoutMinutes'
  | 'normalizePositiveInteger'
  | 'DEFAULT_INACTIVITY_LOGOUT_MINUTES'
  | 'messageTimeoutSeconds'
  | 'setMessageTimeoutSeconds'
  | 'DEFAULT_MESSAGE_TIMEOUT_SECONDS'
  | 'evaluationMomentTemplates'
  | 'addEvaluationMomentTemplate'
  | 'updateEvaluationMomentTemplate'
  | 'removeEvaluationMomentTemplate'
  | 'percentageRanges'
  | 'updatePercentageRange'
>

export const AppSettingsContext = createContext<AppSettingsContextValue | null>(null)
