import { schoolApi } from '../api/school'
import { useRef } from 'react'
import type { FormEvent } from 'react'
import type { AppSettings } from '../api/school'
import type { SchoolDocument } from '../api/school'
import type { AcademicPeriod } from '../types'
import type { AcademicPeriodType } from '../types'
import type { DashboardSection } from '../types'
import type { EvaluationMomentTemplate } from '../types'
import { DEFAULT_EVALUATION_MOMENT_TEMPLATES } from '../utils/constants'
import { DEFAULT_INACTIVITY_LOGOUT_MINUTES } from '../utils/constants'
import { DEFAULT_MESSAGE_TIMEOUT_SECONDS } from '../utils/constants'
import { DEFAULT_POPUP_BACKGROUND_COLOR } from '../utils/constants'
import { DEFAULT_POPUP_TEXT_COLOR } from '../utils/constants'
import { DEFAULT_PERCENTAGE_RANGES } from '../utils/constants'
import { normalizeNonNegativeInteger } from '../utils/validation'
import { normalizePercentageRanges } from '../utils/validation'
import { normalizePositiveInteger } from '../utils/validation'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'

export function useAppSettings(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'loadAppSettings' | 'saveAppSettings' | 'hasUnsavedAppSettingsChanges' | 'handleSettingsAction' | 'saveAndCloseSettings' | 'discardAndCloseSettings' | 'cancelSettingsClose' | 'addEvaluationMomentTemplate' | 'updateEvaluationMomentTemplate' | 'removeEvaluationMomentTemplate' | 'updatePercentageRange' | 'updatePeriodDate' | 'openSettingsDashboard' | 'openSettingsDashboardWithAssessmentGuard' | 'closeSettingsDashboard' | 'getStudentMomentPercentage' | 'getStudentMomentPercentageValue' | 'getStudentMomentPercentageStyle'> {
  const previousDashboardRef = useRef<Exclude<DashboardSection, 'settings'>>('schools')

async function loadAppSettings() {
    try {
      const settings = await schoolApi.getAppSettings()
      const normalizedSettings = normalizeAppSettings(settings)
      applyAppSettings(normalizedSettings)
      runtime.setSavedAppSettingsFingerprint(getAppSettingsFingerprint(normalizedSettings))
    } catch (settingsError) {
      runtime.setError(
        settingsError instanceof Error
          ? settingsError.message
          : 'Erro ao carregar configurações da aplicação.',
      )
    }
  }

async function saveAppSettings() {
    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      const settings = await schoolApi.updateAppSettings({
        inactiveLogoutMinutes: runtime.inactiveLogoutMinutes,
        messageTimeoutSeconds: runtime.messageTimeoutSeconds,
        popupBackgroundColor: runtime.popupBackgroundColor,
        popupTextColor: runtime.popupTextColor,
        evaluationMomentTemplates: runtime.evaluationMomentTemplates,
        percentageRanges: runtime.percentageRanges,
        academicPeriodType: runtime.academicPeriodType,
        semesterPeriods: runtime.semesterPeriods,
        trimesterPeriods: runtime.trimesterPeriods,
      })
      const normalizedSettings = normalizeAppSettings(settings)
      applyAppSettings(normalizedSettings)
      runtime.setSavedAppSettingsFingerprint(getAppSettingsFingerprint(normalizedSettings))
      runtime.setMessage('Configurações gravadas com sucesso.')
      return true
    } catch (settingsError) {
      runtime.setClassesError(
        settingsError instanceof Error
          ? settingsError.message
          : 'Erro ao gravar configurações da aplicação.',
      )
      return false
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

function normalizeAppSettings(settings: AppSettings): NormalizedAppSettings {
    return {
      inactiveLogoutMinutes: normalizePositiveInteger(
        settings.inactiveLogoutMinutes,
        DEFAULT_INACTIVITY_LOGOUT_MINUTES,
      ),
      messageTimeoutSeconds: normalizePositiveInteger(
        settings.messageTimeoutSeconds,
        DEFAULT_MESSAGE_TIMEOUT_SECONDS,
      ),
      popupBackgroundColor: normalizeHexColor(
        settings.popupBackgroundColor,
        DEFAULT_POPUP_BACKGROUND_COLOR,
      ),
      popupTextColor: normalizeHexColor(
        settings.popupTextColor,
        DEFAULT_POPUP_TEXT_COLOR,
      ),
      evaluationMomentTemplates: normalizeEvaluationMomentTemplates(
        settings.evaluationMomentTemplates,
      ),
      percentageRanges: normalizePercentageRanges(settings.percentageRanges),
      academicPeriodType:
        settings.academicPeriodType === 'semestres' || settings.academicPeriodType === 'trimestres'
          ? settings.academicPeriodType
          : runtime.academicPeriodType,
      semesterPeriods:
        Array.isArray(settings.semesterPeriods) && settings.semesterPeriods.length === 2
          ? settings.semesterPeriods as AcademicPeriod[]
          : runtime.semesterPeriods,
      trimesterPeriods:
        Array.isArray(settings.trimesterPeriods) && settings.trimesterPeriods.length === 3
          ? settings.trimesterPeriods as AcademicPeriod[]
          : runtime.trimesterPeriods,
    }
  }

function applyAppSettings(settings: NormalizedAppSettings) {
    runtime.setInactiveLogoutMinutes(settings.inactiveLogoutMinutes)
    runtime.setMessageTimeoutSeconds(settings.messageTimeoutSeconds)
    runtime.setPopupBackgroundColor(settings.popupBackgroundColor)
    runtime.setPopupTextColor(settings.popupTextColor)
    runtime.setEvaluationMomentTemplates(settings.evaluationMomentTemplates)
    runtime.setPercentageRanges(settings.percentageRanges)
    runtime.setAcademicPeriodType(settings.academicPeriodType)
    runtime.setSemesterPeriods(settings.semesterPeriods)
    runtime.setTrimesterPeriods(settings.trimesterPeriods)
  }

function getAppSettingsFingerprint(settings: NormalizedAppSettings) {
    return JSON.stringify(settings)
  }

function getCurrentAppSettings(): NormalizedAppSettings {
    return {
      inactiveLogoutMinutes: runtime.inactiveLogoutMinutes,
      messageTimeoutSeconds: runtime.messageTimeoutSeconds,
      popupBackgroundColor: runtime.popupBackgroundColor,
      popupTextColor: runtime.popupTextColor,
      evaluationMomentTemplates: runtime.evaluationMomentTemplates,
      percentageRanges: runtime.percentageRanges,
      academicPeriodType: runtime.academicPeriodType,
      semesterPeriods: runtime.semesterPeriods,
      trimesterPeriods: runtime.trimesterPeriods,
    }
  }

function hasUnsavedAppSettingsChanges() {
    return runtime.savedAppSettingsFingerprint !== null
      && runtime.savedAppSettingsFingerprint !== getAppSettingsFingerprint(getCurrentAppSettings())
  }

function addEvaluationMomentTemplate() {
    const templateId = globalThis.crypto?.randomUUID?.()
      ?? `evaluation-template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    runtime.setEvaluationMomentTemplates((currentTemplates) => [
      ...currentTemplates,
      {
        id: templateId,
        type: '',
        weightPercentage: 0,
      },
    ])
  }

function updateEvaluationMomentTemplate(
    templateId: string,
    field: 'type' | 'weightPercentage',
    value: string,
  ) {
    runtime.setEvaluationMomentTemplates((currentTemplates) =>
      currentTemplates.map((template) =>
        template.id === templateId
          ? {
              ...template,
              [field]: field === 'weightPercentage'
                ? Math.min(100, normalizeNonNegativeInteger(value, template.weightPercentage))
                : value,
            }
          : template,
      ),
    )
  }

function removeEvaluationMomentTemplate(templateId: string) {
    runtime.setEvaluationMomentTemplates((currentTemplates) =>
      currentTemplates.filter((template) => template.id !== templateId),
    )
  }

function updatePercentageRange(
    rangeId: string,
    field: 'min' | 'max' | 'backgroundColor' | 'textColor',
    value: string,
  ) {
    runtime.setPercentageRanges((currentRanges) =>
      currentRanges.map((range) =>
        range.id === rangeId
          ? {
              ...range,
              [field]: field === 'min' || field === 'max'
                ? normalizeNonNegativeInteger(value, field === 'min' ? range.min : range.max)
                : value,
            }
          : range,
      ),
    )
  }

function updatePeriodDate(
    type: 'semestres' | 'trimestres',
    periodId: string,
    field: 'startDate' | 'endDate',
    value: string,
  ) {
    const setter = type === 'semestres' ? runtime.setSemesterPeriods : runtime.setTrimesterPeriods
    setter((current) =>
      current.map((p) => (p.id === periodId ? { ...p, [field]: value } : p)),
    )
  }

function openSettingsDashboard() {
    if (runtime.activeDashboard !== 'settings') {
      previousDashboardRef.current = runtime.activeDashboard
    }

    runtime.setActiveDashboard('settings')
  }

function openSettingsDashboardWithAssessmentGuard() {
    if (runtime.activeDashboard === 'students' && runtime.activeStudentsMenuOption === 3 && !runtime.canLeaveAssessmentMoment()) {
      return
    }

    openSettingsDashboard()
  }

function closeSettingsDashboard() {
    runtime.setIsSettingsConfirmationOpen(false)
    runtime.setActiveDashboard(previousDashboardRef.current)
  }

function handleSettingsAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (hasUnsavedAppSettingsChanges()) {
      runtime.setIsSettingsConfirmationOpen(true)
      return
    }

    closeSettingsDashboard()
  }

async function saveAndCloseSettings() {
    if (await saveAppSettings()) {
      closeSettingsDashboard()
    }
  }

function discardAndCloseSettings() {
    const savedSettings = getSavedAppSettings()

    if (savedSettings) {
      applyAppSettings(savedSettings)
    }

    runtime.setClassesError(null)
    closeSettingsDashboard()
  }

function cancelSettingsClose() {
    runtime.setIsSettingsConfirmationOpen(false)
  }

function getSavedAppSettings(): NormalizedAppSettings | null {
    if (!runtime.savedAppSettingsFingerprint) {
      return null
    }

    try {
      return normalizeAppSettings(JSON.parse(runtime.savedAppSettingsFingerprint) as AppSettings)
    } catch {
      return null
    }
  }

function getStudentMomentPercentage(student: SchoolDocument, moment: SchoolDocument) {
    return `${getStudentMomentPercentageValue(student, moment).toFixed(1)}%`
  }

function getStudentMomentPercentageValue(student: SchoolDocument, moment: SchoolDocument) {
    const momentMaxValue = runtime.getEvaluationMomentMaxValue(moment)
    if (!momentMaxValue) {
      return 0
    }

    return (runtime.getStudentMomentTotal(student, moment) / momentMaxValue) * 100
  }

function getStudentMomentPercentageStyle(student: SchoolDocument, moment: SchoolDocument) {
    const percentage = getStudentMomentPercentageValue(student, moment)
    const matchingRange =
      runtime.percentageRanges.find((range) => percentage >= range.min && percentage <= range.max) ??
      runtime.percentageRanges[runtime.percentageRanges.length - 1] ??
      DEFAULT_PERCENTAGE_RANGES[0]

    return {
      backgroundColor: matchingRange.backgroundColor,
      color: matchingRange.textColor,
    }
  }

  return {
    loadAppSettings,
    saveAppSettings,
    hasUnsavedAppSettingsChanges,
    handleSettingsAction,
    saveAndCloseSettings,
    discardAndCloseSettings,
    cancelSettingsClose,
    addEvaluationMomentTemplate,
    updateEvaluationMomentTemplate,
    removeEvaluationMomentTemplate,
    updatePercentageRange,
    updatePeriodDate,
    openSettingsDashboard,
    openSettingsDashboardWithAssessmentGuard,
    closeSettingsDashboard,
    getStudentMomentPercentage,
    getStudentMomentPercentageValue,
    getStudentMomentPercentageStyle,
  }
}

type NormalizedAppSettings = {
  inactiveLogoutMinutes: number
  messageTimeoutSeconds: number
  popupBackgroundColor: string
  popupTextColor: string
  evaluationMomentTemplates: EvaluationMomentTemplate[]
  percentageRanges: AppSettings['percentageRanges']
  academicPeriodType: AcademicPeriodType
  semesterPeriods: AcademicPeriod[]
  trimesterPeriods: AcademicPeriod[]
}

function normalizeHexColor(value: unknown, fallback: string) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
    ? value.toLowerCase()
    : fallback
}

function normalizeEvaluationMomentTemplates(value: unknown): EvaluationMomentTemplate[] {
  if (!Array.isArray(value)) {
    return DEFAULT_EVALUATION_MOMENT_TEMPLATES
  }

  return value.flatMap((template, templateIndex) => {
    if (!template || typeof template !== 'object' || Array.isArray(template)) {
      return []
    }

    const record = template as Record<string, unknown>
    const type = typeof record.type === 'string' ? record.type.trim() : ''
    const weightPercentage = Number(record.weightPercentage)

    if (!type || !Number.isFinite(weightPercentage)) {
      return []
    }

    return [{
      id: typeof record.id === 'string' && record.id
        ? record.id
        : `evaluation-template-${templateIndex + 1}`,
      type,
      weightPercentage: Math.min(100, Math.max(0, Math.round(weightPercentage))),
    }]
  })
}
