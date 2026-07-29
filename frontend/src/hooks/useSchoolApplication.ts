import { useEffect, useRef } from 'react'
import { authApi } from '../api/auth'

import { useApplicationState } from './useApplicationState'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'
import { useSchools } from './useSchools'
import { useAppSettings } from './useAppSettings'
import { useAcademicYears } from './useAcademicYears'
import { useClasses } from './useClasses'
import { useStudents } from './useStudents'
import { useStudentCalendar } from './useStudentCalendar'
import { useEvaluations } from './useEvaluations'
import { useAuth } from './useAuth'
import {
  CALENDAR_WORK_WEEKDAY_COUNT,
  DEFAULT_INACTIVITY_LOGOUT_MINUTES, DEFAULT_MESSAGE_TIMEOUT_SECONDS,
  INACTIVITY_EVENTS, STUDENTS_MENU_OPTIONS,
} from '../utils/constants'
import { normalizePositiveInteger } from '../utils/validation'
import {
  getCalendarDateTime, getStudentCalendarDayLabel, getStudentCalendarMonthLabel,
} from '../utils/calendar'
import { loadNavigationState } from '../utils/navigationPersistence'

export type { AcademicPeriodType } from '../types'

export function useSchoolApplication() {
  const state = useApplicationState()
  const {
    darkMode,
    user,
    setSchools,
    setAcademicYears,
    setAllAcademicYears,
    setAllClasses,
    setAllStudents,
    setAllEvaluationMoments,
    setAllStudentMomentValues,
    setStudentCalendarTasks,
    schools,
    allAcademicYears,
    allClasses,
    activeDashboard,
    selectedSchool,
    inactiveLogoutMinutes,
    setUser,
    setPassword,
    setConfirmPassword,
    setSelectedSchool,
    setSelectedAcademicYearDocument,
    setSelectedClass,
    setActiveStudentsMenuOption,
    setActiveDashboard,
    setMessage,
    message,
    messageTimeoutSeconds,
    popupBackgroundColor,
    popupTextColor,
  } = state
  const runtime = state as ApplicationRuntime
  const useSchoolsActions = useSchools(runtime)
  const useAppSettingsActions = useAppSettings(runtime)
  const useAcademicYearsActions = useAcademicYears(runtime)
  const useClassesActions = useClasses(runtime)
  const useStudentsActions = useStudents(runtime)
  const useStudentCalendarActions = useStudentCalendar(runtime)
  const useEvaluationsActions = useEvaluations(runtime)
  const useAuthActions = useAuth(runtime)
  const actions = Object.assign(
    {},
    useSchoolsActions,
    useAppSettingsActions,
    useAcademicYearsActions,
    useClassesActions,
    useStudentsActions,
    useStudentCalendarActions,
    useEvaluationsActions,
    useAuthActions,
  ) as ApplicationActions
  Object.assign(runtime, actions)
  const actionsRef = useRef(actions)
  actionsRef.current = actions
  const restoredNavigationUserRef = useRef<string | null>(null)

  const selectedStudentCalendarTasks = state.selectedStudentCalendarDay
    ? actions.getStudentCalendarTasksForDate(state.selectedStudentCalendarDay.date)
    : []
  runtime.selectedStudentCalendarTasks = selectedStudentCalendarTasks

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    document.documentElement.style.setProperty('--popup-background-color', popupBackgroundColor)
    document.documentElement.style.setProperty('--popup-text-color', popupTextColor)
  }, [popupBackgroundColor, popupTextColor])

  useEffect(() => {
    if (!user) {
      restoredNavigationUserRef.current = null
      setSchools([])
      setAcademicYears([])
      setAllAcademicYears([])
      setAllClasses([])
      setAllStudents([])
      setAllEvaluationMoments([])
      setAllStudentMomentValues([])
      setStudentCalendarTasks([])
      return
    }

    void actionsRef.current.loadSchools()
    void actionsRef.current.loadAllAcademicYears()
    void actionsRef.current.loadAllClasses()
    void actionsRef.current.loadAllStudents()
    void actionsRef.current.loadAllEvaluationMoments()
    void actionsRef.current.loadAllStudentMomentValues()
    void actionsRef.current.loadAppSettings()
  }, [
    user,
    setSchools,
    setAcademicYears,
    setAllAcademicYears,
    setAllClasses,
    setAllStudents,
    setAllEvaluationMoments,
    setAllStudentMomentValues,
    setStudentCalendarTasks,
  ])

  useEffect(() => {
    const userId = user?.userId

    if (!userId || restoredNavigationUserRef.current === userId) {
      return
    }

    const navigation = loadNavigationState(userId)

    if (!navigation) {
      restoredNavigationUserRef.current = userId
      return
    }

    setActiveStudentsMenuOption(navigation.activeStudentsMenuOption)

    if (navigation.activeDashboard === 'schools' || navigation.activeDashboard === 'settings') {
      setActiveDashboard(navigation.activeDashboard)
      restoredNavigationUserRef.current = userId
      return
    }

    if (!navigation.schoolId) {
      restoredNavigationUserRef.current = userId
      return
    }

    const restoredSchool = schools.find(
      (school) => actionsRef.current.getDocumentId(school) === navigation.schoolId,
    )

    if (!restoredSchool) {
      return
    }

    setSelectedSchool(restoredSchool)

    if (navigation.activeDashboard === 'years') {
      setActiveDashboard('years')
      restoredNavigationUserRef.current = userId
      return
    }

    if (!navigation.academicYearId) {
      restoredNavigationUserRef.current = userId
      return
    }

    const restoredAcademicYear = allAcademicYears.find(
      (year) => actionsRef.current.getDocumentId(year) === navigation.academicYearId,
    )

    if (!restoredAcademicYear) {
      return
    }

    setSelectedAcademicYearDocument(restoredAcademicYear)

    if (navigation.activeDashboard === 'classes') {
      setActiveDashboard('classes')
      restoredNavigationUserRef.current = userId
      return
    }

    if (!navigation.classId) {
      restoredNavigationUserRef.current = userId
      return
    }

    const restoredClass = allClasses.find(
      (schoolClass) => actionsRef.current.getDocumentId(schoolClass) === navigation.classId,
    )

    if (!restoredClass) {
      return
    }

    setSelectedClass(restoredClass)
    setActiveDashboard('students')
    restoredNavigationUserRef.current = userId
    void actionsRef.current.loadStudentCalendarTasks(restoredClass)
  }, [
    user,
    schools,
    allAcademicYears,
    allClasses,
    setSelectedSchool,
    setSelectedAcademicYearDocument,
    setSelectedClass,
    setActiveStudentsMenuOption,
    setActiveDashboard,
  ])

  useEffect(() => {
    if (activeDashboard !== 'years' || !selectedSchool) {
      setAcademicYears([])
      return
    }

    void actionsRef.current.loadAcademicYears(selectedSchool)
  }, [activeDashboard, selectedSchool, setAcademicYears])

  useEffect(() => {
    if (!user) {
      return
    }

    let timeoutId = window.setTimeout(logoutByInactivity, inactiveLogoutMinutes * 60 * 1000)

    function resetTimer() {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(logoutByInactivity, inactiveLogoutMinutes * 60 * 1000)
    }

    async function logoutByInactivity() {
      actionsRef.current.persistCurrentNavigation()

      try {
        await authApi.logout()
      } finally {
        setUser(null)
        setPassword('')
        setConfirmPassword('')
        setSelectedSchool(null)
        setAcademicYears([])
        setAllAcademicYears([])
        setAllClasses([])
        setAllStudents([])
        setAllEvaluationMoments([])
        setAllStudentMomentValues([])
        setStudentCalendarTasks([])
        setSelectedAcademicYearDocument(null)
        setSelectedClass(null)
        setActiveDashboard('schools')
        setMessage('Sessão terminada por inatividade.')
      }
    }

    INACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true })
    })

    return () => {
      window.clearTimeout(timeoutId)
      INACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer)
      })
    }
  }, [
    inactiveLogoutMinutes,
    user,
    setUser,
    setPassword,
    setConfirmPassword,
    setSelectedSchool,
    setAcademicYears,
    setAllAcademicYears,
    setAllClasses,
    setAllStudents,
    setAllEvaluationMoments,
    setAllStudentMomentValues,
    setStudentCalendarTasks,
    setSelectedAcademicYearDocument,
    setSelectedClass,
    setActiveDashboard,
    setMessage,
  ])

  useEffect(() => {
    if (!message) {
      return
    }

    const timeoutId = window.setTimeout(() => setMessage(null), messageTimeoutSeconds * 1000)
    return () => window.clearTimeout(timeoutId)
  }, [message, messageTimeoutSeconds, setMessage])

  const CHART_PALETTE = [
    '#2563eb', '#c0392b', '#16a34a', '#d97706', '#7c3aed',
    '#0891b2', '#db2777', '#65a30d', '#ea580c', '#6d28d9',
  ]

  const canReturnToSchools = (
    activeDashboard === 'years'
    || activeDashboard === 'classes'
    || activeDashboard === 'students'
  )
  const canReturnToYears = activeDashboard === 'classes' || activeDashboard === 'students'
  const canReturnToClasses = activeDashboard === 'students'


  return {
    ...state,
    ...actions,
    selectedStudentCalendarTasks,
    CHART_PALETTE,
    canReturnToSchools,
    canReturnToYears,
    canReturnToClasses,
    normalizePositiveInteger,
    DEFAULT_INACTIVITY_LOGOUT_MINUTES,
    DEFAULT_MESSAGE_TIMEOUT_SECONDS,
    STUDENTS_MENU_OPTIONS,
    CALENDAR_WORK_WEEKDAY_COUNT,
    getStudentCalendarMonthLabel,
    getStudentCalendarDayLabel,
    getCalendarDateTime,
  }
}

export type SchoolApplicationModel = ReturnType<typeof useSchoolApplication>
