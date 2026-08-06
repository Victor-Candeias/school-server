import { schoolApi } from '../api/school'
import { useRef } from 'react'
import type { FormEvent } from 'react'
import type { AppSettings } from '../api/school'
import type { SchoolDocument } from '../api/school'
import type { AcademicPeriod } from '../types'
import type { AcademicPeriodType } from '../types'
import type { AttitudeTemplate } from '../types'
import type { DashboardSection } from '../types'
import type { EvaluationMomentTemplate } from '../types'
import { DEFAULT_ATTITUDE_TEMPLATES } from '../utils/constants'
import { DEFAULT_EVALUATION_MOMENT_TEMPLATES } from '../utils/constants'
import { getDefaultEvaluationMomentTemplateColors } from '../utils/constants'
import { DEFAULT_ERROR_POPUP_BACKGROUND_COLOR } from '../utils/constants'
import { DEFAULT_ERROR_POPUP_TEXT_COLOR } from '../utils/constants'
import { DEFAULT_INACTIVITY_LOGOUT_MINUTES } from '../utils/constants'
import { DEFAULT_MESSAGE_TIMEOUT_SECONDS } from '../utils/constants'
import { DEFAULT_POPUP_BACKGROUND_COLOR } from '../utils/constants'
import { DEFAULT_POPUP_TEXT_COLOR } from '../utils/constants'
import { DEFAULT_PERCENTAGE_RANGES } from '../utils/constants'
import { normalizeNonNegativeInteger } from '../utils/validation'
import { normalizeDecimalInput } from '../utils/validation'
import { normalizePercentageRanges } from '../utils/validation'
import { normalizePositiveInteger } from '../utils/validation'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'

export function useAppSettings(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'loadAppSettings' | 'saveAppSettings' | 'hasUnsavedAppSettingsChanges' | 'handleSettingsAction' | 'saveAndCloseSettings' | 'discardAndCloseSettings' | 'cancelSettingsClose' | 'addEvaluationMomentTemplate' | 'updateEvaluationMomentTemplate' | 'removeEvaluationMomentTemplate' | 'addAttitudeTemplate' | 'updateAttitudeTemplate' | 'removeAttitudeTemplate' | 'updatePercentageRange' | 'updatePeriodDate' | 'openSettingsDashboard' | 'openSettingsDashboardWithAssessmentGuard' | 'closeSettingsDashboard' | 'getStudentMomentPercentage' | 'getStudentMomentPercentageValue' | 'getStudentMomentPercentageStyle'> {
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
        errorPopupBackgroundColor: runtime.errorPopupBackgroundColor,
        errorPopupTextColor: runtime.errorPopupTextColor,
        evaluationMomentTemplates: runtime.evaluationMomentTemplates,
        attitudeTemplates: runtime.attitudeTemplates,
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
      errorPopupBackgroundColor: normalizeHexColor(
        settings.errorPopupBackgroundColor,
        DEFAULT_ERROR_POPUP_BACKGROUND_COLOR,
      ),
      errorPopupTextColor: normalizeHexColor(
        settings.errorPopupTextColor,
        DEFAULT_ERROR_POPUP_TEXT_COLOR,
      ),
      evaluationMomentTemplates: normalizeEvaluationMomentTemplates(
        settings.evaluationMomentTemplates,
      ),
      attitudeTemplates: normalizeAttitudeTemplates(settings.attitudeTemplates),
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
    runtime.setErrorPopupBackgroundColor(settings.errorPopupBackgroundColor)
    runtime.setErrorPopupTextColor(settings.errorPopupTextColor)
    runtime.setEvaluationMomentTemplates(settings.evaluationMomentTemplates)
    runtime.setAttitudeTemplates(settings.attitudeTemplates)
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
      errorPopupBackgroundColor: runtime.errorPopupBackgroundColor,
      errorPopupTextColor: runtime.errorPopupTextColor,
      evaluationMomentTemplates: runtime.evaluationMomentTemplates,
      attitudeTemplates: runtime.attitudeTemplates,
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
        ...getDefaultEvaluationMomentTemplateColors(currentTemplates.length),
      },
    ])
  }

function updateEvaluationMomentTemplate(
    templateId: string,
    field: 'type' | 'weightPercentage' | 'backgroundColor' | 'averageBackgroundColor' | 'weightedBackgroundColor' | 'textColor',
    value: string,
  ) {
    runtime.setEvaluationMomentTemplates((currentTemplates) =>
      currentTemplates.map((template) =>
        template.id === templateId
          ? {
              ...template,
              [field]: field === 'weightPercentage'
                ? normalizeWeightPercentage(value, template.weightPercentage)
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

function addAttitudeTemplate() {
    const templateId = globalThis.crypto?.randomUUID?.()
      ?? `attitude-template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    runtime.setAttitudeTemplates((currentTemplates) => {
      const defaultColors = getDefaultEvaluationMomentTemplateColors(currentTemplates.length)

      return [
        ...currentTemplates,
        {
          id: templateId,
          text: '',
          alias: '',
          weightPercentage: 0,
          backgroundColor: defaultColors.backgroundColor,
          weightedBackgroundColor: defaultColors.weightedBackgroundColor,
          textColor: defaultColors.textColor,
        },
      ]
    })
  }

function updateAttitudeTemplate(
    templateId: string,
    field: 'text' | 'alias' | 'weightPercentage' | 'backgroundColor' | 'weightedBackgroundColor' | 'textColor',
    value: string,
  ) {
    runtime.setAttitudeTemplates((currentTemplates) =>
      currentTemplates.map((template) =>
        template.id === templateId
          ? {
              ...template,
              [field]: field === 'weightPercentage'
                ? normalizeWeightPercentage(value, template.weightPercentage)
                : value,
            }
          : template,
      ),
    )
  }

function removeAttitudeTemplate(templateId: string) {
    runtime.setAttitudeTemplates((currentTemplates) =>
      currentTemplates.filter((template) => template.id !== templateId),
    )
  }

function updatePercentageRange(
    rangeId: string,
    field: 'min' | 'max' | 'nota' | 'backgroundColor' | 'textColor',
    value: string,
  ) {
    runtime.setPercentageRanges((currentRanges) =>
      currentRanges.map((range) =>
        range.id === rangeId
          ? {
              ...range,
              [field]: field === 'min' || field === 'max' || field === 'nota'
                ? normalizeNonNegativeInteger(value, field === 'min' ? range.min : field === 'max' ? range.max : range.nota)
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
    const processedPercentage = runtime.getStudentMomentProcessedPercentageValue(student, moment)
    if (processedPercentage !== null) {
      return processedPercentage
    }

    return 0
  }

function getStudentMomentPercentageStyle(student: SchoolDocument, moment: SchoolDocument) {
    const momentId = runtime.getDocumentId(moment)
    const studentId = runtime.getDocumentId(student)
    const processedValue = runtime.allStudentMomentValues.find(
      (value) =>
        value.momentId === momentId &&
        value.studentId === studentId &&
        typeof value.studentMomentBackgroundColor === 'string' &&
        typeof value.studentMomentTextColor === 'string',
    )

    if (processedValue) {
      return {
        backgroundColor: runtime.getStringValue(processedValue.studentMomentBackgroundColor),
        color: runtime.getStringValue(processedValue.studentMomentTextColor),
      }
    }

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
    addAttitudeTemplate,
    updateAttitudeTemplate,
    removeAttitudeTemplate,
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
  errorPopupBackgroundColor: string
  errorPopupTextColor: string
  evaluationMomentTemplates: EvaluationMomentTemplate[]
  attitudeTemplates: AttitudeTemplate[]
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
    const weightPercentage = parseWeightPercentage(record.weightPercentage)
    const defaultColors = getDefaultEvaluationMomentTemplateColors(templateIndex)

    if (!type || !Number.isFinite(weightPercentage)) {
      return []
    }

    return [{
      id: typeof record.id === 'string' && record.id
        ? record.id
        : `evaluation-template-${templateIndex + 1}`,
      type,
      weightPercentage: weightPercentage ?? 0,
      backgroundColor: normalizeHexColor(record.backgroundColor, defaultColors.backgroundColor),
      averageBackgroundColor: normalizeHexColor(
        record.averageBackgroundColor,
        defaultColors.averageBackgroundColor,
      ),
      weightedBackgroundColor: normalizeHexColor(
        record.weightedBackgroundColor,
        defaultColors.weightedBackgroundColor,
      ),
      textColor: normalizeHexColor(record.textColor, defaultColors.textColor),
    }]
  })
}

function normalizeAttitudeTemplates(value: unknown): AttitudeTemplate[] {
  if (!Array.isArray(value)) {
    return DEFAULT_ATTITUDE_TEMPLATES
  }

  return value.flatMap((template, templateIndex) => {
    if (!template || typeof template !== 'object' || Array.isArray(template)) {
      return []
    }

    const record = template as Record<string, unknown>
    const text = typeof record.text === 'string' ? record.text.trim() : ''
    const alias = typeof record.alias === 'string' ? record.alias.trim() : ''
    const weightPercentage = parseWeightPercentage(record.weightPercentage)
    const defaultColors = getDefaultEvaluationMomentTemplateColors(templateIndex)

    if (!text || !alias || !Number.isFinite(weightPercentage)) {
      return []
    }

    return [{
      id: typeof record.id === 'string' && record.id
        ? record.id
        : `attitude-template-${templateIndex + 1}`,
      text,
      alias,
      weightPercentage: weightPercentage ?? 0,
      backgroundColor: normalizeHexColor(record.backgroundColor, defaultColors.backgroundColor),
      weightedBackgroundColor: normalizeHexColor(
        record.weightedBackgroundColor,
        defaultColors.weightedBackgroundColor,
      ),
      textColor: normalizeHexColor(record.textColor, defaultColors.textColor),
    }]
  })
}

function parseWeightPercentage(value: unknown) {
  if (typeof value === 'boolean') {
    return null
  }

  const normalizedValue = typeof value === 'string'
    ? normalizeDecimalInput(value, 2)
    : String(value)
  const numericValue = Number(normalizedValue)

  if (!Number.isFinite(numericValue)) {
    return null
  }

  return Number(Math.min(100, Math.max(0, numericValue)).toFixed(2))
}

function normalizeWeightPercentage(value: string, fallback: number) {
  return parseWeightPercentage(value) ?? fallback
}
