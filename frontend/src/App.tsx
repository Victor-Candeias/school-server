import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart, Bar, Cell, LabelList,
  LineChart, Line,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { authApi } from './api/auth'
import { schoolApi } from './api/school'
import type { LoginResponse } from './api/auth'
import type { PercentageRange, SchoolDocument } from './api/school'
import type { FormEvent } from 'react'
import './App.css'

const DEFAULT_INACTIVITY_LOGOUT_MINUTES = 15
const DEFAULT_MESSAGE_TIMEOUT_SECONDS = 5
const DEFAULT_REGISTER_ROLE = 'user'
const INACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const
const DEFAULT_PERCENTAGE_RANGES: PercentageRange[] = [
  { id: 'very-low', min: 0, max: 10, backgroundColor: '#dc2626', textColor: '#ffffff' },
  { id: 'low', min: 11, max: 39, backgroundColor: '#fdba74', textColor: '#7c2d12' },
  { id: 'mid-low', min: 40, max: 49, backgroundColor: '#fde68a', textColor: '#713f12' },
  { id: 'mid', min: 50, max: 69, backgroundColor: '#bbf7d0', textColor: '#14532d' },
  { id: 'high', min: 70, max: 85, backgroundColor: '#15803d', textColor: '#ffffff' },
  { id: 'very-high', min: 86, max: 100, backgroundColor: '#ddd6fe', textColor: '#4c1d95' },
]

type SchoolForm = {
  schoolId: string
  name: string
  group: string
  address: string
  postalCode: string
  locality: string
  phone1: string
  phone2: string
  phone3: string
  directorName: string
  directorContacts: string
}

type StudentForm = {
  id: number
  name: string
  schoolNumber: string
  schoolEmail: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  active: boolean
}

type EvaluationMomentForm = {
  name: string
  type: 'teste' | 'questao-aula'
  semester: '1' | '2'
  totalValue: 20 | 100
  questions: EvaluationQuestionForm[]
}

type EvaluationQuestionForm = {
  questionNumber: string
  value: string
}

type StudentCalendarTaskForm = {
  title: string
  description: string
  startTime: string
  endTime: string
}

type ClassForm = {
  classYear: string
  classLetter: string
  directorName: string
  students: StudentForm[]
}

type DashboardSection = 'schools' | 'years' | 'classes' | 'students' | 'settings'
type StudentsMenuOption = 0 | 1 | 2 | 3 | 4 | 5
type ChartType = 'bar' | 'line' | 'area' | 'radar'
type StudentCalendarWeekMode = 'work' | 'full'
type AcademicPeriodType = 'semestres' | 'trimestres'

type AcademicPeriod = {
  id: string
  label: string
  startDate: string
  endDate: string
}

const DEFAULT_ACADEMIC_PERIOD_TYPE: AcademicPeriodType = 'semestres'

function buildDefaultSemesterPeriods(): AcademicPeriod[] {
  const y = new Date().getFullYear()
  const y1 = y + 1
  return [
    { id: 'sem1', label: '1.º Semestre', startDate: `${y}-09-01`, endDate: `${y1}-02-15` },
    { id: 'sem2', label: '2.º Semestre', startDate: `${y1}-01-02`, endDate: `${y1}-06-15` },
  ]
}

function buildDefaultTrimesterPeriods(): AcademicPeriod[] {
  const y = new Date().getFullYear()
  const y1 = y + 1
  return [
    { id: 'trim1', label: '1.º Trimestre', startDate: `${y}-09-01`,  endDate: `${y}-12-15`  },
    { id: 'trim2', label: '2.º Trimestre', startDate: `${y1}-01-02`, endDate: `${y1}-03-15` },
    { id: 'trim3', label: '3.º Trimestre', startDate: `${y1}-04-01`, endDate: `${y1}-06-15` },
  ]
}

type AcademicYearOption = {
  value: string
  label: string
  startYear: number
  endYear: number
}

type StudentCalendarDay = {
  date: Date
  day: number
  isCurrentMonth: boolean
  isWeekend: boolean
  isToday: boolean
  key: string
}

const STUDENTS_MENU_OPTIONS: { id: StudentsMenuOption; label: string }[] = [
  { id: 0, label: 'Calendário' },
  { id: 1, label: 'Alunos' },
  { id: 2, label: 'Momento de Avaliação' },
  { id: 3, label: 'Alunos/M.Avaliação' },
  { id: 4, label: 'Avaliações' },
  { id: 5, label: 'Gráficos' },
]

const CALENDAR_WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const CALENDAR_WORK_WEEKDAY_COUNT = 5

const EMPTY_SCHOOL_FORM: SchoolForm = {
  schoolId: '',
  name: '',
  group: '',
  address: '',
  postalCode: '',
  locality: '',
  phone1: '',
  phone2: '',
  phone3: '',
  directorName: '',
  directorContacts: '',
}

const EMPTY_CLASS_FORM: ClassForm = {
  classYear: '',
  classLetter: '',
  directorName: '',
  students: [],
}

const EMPTY_STUDENT_FORM: StudentForm = {
  id: 1,
  name: '',
  schoolNumber: '',
  schoolEmail: '',
  guardianName: '',
  guardianPhone: '',
  guardianEmail: '',
  active: true,
}

const EMPTY_EVALUATION_MOMENT_FORM: EvaluationMomentForm = {
  name: '',
  type: 'teste',
  semester: '1',
  totalValue: 20,
  questions: [],
}

const EMPTY_EVALUATION_QUESTION_FORM: EvaluationQuestionForm = {
  questionNumber: '',
  value: '',
}

const EMPTY_STUDENT_CALENDAR_TASK_FORM: StudentCalendarTaskForm = {
  title: '',
  description: '',
  startTime: '08:00',
  endTime: '09:00',
}

type PasswordStrength = {
  label: string
  level: 'empty' | 'weak' | 'medium' | 'strong'
  score: number
}

function getPasswordStrength(value: string): PasswordStrength {
  if (!value) {
    return { label: 'Introduz uma password', level: 'empty', score: 0 }
  }

  const checks = [
    value.length >= 8,
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ]
  const score = checks.filter(Boolean).length

  if (score >= 5) {
    return { label: 'Password forte', level: 'strong', score }
  }

  if (score >= 3) {
    return { label: 'Password média', level: 'medium', score }
  }

  return { label: 'Password fraca', level: 'weak', score }
}

function getAcademicYearOptions(): AcademicYearOption[] {
  const currentYear = new Date().getFullYear()

  return Array.from({ length: 6 }, (_, index) => {
    const startYear = currentYear - index
    const endYear = startYear + 1
    const label = `${startYear}/${endYear}`

    return {
      value: label,
      label,
      startYear,
      endYear,
    }
  })
}

function formatPostalCode(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 7)

  if (digits.length <= 4) {
    return digits
  }

  return `${digits.slice(0, 4)}-${digits.slice(4)}`
}

function normalizePercentageRanges(value: unknown): PercentageRange[] {
  if (!Array.isArray(value)) {
    return DEFAULT_PERCENTAGE_RANGES
  }

  const normalizedRanges = value
    .map((range) => {
      if (!range || typeof range !== 'object') {
        return null
      }

      const rangeRecord = range as Record<string, unknown>
      const min = Number(rangeRecord.min)
      const max = Number(rangeRecord.max)
      const backgroundColor = rangeRecord.backgroundColor
      const textColor = rangeRecord.textColor

      if (
        !Number.isFinite(min) ||
        !Number.isFinite(max) ||
        typeof backgroundColor !== 'string' ||
        typeof textColor !== 'string'
      ) {
        return null
      }

      return {
        id: String(rangeRecord.id ?? `${min}-${max}`),
        min,
        max,
        backgroundColor,
        textColor,
      }
    })
    .filter((range): range is PercentageRange => Boolean(range))

  return normalizedRanges.length > 0 ? normalizedRanges : DEFAULT_PERCENTAGE_RANGES
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue > 0 ? Math.trunc(numericValue) : fallback
}

function normalizeNonNegativeInteger(value: unknown, fallback: number) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue >= 0 ? Math.trunc(numericValue) : fallback
}

function getCalendarDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function getCalendarDateTime(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isSameCalendarDay(leftDate: Date, rightDate: Date) {
  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  )
}

function getMondayFirstWeekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7
}

function isCalendarWeekend(date: Date) {
  return getMondayFirstWeekdayIndex(date) >= CALENDAR_WORK_WEEKDAY_COUNT
}

function getDefaultStudentCalendarWeekMode() {
  return isCalendarWeekend(new Date()) ? 'full' : 'work'
}

function getFirstVisibleMonthDay(year: number, month: number, showFullWeek: boolean) {
  const date = new Date(year, month, 1)

  while (!showFullWeek && getMondayFirstWeekdayIndex(date) >= CALENDAR_WORK_WEEKDAY_COUNT) {
    date.setDate(date.getDate() + 1)
  }

  return date
}

function getLastVisibleMonthDay(year: number, month: number, showFullWeek: boolean) {
  const date = new Date(year, month + 1, 0)

  while (!showFullWeek && getMondayFirstWeekdayIndex(date) >= CALENDAR_WORK_WEEKDAY_COUNT) {
    date.setDate(date.getDate() - 1)
  }

  return date
}

function getStudentCalendarDays(calendarDate: Date, showFullWeek: boolean): StudentCalendarDay[] {
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const visibleWeekdayCount = showFullWeek ? CALENDAR_WEEKDAYS.length : CALENDAR_WORK_WEEKDAY_COUNT
  const firstVisibleMonthDay = getFirstVisibleMonthDay(year, month, showFullWeek)
  const lastVisibleMonthDay = getLastVisibleMonthDay(year, month, showFullWeek)
  const startOffset = getMondayFirstWeekdayIndex(firstVisibleMonthDay)
  const endOffset = visibleWeekdayCount - 1 - getMondayFirstWeekdayIndex(lastVisibleMonthDay)
  const firstGridDay = new Date(year, month, firstVisibleMonthDay.getDate() - startOffset)
  const lastGridDay = new Date(year, month, lastVisibleMonthDay.getDate() + endOffset)
  const today = new Date()
  const calendarDays: StudentCalendarDay[] = []

  for (
    let weekStart = new Date(firstGridDay);
    weekStart <= lastGridDay;
    weekStart.setDate(weekStart.getDate() + 7)
  ) {
    for (let weekdayIndex = 0; weekdayIndex < visibleWeekdayCount; weekdayIndex += 1) {
      const date = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate() + weekdayIndex,
      )

      calendarDays.push({
        date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isWeekend: isCalendarWeekend(date),
        isToday: isSameCalendarDay(date, today),
        key: getCalendarDateKey(date),
      })
    }
  }

  return calendarDays
}

function getStudentCalendarMonthLabel(calendarDate: Date) {
  return new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(calendarDate)
}

function getStudentCalendarDayLabel(calendarDate: Date) {
  return new Intl.DateTimeFormat('pt-PT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(calendarDate)
}

function getCalendarTimeMinutes(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value)
  if (!match) {
    return null
  }

  return Number(match[1]) * 60 + Number(match[2])
}

function doCalendarTimesOverlap(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
) {
  const firstStartMinutes = getCalendarTimeMinutes(firstStart)
  const firstEndMinutes = getCalendarTimeMinutes(firstEnd)
  const secondStartMinutes = getCalendarTimeMinutes(secondStart)
  const secondEndMinutes = getCalendarTimeMinutes(secondEnd)

  if (
    firstStartMinutes === null ||
    firstEndMinutes === null ||
    secondStartMinutes === null ||
    secondEndMinutes === null
  ) {
    return false
  }

  return firstStartMinutes < secondEndMinutes && secondStartMinutes < firstEndMinutes
}

function formatCalendarTimeFromMinutes(value: number) {
  const clampedValue = Math.min(Math.max(value, 0), 23 * 60 + 59)
  const hours = Math.floor(clampedValue / 60)
  const minutes = clampedValue % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('darkMode') === 'true')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [user, setUser] = useState<LoginResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [schools, setSchools] = useState<SchoolDocument[]>([])
  const [schoolsError, setSchoolsError] = useState<string | null>(null)
  const [isLoadingSchools, setIsLoadingSchools] = useState(false)
  const [academicYears, setAcademicYears] = useState<SchoolDocument[]>([])
  const [allAcademicYears, setAllAcademicYears] = useState<SchoolDocument[]>([])
  const [allClasses, setAllClasses] = useState<SchoolDocument[]>([])
  const [allStudents, setAllStudents] = useState<SchoolDocument[]>([])
  const [allEvaluationMoments, setAllEvaluationMoments] = useState<SchoolDocument[]>([])
  const [allStudentMomentValues, setAllStudentMomentValues] = useState<SchoolDocument[]>([])
  const [studentCalendarTasks, setStudentCalendarTasks] = useState<SchoolDocument[]>([])
  const [yearsError, setYearsError] = useState<string | null>(null)
  const [isLoadingYears, setIsLoadingYears] = useState(false)
  const [classesError, setClassesError] = useState<string | null>(null)
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)
  const [isCreateYearModalOpen, setIsCreateYearModalOpen] = useState(false)
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false)
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [isEvaluationMomentModalOpen, setIsEvaluationMomentModalOpen] = useState(false)
  const [isEvaluationQuestionModalOpen, setIsEvaluationQuestionModalOpen] = useState(false)
  const [isCalendarTaskModalOpen, setIsCalendarTaskModalOpen] = useState(false)
  const [isCreatingCalendarTask, setIsCreatingCalendarTask] = useState(false)
  const [editingYearId, setEditingYearId] = useState<string | null>(null)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [editingEvaluationMomentId, setEditingEvaluationMomentId] = useState<string | null>(null)
  const [studentActionMenuId, setStudentActionMenuId] = useState<string | null>(null)
  const [activeStudentsMenuOption, setActiveStudentsMenuOption] = useState<StudentsMenuOption>(1)
  const [studentCalendarDate, setStudentCalendarDate] = useState(() => new Date())
  const [studentCalendarWeekMode, setStudentCalendarWeekMode] =
    useState<StudentCalendarWeekMode>(() => getDefaultStudentCalendarWeekMode())
  const [selectedStudentCalendarDay, setSelectedStudentCalendarDay] =
    useState<StudentCalendarDay | null>(null)
  const [newStudentCalendarTask, setNewStudentCalendarTask] =
    useState<StudentCalendarTaskForm>(EMPTY_STUDENT_CALENDAR_TASK_FORM)
  const [selectedGradingMomentId, setSelectedGradingMomentId] = useState('')
  const [selectedAssessmentsSemester, setSelectedAssessmentsSemester] = useState('')
  const [assessmentCellDrafts, setAssessmentCellDrafts] = useState<Record<string, string>>({})
  const [chartStudentId, setChartStudentId] = useState('')
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [chartMomentId, setChartMomentId] = useState('')
  const [selectedAcademicYearDocument, setSelectedAcademicYearDocument] =
    useState<SchoolDocument | null>(null)
  const academicYearOptions = getAcademicYearOptions()
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(academicYearOptions[0].value)
  const [newSchool, setNewSchool] = useState<SchoolForm>(EMPTY_SCHOOL_FORM)
  const [newClass, setNewClass] = useState<ClassForm>(EMPTY_CLASS_FORM)
  const [newStudent, setNewStudent] = useState<StudentForm>(EMPTY_STUDENT_FORM)
  const [newEvaluationMoment, setNewEvaluationMoment] =
    useState<EvaluationMomentForm>(EMPTY_EVALUATION_MOMENT_FORM)
  const [newEvaluationQuestion, setNewEvaluationQuestion] =
    useState<EvaluationQuestionForm>(EMPTY_EVALUATION_QUESTION_FORM)
  const [isCreateSchoolModalOpen, setIsCreateSchoolModalOpen] = useState(false)
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<SchoolDocument | null>(null)
  const [selectedClass, setSelectedClass] = useState<SchoolDocument | null>(null)
  const [activeDashboard, setActiveDashboard] = useState<DashboardSection>('schools')
  const [inactiveLogoutMinutes, setInactiveLogoutMinutes] = useState(
    DEFAULT_INACTIVITY_LOGOUT_MINUTES,
  )
  const [messageTimeoutSeconds, setMessageTimeoutSeconds] = useState(
    DEFAULT_MESSAGE_TIMEOUT_SECONDS,
  )
  const [percentageRanges, setPercentageRanges] = useState<PercentageRange[]>(
    DEFAULT_PERCENTAGE_RANGES,
  )
  const [academicPeriodType, setAcademicPeriodType] = useState<AcademicPeriodType>(
    DEFAULT_ACADEMIC_PERIOD_TYPE,
  )
  const [semesterPeriods, setSemesterPeriods] = useState<AcademicPeriod[]>(buildDefaultSemesterPeriods)
  const [trimesterPeriods, setTrimesterPeriods] = useState<AcademicPeriod[]>(buildDefaultTrimesterPeriods)
  const [yearPeriodType, setYearPeriodType] = useState<AcademicPeriodType>(DEFAULT_ACADEMIC_PERIOD_TYPE)
  const passwordStrength = getPasswordStrength(password)
  const isStudentCalendarFullWeek = studentCalendarWeekMode === 'full'
  const visibleStudentCalendarWeekdays = isStudentCalendarFullWeek
    ? CALENDAR_WEEKDAYS
    : CALENDAR_WEEKDAYS.slice(0, CALENDAR_WORK_WEEKDAY_COUNT)
  const studentCalendarDays = getStudentCalendarDays(studentCalendarDate, isStudentCalendarFullWeek)
  const selectedStudentCalendarTasks = selectedStudentCalendarDay
    ? getStudentCalendarTasksForDate(selectedStudentCalendarDay.date)
    : []

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    if (!user) {
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

    void loadSchools()
    void loadAllAcademicYears()
    void loadAllClasses()
    void loadAllStudents()
    void loadAllEvaluationMoments()
    void loadAllStudentMomentValues()
    void loadAppSettings()
  }, [user])

  useEffect(() => {
    if (activeDashboard !== 'years' || !selectedSchool) {
      setAcademicYears([])
      return
    }

    void loadAcademicYears(selectedSchool)
  }, [activeDashboard, selectedSchool])

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
  }, [inactiveLogoutMinutes, user])

  useEffect(() => {
    if (!message) {
      return
    }

    const timeoutId = window.setTimeout(() => setMessage(null), messageTimeoutSeconds * 1000)
    return () => window.clearTimeout(timeoutId)
  }, [message, messageTimeoutSeconds])

  async function loadSchools() {
    setIsLoadingSchools(true)
    setSchoolsError(null)

    try {
      const existingSchools = await schoolApi.findSchools({ userId: getLoggedUserId() })
      setSchools(existingSchools)
    } catch (schoolError) {
      const errorMessage =
        schoolError instanceof Error ? schoolError.message : 'Erro ao carregar escolas.'

      setSchools([])
      setSchoolsError(errorMessage.includes('HTTP 400') ? null : errorMessage)
    } finally {
      setIsLoadingSchools(false)
    }
  }

  async function loadAppSettings() {
    try {
      const settings = await schoolApi.getAppSettings()
      setInactiveLogoutMinutes(
        normalizePositiveInteger(settings.inactiveLogoutMinutes, DEFAULT_INACTIVITY_LOGOUT_MINUTES),
      )
      setMessageTimeoutSeconds(
        normalizePositiveInteger(settings.messageTimeoutSeconds, DEFAULT_MESSAGE_TIMEOUT_SECONDS),
      )
      setPercentageRanges(normalizePercentageRanges(settings.percentageRanges))
      if (settings.academicPeriodType === 'semestres' || settings.academicPeriodType === 'trimestres') {
        setAcademicPeriodType(settings.academicPeriodType)
      }
      if (Array.isArray(settings.semesterPeriods) && settings.semesterPeriods.length === 2) {
        setSemesterPeriods(settings.semesterPeriods as AcademicPeriod[])
      }
      if (Array.isArray(settings.trimesterPeriods) && settings.trimesterPeriods.length === 3) {
        setTrimesterPeriods(settings.trimesterPeriods as AcademicPeriod[])
      }
    } catch (settingsError) {
      setError(
        settingsError instanceof Error
          ? settingsError.message
          : 'Erro ao carregar configurações da aplicação.',
      )
    }
  }

  async function loadAcademicYears(school: SchoolDocument) {
    const schoolId = getSchoolId(school)
    if (!schoolId) {
      setYearsError('Não foi possível identificar a escola selecionada.')
      setAcademicYears([])
      return
    }

    setIsLoadingYears(true)
    setYearsError(null)

    try {
      const existingYears = await schoolApi.findYears({ userId: getLoggedUserId(), schoolId })
      setAcademicYears(existingYears)
    } catch (yearError) {
      const errorMessage =
        yearError instanceof Error ? yearError.message : 'Erro ao carregar anos letivos.'

      setAcademicYears([])
      setYearsError(errorMessage.includes('HTTP 400') ? null : errorMessage)
    } finally {
      setIsLoadingYears(false)
    }
  }

  async function loadAllAcademicYears() {
    try {
      const existingYears = await schoolApi.findYears({ userId: getLoggedUserId() })
      setAllAcademicYears(existingYears)
    } catch (yearError) {
      const errorMessage =
        yearError instanceof Error ? yearError.message : 'Erro ao carregar anos letivos.'

      setAllAcademicYears([])
      if (!errorMessage.includes('HTTP 400')) {
        setYearsError(errorMessage)
      }
    }
  }

  async function loadAllClasses() {
    try {
      const existingClasses = await schoolApi.findClasses({ userId: getLoggedUserId() })
      setAllClasses(existingClasses)
    } catch (classError) {
      const errorMessage =
        classError instanceof Error ? classError.message : 'Erro ao carregar turmas.'

      setAllClasses([])
      if (!errorMessage.includes('HTTP 400')) {
        setYearsError(errorMessage)
      }
    }
  }

  async function loadAllStudents() {
    try {
      const existingStudents = await schoolApi.findStudents({ userId: getLoggedUserId() })
      setAllStudents(existingStudents)
    } catch (studentError) {
      const errorMessage =
        studentError instanceof Error ? studentError.message : 'Erro ao carregar alunos.'

      setAllStudents([])
      if (!errorMessage.includes('HTTP 400')) {
        setClassesError(errorMessage)
      }
    }
  }

  async function loadAllEvaluationMoments() {
    try {
      const existingMoments = await schoolApi.findEvaluationMoments({ userId: getLoggedUserId() })
      setAllEvaluationMoments(existingMoments)
    } catch (momentError) {
      const errorMessage =
        momentError instanceof Error ? momentError.message : 'Erro ao carregar momentos de avaliação.'

      setAllEvaluationMoments([])
      if (!errorMessage.includes('HTTP 400')) {
        setClassesError(errorMessage)
      }
    }
  }

  async function loadAllStudentMomentValues() {
    try {
      const existingValues = await schoolApi.findStudentMomentValues({ userId: getLoggedUserId() })
      setAllStudentMomentValues(existingValues)
    } catch (valueError) {
      const errorMessage =
        valueError instanceof Error ? valueError.message : 'Erro ao carregar valores dos alunos.'

      setAllStudentMomentValues([])
      if (!errorMessage.includes('HTTP 400')) {
        setClassesError(errorMessage)
      }
    }
  }

  async function loadStudentCalendarTasks(schoolClass = selectedClass) {
    if (!selectedSchool || !selectedAcademicYearDocument || !schoolClass) {
      setStudentCalendarTasks([])
      return
    }

    const schoolId = getSchoolId(selectedSchool)
    const yearId = getDocumentId(selectedAcademicYearDocument)
    const classId = getDocumentId(schoolClass)

    if (!schoolId || !yearId || !classId) {
      setStudentCalendarTasks([])
      setClassesError('Não foi possível identificar a turma para carregar o calendário.')
      return
    }

    try {
      const existingTasks = await schoolApi.findStudentCalendarTasks({
        userId: getLoggedUserId(),
        schoolId,
        yearId,
        classId,
      })
      setStudentCalendarTasks(sortStudentCalendarTasks(existingTasks))
    } catch (calendarError) {
      const errorMessage =
        calendarError instanceof Error ? calendarError.message : 'Erro ao carregar tarefas do calendário.'

      setStudentCalendarTasks([])
      if (!errorMessage.includes('HTTP 400')) {
        setClassesError(errorMessage)
      }
    }
  }

  async function saveAppSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoadingClasses(true)
    setClassesError(null)

    try {
      const settings = await schoolApi.updateAppSettings({
        inactiveLogoutMinutes,
        messageTimeoutSeconds,
        percentageRanges,
        academicPeriodType,
        semesterPeriods,
        trimesterPeriods,
      })
      setInactiveLogoutMinutes(
        normalizePositiveInteger(settings.inactiveLogoutMinutes, DEFAULT_INACTIVITY_LOGOUT_MINUTES),
      )
      setMessageTimeoutSeconds(
        normalizePositiveInteger(settings.messageTimeoutSeconds, DEFAULT_MESSAGE_TIMEOUT_SECONDS),
      )
      setPercentageRanges(normalizePercentageRanges(settings.percentageRanges))
      setMessage('Configurações gravadas com sucesso.')
    } catch (settingsError) {
      setClassesError(
        settingsError instanceof Error
          ? settingsError.message
          : 'Erro ao gravar configurações da aplicação.',
      )
    } finally {
      setIsLoadingClasses(false)
    }
  }

  function updatePercentageRange(
    rangeId: string,
    field: 'min' | 'max' | 'backgroundColor' | 'textColor',
    value: string,
  ) {
    setPercentageRanges((currentRanges) =>
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
    const setter = type === 'semestres' ? setSemesterPeriods : setTrimesterPeriods
    setter((current) =>
      current.map((p) => (p.id === periodId ? { ...p, [field]: value } : p)),
    )
  }

  async function handleCreateAcademicYear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedSchool) {
      setYearsError('Seleciona uma escola antes de criar o ano letivo.')
      return
    }

    const schoolId = getSchoolId(selectedSchool)
    const option = academicYearOptions.find((year) => year.value === selectedAcademicYear)

    if (!schoolId || !option) {
      setYearsError('Não foi possível criar o ano letivo.')
      return
    }

    setIsLoadingYears(true)
    setYearsError(null)

    try {
      const userId = getLoggedUserId()
      const yearPayload = {
        userId,
        schoolId,
        schoolName: getSchoolTitle(selectedSchool),
        name: option.label,
        startYear: option.startYear,
        endYear: option.endYear,
        periodType: yearPeriodType,
      }

      // Impede duplicados: mesmo ano letivo na mesma escola
      const duplicate = academicYears.find((y) => {
        if (editingYearId && getDocumentId(y) === editingYearId) return false
        return (
          Number(y.startYear) === option.startYear &&
          Number(y.endYear) === option.endYear
        )
      })
      if (duplicate) {
        setYearsError(`O ano letivo ${option.label} já existe para esta escola.`)
        setIsLoadingYears(false)
        return
      }

      if (editingYearId) {
        const currentYear = academicYears.find((year) => getDocumentId(year) === editingYearId)
        if (currentYear && !hasAcademicYearChanged(currentYear, yearPayload)) {
          setEditingYearId(null)
          setIsCreateYearModalOpen(false)
          return
        }

        await schoolApi.updateYear(editingYearId, yearPayload)
        setSelectedAcademicYearDocument((currentYear) =>
          currentYear && getDocumentId(currentYear) === editingYearId
            ? { ...currentYear, ...yearPayload }
            : currentYear,
        )
      } else {
        await schoolApi.addYear(yearPayload)
      }

      setEditingYearId(null)
      setIsCreateYearModalOpen(false)
      await loadAcademicYears(selectedSchool)
      await loadAllAcademicYears()
    } catch (yearError) {
      setYearsError(yearError instanceof Error ? yearError.message : 'Erro ao criar ano letivo.')
    } finally {
      setIsLoadingYears(false)
    }
  }

  async function handleSaveSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoadingSchools(true)
    setSchoolsError(null)

    try {
      const schoolPayload = getSchoolPayload()

      // Impede duplicados: mesmo schoolId
      const duplicate = schools.find((s) => {
        if (editingSchoolId && getSchoolId(s) === editingSchoolId) return false
        return getStringValue(s.schoolId).trim().toLowerCase() === schoolPayload.schoolId.toLowerCase()
      })
      if (duplicate) {
        setSchoolsError(`Já existe uma escola com o ID "${schoolPayload.schoolId}".`)
        setIsLoadingSchools(false)
        return
      }

      if (editingSchoolId) {
        await schoolApi.updateSchool(editingSchoolId, schoolPayload)
        setSelectedSchool((currentSchool) =>
          currentSchool && getSchoolId(currentSchool) === editingSchoolId
            ? { ...currentSchool, ...schoolPayload }
            : currentSchool,
        )
      } else {
        await schoolApi.addSchool(schoolPayload)
      }

      resetSchoolForm()
      setIsCreateSchoolModalOpen(false)
      await loadSchools()
    } catch (schoolError) {
      setSchoolsError(
        schoolError instanceof Error ? schoolError.message : 'Erro ao criar escola.',
      )
    } finally {
      setIsLoadingSchools(false)
    }
  }

  async function handleSaveClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedSchool || !selectedAcademicYearDocument) {
      setClassesError('Seleciona uma escola e um ano letivo antes de criar a turma.')
      return
    }

    const schoolId = getSchoolId(selectedSchool)
    const yearId = getDocumentId(selectedAcademicYearDocument)

    if (!schoolId || !yearId) {
      setClassesError('Não foi possível identificar a escola ou o ano letivo selecionado.')
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)

    try {
      const className = `${newClass.classYear.trim()}.º ${newClass.classLetter.trim().toUpperCase()}`

      // Impede duplicados: mesmo ano + letra no mesmo ano letivo
      const duplicate = allClasses.find((c) => {
        if (editingClassId && getDocumentId(c) === editingClassId) return false
        return (
          getStringValue(c.yearId) === yearId &&
          getClassTitle(c).trim().toLowerCase() === className.toLowerCase()
        )
      })
      if (duplicate) {
        setClassesError(`Já existe a turma "${className}" neste ano letivo.`)
        setIsLoadingClasses(false)
        return
      }

      if (editingClassId) {
        const currentClass = allClasses.find((schoolClass) => getDocumentId(schoolClass) === editingClassId)
        const classPayload = {
          ...currentClass,
          name: className,
          director: {
            name: newClass.directorName.trim(),
          },
        }

        await schoolApi.updateClass(editingClassId, classPayload)
        setSelectedClass((currentClass) =>
          currentClass && getDocumentId(currentClass) === editingClassId
            ? { ...currentClass, ...classPayload }
            : currentClass,
        )
      } else {
        const userId = getLoggedUserId()
        const schoolName = getSchoolTitle(selectedSchool)
        const academicYearName = getAcademicYearTitle(selectedAcademicYearDocument)
        const classPayload = {
          userId,
          schoolId,
          schoolName,
          yearId,
          academicYearId: yearId,
          academicYearName,
          name: className,
          director: {
            name: newClass.directorName.trim(),
          },
        }
        const createdClass = await schoolApi.addClass(classPayload)
        const classId = createdClass.id

        await Promise.all(
          newClass.students.map((student) =>
            schoolApi.addStudent({
              userId,
              id: student.id,
              name: student.name.trim(),
              schoolNumber: student.schoolNumber.trim(),
              schoolEmail: student.schoolEmail.trim(),
              guardian: {
                name: student.guardianName.trim(),
                phone: student.guardianPhone.trim(),
                email: student.guardianEmail.trim(),
              },
              schoolId,
              schoolName,
              yearId,
              academicYearId: yearId,
              academicYearName,
              classId,
              className,
              active: true,
            }),
          ),
        )
      }

      resetClassForm()
      setIsCreateClassModalOpen(false)
      await loadAllClasses()
      await loadAllStudents()
    } catch (classError) {
      setClassesError(classError instanceof Error ? classError.message : 'Erro ao criar turma.')
    } finally {
      setIsLoadingClasses(false)
    }
  }

  function getSchoolPayload() {
    const phones = [newSchool.phone1, newSchool.phone2, newSchool.phone3]
      .map((phone) => phone.trim())
      .filter(Boolean)

    return {
      userId: getLoggedUserId(),
      schoolId: newSchool.schoolId.trim(),
      name: newSchool.name.trim(),
      group: newSchool.group.trim() || undefined,
      address: {
        street: newSchool.address.trim(),
        postalCode: newSchool.postalCode.trim(),
        locality: newSchool.locality.trim(),
      },
      phones,
      director: {
        name: newSchool.directorName.trim(),
        contacts: newSchool.directorContacts.trim() || undefined,
      },
    }
  }

  function updateNewSchoolField(field: keyof SchoolForm, value: string) {
    setNewSchool((currentSchool) => ({
      ...currentSchool,
      [field]: value,
    }))
  }

  function updatePostalCode(value: string) {
    updateNewSchoolField('postalCode', formatPostalCode(value))
  }

  function updateNewClassField(field: 'classYear' | 'classLetter' | 'directorName', value: string) {
    setNewClass((currentClass) => ({
      ...currentClass,
      [field]: value,
    }))
  }

  function updateNewStudentField(field: keyof Omit<StudentForm, 'id'>, value: string) {
    setNewStudent((currentStudent) => ({
      ...currentStudent,
      [field]: value,
    }))
  }

  function updateEvaluationMomentField<Field extends keyof EvaluationMomentForm>(
    field: Field,
    value: EvaluationMomentForm[Field],
  ) {
    setNewEvaluationMoment((currentMoment) => ({
      ...currentMoment,
      [field]: value,
    }))
  }

  function updateNewEvaluationQuestion(field: keyof EvaluationQuestionForm, value: string) {
    setNewEvaluationQuestion((currentQuestion) => ({
      ...currentQuestion,
      [field]: value,
    }))
  }

  function openEvaluationQuestionModal() {
    setNewEvaluationQuestion({
      questionNumber: String(newEvaluationMoment.questions.length + 1),
      value: '',
    })
    setIsEvaluationQuestionModalOpen(true)
  }

  function handleSaveEvaluationQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setNewEvaluationMoment((currentMoment) => ({
      ...currentMoment,
      questions: [
        ...currentMoment.questions,
        {
          questionNumber: newEvaluationQuestion.questionNumber.trim(),
          value: newEvaluationQuestion.value,
        },
      ],
    }))
    closeEvaluationQuestionModal()
  }

  function closeEvaluationQuestionModal() {
    setIsEvaluationQuestionModalOpen(false)
    setNewEvaluationQuestion(EMPTY_EVALUATION_QUESTION_FORM)
  }

  function removeEvaluationQuestion(questionIndex: number) {
    setNewEvaluationMoment((currentMoment) => ({
      ...currentMoment,
      questions: currentMoment.questions.filter((_, index) => index !== questionIndex),
    }))
  }


  function getEvaluationQuestionsTotal() {
    return newEvaluationMoment.questions.reduce(
      (total, question) => total + (Number(question.value) || 0),
      0,
    )
  }

  async function handleSaveEvaluationMoment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedSchool || !selectedAcademicYearDocument || !selectedClass) {
      setClassesError('Seleciona uma escola, ano letivo e turma antes de criar o momento de avaliação.')
      return
    }

    const schoolId = getSchoolId(selectedSchool)
    const yearId = getDocumentId(selectedAcademicYearDocument)
    const classId = getDocumentId(selectedClass)

    if (!schoolId || !yearId || !classId) {
      setClassesError('Não foi possível identificar a escola, ano letivo ou turma selecionada.')
      return
    }

    const questions = newEvaluationMoment.questions.map((question) => ({
      number: question.questionNumber.trim(),
      value: Number(question.value),
    }))
    const hasIncompleteQuestions = questions.some(
      (question) => !question.number || !Number.isFinite(question.value) || question.value <= 0,
    )
    const questionsTotal = getEvaluationQuestionsTotal()

    if (newEvaluationMoment.questions.length > 0 && hasIncompleteQuestions) {
      setClassesError('Preenche o número e o valor de todas as questões.')
      return
    }

    if (newEvaluationMoment.questions.length > 0 && questionsTotal !== newEvaluationMoment.totalValue) {
      setClassesError(
        `O total das questões deve ser ${newEvaluationMoment.totalValue}. Total atual: ${questionsTotal}.`,
      )
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)

    try {
      const evaluationMomentPayload = {
        userId: getLoggedUserId(),
        schoolId,
        schoolName: getSchoolTitle(selectedSchool),
        yearId,
        academicYearId: yearId,
        academicYearName: getAcademicYearTitle(selectedAcademicYearDocument),
        classId,
        className: getClassTitle(selectedClass),
        name: newEvaluationMoment.name.trim(),
        type: newEvaluationMoment.type,
        semester: newEvaluationMoment.semester,
        totalValue: newEvaluationMoment.totalValue,
        questions,
      }

      if (editingEvaluationMomentId) {
        await schoolApi.updateEvaluationMoment(editingEvaluationMomentId, evaluationMomentPayload)
      } else {
        await schoolApi.addEvaluationMoment(evaluationMomentPayload)
      }

      closeEvaluationMomentModal()
      await loadAllEvaluationMoments()
    } catch (evaluationMomentError) {
      setClassesError(
        evaluationMomentError instanceof Error
          ? evaluationMomentError.message
          : 'Erro ao criar momento de avaliação.',
      )
    } finally {
      setIsLoadingClasses(false)
    }
  }

  function handleSaveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (editingStudentId) {
      void saveExistingStudent()
      return
    }

    if (activeDashboard === 'students' && selectedClass) {
      void saveStudentToSelectedClass()
      return
    }

    // Validação de número único dentro do formulário da turma
    const newSchoolNumber = newStudent.schoolNumber.trim()
    const duplicateInForm = newClass.students.some(
      (s) => s.schoolNumber.trim() === newSchoolNumber,
    )
    // Validação contra alunos já existentes na escola
    const duplicateInDb = allStudents.some(
      (s) => getStringValue(s.schoolNumber).trim() === newSchoolNumber,
    )
    if (duplicateInForm || duplicateInDb) {
      setClassesError(`O número de escola "${newSchoolNumber}" já está em uso.`)
      return
    }

    setNewClass((currentClass) => ({
      ...currentClass,
      students: [
        ...currentClass.students,
        {
          ...newStudent,
          name: newStudent.name.trim(),
          schoolNumber: newSchoolNumber,
          schoolEmail: newStudent.schoolEmail.trim(),
          guardianName: newStudent.guardianName.trim(),
          guardianPhone: newStudent.guardianPhone.trim(),
          guardianEmail: newStudent.guardianEmail.trim(),
          active: true,
        },
      ],
    }))
    closeStudentModal()
  }

  async function saveStudentToSelectedClass() {
    if (!selectedSchool || !selectedAcademicYearDocument || !selectedClass) {
      setClassesError('Seleciona uma escola, ano letivo e turma antes de criar o aluno.')
      return
    }

    const schoolId = getSchoolId(selectedSchool)
    const yearId = getDocumentId(selectedAcademicYearDocument)
    const classId = getDocumentId(selectedClass)

    if (!schoolId || !yearId || !classId) {
      setClassesError('Não foi possível identificar a escola, ano letivo ou turma selecionada.')
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)

    try {
      const schoolNumber = newStudent.schoolNumber.trim()

      // Validação: número único na escola
      const duplicate = allStudents.some(
        (s) => getStringValue(s.schoolNumber).trim() === schoolNumber,
      )
      if (duplicate) {
        setClassesError(`O número de escola "${schoolNumber}" já está em uso.`)
        setIsLoadingClasses(false)
        return
      }

      await schoolApi.addStudent({
        userId: getLoggedUserId(),
        id: newStudent.id,
        name: newStudent.name.trim(),
        schoolNumber,
        schoolEmail: newStudent.schoolEmail.trim(),
        guardian: {
          name: newStudent.guardianName.trim(),
          phone: newStudent.guardianPhone.trim(),
          email: newStudent.guardianEmail.trim(),
        },
        schoolId,
        schoolName: getSchoolTitle(selectedSchool),
        yearId,
        academicYearId: yearId,
        academicYearName: getAcademicYearTitle(selectedAcademicYearDocument),
        classId,
        className: getClassTitle(selectedClass),
        active: true,
      })
      closeStudentModal()
      await loadAllStudents()
    } catch (studentError) {
      setClassesError(studentError instanceof Error ? studentError.message : 'Erro ao criar aluno.')
    } finally {
      setIsLoadingClasses(false)
    }
  }

  async function saveExistingStudent() {
    if (!editingStudentId) {
      return
    }

    const currentStudent = allStudents.find((student) => getDocumentId(student) === editingStudentId)
    if (!currentStudent) {
      setClassesError('Não foi possível identificar o aluno para edição.')
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)

    try {
      const schoolNumber = newStudent.schoolNumber.trim()

      // Validação: número único excluindo o próprio aluno
      const duplicate = allStudents.some(
        (s) => getDocumentId(s) !== editingStudentId &&
          getStringValue(s.schoolNumber).trim() === schoolNumber,
      )
      if (duplicate) {
        setClassesError(`O número de escola "${schoolNumber}" já está em uso.`)
        setIsLoadingClasses(false)
        return
      }

      const { _id, ...studentPayload } = currentStudent

      await schoolApi.updateStudent(editingStudentId, {
        ...studentPayload,
        id: newStudent.id,
        name: newStudent.name.trim(),
        schoolNumber,
        schoolEmail: newStudent.schoolEmail.trim(),
        guardian: {
          name: newStudent.guardianName.trim(),
          phone: newStudent.guardianPhone.trim(),
          email: newStudent.guardianEmail.trim(),
        },
        active: newStudent.active,
      })
      closeStudentModal()
      await loadAllStudents()
    } catch (studentError) {
      setClassesError(studentError instanceof Error ? studentError.message : 'Erro ao editar aluno.')
    } finally {
      setIsLoadingClasses(false)
    }
  }

  function resetSchoolForm() {
    setNewSchool(EMPTY_SCHOOL_FORM)
    setEditingSchoolId(null)
  }

  function resetClassForm() {
    setNewClass(EMPTY_CLASS_FORM)
    setEditingClassId(null)
    closeStudentModal()
  }

  function openCreateSchoolModal() {
    resetSchoolForm()
    setIsCreateSchoolModalOpen(true)
  }

  function openEditSchoolModal(school: SchoolDocument) {
    const schoolId = getSchoolId(school)
    if (!schoolId) {
      setSchoolsError('Não foi possível identificar a escola para edição.')
      return
    }

    setEditingSchoolId(schoolId)
    setNewSchool(getSchoolFormFromDocument(school))
    setIsCreateSchoolModalOpen(true)
  }

  function openYearsDashboard(school: SchoolDocument) {
    setSelectedSchool(school)
    setSelectedAcademicYearDocument(null)
    setActiveDashboard('years')
  }

  function openCreateYearModal() {
    setEditingYearId(null)
    setSelectedAcademicYear(academicYearOptions[0].value)
    setYearPeriodType(academicPeriodType)
    setIsCreateYearModalOpen(true)
  }

  function openCreateClassModal() {
    resetClassForm()
    setClassesError(null)
    setIsCreateClassModalOpen(true)
  }

  function openEditClassModal(schoolClass: SchoolDocument) {
    const classId = getDocumentId(schoolClass)
    if (!classId) {
      setClassesError('Não foi possível identificar a turma para edição.')
      return
    }

    const director = getRecordValue(schoolClass.director)
    const existingName = getClassTitle(schoolClass)
    // Tenta separar "7.º A" → year="7", letter="A"
    const nameMatch = existingName.match(/^(\d+)(?:\.º)?\s+(.+)$/)
    setEditingClassId(classId)
    setNewClass({
      classYear: nameMatch ? nameMatch[1] : '',
      classLetter: nameMatch ? nameMatch[2] : existingName,
      directorName: getStringValue(director.name),
      students: [],
    })
    setClassesError(null)
    setIsCreateClassModalOpen(true)
  }

  function openStudentModal() {
    setEditingStudentId(null)
    setNewStudent({
      ...EMPTY_STUDENT_FORM,
      id: getNextStudentId(newClass.students),
    })
    setIsStudentModalOpen(true)
  }

  function openNewStudentFromDashboard() {
    setEditingStudentId(null)
    setStudentActionMenuId(null)
    setNewStudent({
      ...EMPTY_STUDENT_FORM,
      id: getNextStudentId([]),
    })
    setIsStudentModalOpen(true)
  }

  function openNewEvaluationMomentModal() {
    setEditingEvaluationMomentId(null)
    setNewEvaluationMoment(EMPTY_EVALUATION_MOMENT_FORM)
    setClassesError(null)
    setIsEvaluationMomentModalOpen(true)
  }

  function closeStudentModal() {
    setIsStudentModalOpen(false)
    setEditingStudentId(null)
    setNewStudent(EMPTY_STUDENT_FORM)
  }

  function closeEvaluationMomentModal() {
    setIsEvaluationMomentModalOpen(false)
    closeEvaluationQuestionModal()
    setEditingEvaluationMomentId(null)
    setNewEvaluationMoment(EMPTY_EVALUATION_MOMENT_FORM)
  }

  function openEditEvaluationMomentModal(moment: SchoolDocument) {
    const momentId = getDocumentId(moment)
    if (!momentId) {
      setClassesError('Não foi possível identificar o momento de avaliação para edição.')
      return
    }

    const questions = Array.isArray(moment.questions) ? moment.questions : []
    setEditingEvaluationMomentId(momentId)
    setNewEvaluationMoment({
      name: getStringValue(moment.name),
      type: moment.type === 'questao-aula' ? 'questao-aula' : 'teste',
      semester: getEvaluationMomentSemester(moment),
      totalValue: moment.totalValue === 100 ? 100 : 20,
      questions: questions.map((question) => {
        const questionRecord = getRecordValue(question)

        return {
          questionNumber: getStringValue(questionRecord.number),
          value: String(questionRecord.value ?? ''),
        }
      }),
    })
    setClassesError(null)
    setIsEvaluationMomentModalOpen(true)
  }

  async function deleteEvaluationMoment(moment: SchoolDocument) {
    const momentId = getDocumentId(moment)
    if (!momentId) {
      setClassesError('Não foi possível identificar o momento de avaliação para apagar.')
      return
    }

    if (!window.confirm('Tens a certeza que queres apagar este momento de avaliação?')) {
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)

    try {
      await schoolApi.deleteEvaluationMoment(momentId)
      await loadAllEvaluationMoments()
    } catch (momentError) {
      setClassesError(
        momentError instanceof Error
          ? momentError.message
          : 'Erro ao apagar momento de avaliação.',
      )
    } finally {
      setIsLoadingClasses(false)
    }
  }

  function openEditStudentModal(student: SchoolDocument) {
    const studentId = getDocumentId(student)
    if (!studentId) {
      setClassesError('Não foi possível identificar o aluno para edição.')
      return
    }

    const guardian = getRecordValue(student.guardian)
    setEditingStudentId(studentId)
    setStudentActionMenuId(null)
    setNewStudent({
      id: Number(student.id) || getNextStudentId([]),
      name: getStringValue(student.name),
      schoolNumber: getStringValue(student.schoolNumber),
      schoolEmail: getStringValue(student.schoolEmail),
      guardianName: getStringValue(guardian.name),
      guardianPhone: getStringValue(guardian.phone),
      guardianEmail: getStringValue(guardian.email),
      active: student.active !== false,
    })
    setIsStudentModalOpen(true)
  }

  async function deactivateStudent(student: SchoolDocument) {
    const studentId = getDocumentId(student)
    if (!studentId) {
      setClassesError('Não foi possível identificar o aluno para desativar.')
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)

    try {
      await schoolApi.updateStudent(studentId, { ...student, active: false })
      setStudentActionMenuId(null)
      await loadAllStudents()
    } catch (studentError) {
      setClassesError(studentError instanceof Error ? studentError.message : 'Erro ao desativar aluno.')
    } finally {
      setIsLoadingClasses(false)
    }
  }

  async function deleteStudent(student: SchoolDocument) {
    const studentId = getDocumentId(student)
    if (!studentId) {
      setClassesError('Não foi possível identificar o aluno para apagar.')
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)

    try {
      await schoolApi.deleteStudent(studentId)
      setStudentActionMenuId(null)
      await loadAllStudents()
    } catch (studentError) {
      setClassesError(studentError instanceof Error ? studentError.message : 'Erro ao apagar aluno.')
    } finally {
      setIsLoadingClasses(false)
    }
  }

  function removeStudentFromClassForm(index: number) {
    setNewClass((currentClass) => ({
      ...currentClass,
      students: currentClass.students.filter((_, studentIndex) => studentIndex !== index),
    }))
  }

  function openEditYearModal(year: SchoolDocument) {
    const yearId = getDocumentId(year)
    if (!yearId) {
      setYearsError('Não foi possível identificar o ano letivo para edição.')
      return
    }

    setEditingYearId(yearId)
    setSelectedAcademicYear(getAcademicYearTitle(year))
    setYearPeriodType((year.periodType as AcademicPeriodType) ?? academicPeriodType)
    setIsCreateYearModalOpen(true)
  }

  function openClassesDashboard(year: SchoolDocument) {
    setSelectedAcademicYearDocument(year)
    setSelectedClass(null)
    setStudentCalendarTasks([])
    setActiveDashboard('classes')
  }

  function openStudentsDashboard(schoolClass: SchoolDocument) {
    setSelectedClass(schoolClass)
    setActiveStudentsMenuOption(1)
    setSelectedGradingMomentId('')
    setSelectedAssessmentsSemester('')
    setAssessmentCellDrafts({})
    setStudentCalendarTasks([])
    setActiveDashboard('students')
    void loadStudentCalendarTasks(schoolClass)
  }

  function openSettingsDashboard() {
    setActiveDashboard('settings')
  }

  function getDashboardTitle() {
    if (activeDashboard === 'years' && selectedSchool) {
      return getSchoolTitle(selectedSchool)
    }

    if (activeDashboard === 'settings') {
      return 'Configurações'
    }

    if (activeDashboard === 'classes' && selectedAcademicYearDocument) {
      return getAcademicYearTitle(selectedAcademicYearDocument)
    }

    if (activeDashboard === 'students' && selectedClass) {
      return getClassTitle(selectedClass)
    }

    return 'Escolas'
  }

  function getDashboardDescription() {
    if (activeDashboard === 'years' && selectedSchool) {
      return 'Gere os anos letivos desta escola.'
    }

    if (activeDashboard === 'settings') {
      return ''
    }

    if (activeDashboard === 'classes' && selectedAcademicYearDocument) {
      return 'Gere as turmas deste ano letivo.'
    }

    if (activeDashboard === 'students' && selectedClass) {
      return 'Dashboard dos alunos da turma.'
    }

    return 'Cria novas escolas e consulta as escolas existentes.'
  }

  function getSchoolTitle(school: SchoolDocument) {
    const title = school.name ?? school.title ?? school.school ?? school._id
    return typeof title === 'string' ? title : 'Escola sem nome'
  }

  function getAcademicYearTitle(year: SchoolDocument) {
    const title = year.name ?? year.label ?? year.year
    return typeof title === 'string' ? title : 'Ano letivo sem nome'
  }

  function getSchoolAcademicYearCount(school: SchoolDocument) {
    const schoolId = getSchoolId(school)
    if (!schoolId) {
      return 0
    }

    return allAcademicYears.filter((year) => year.schoolId === schoolId).length
  }

  function getAcademicYearClassCount(year: SchoolDocument) {
    return getClassesForAcademicYear(year).length
  }

  function getClassesForAcademicYear(year: SchoolDocument) {
    const yearId = typeof year._id === 'string' ? year._id : ''
    const yearTitle = getAcademicYearTitle(year)

    return allClasses.filter((schoolClass) => {
      const classYearId = schoolClass.yearId ?? schoolClass.academicYearId
      const classYearTitle = schoolClass.year ?? schoolClass.academicYear ?? schoolClass.academicYearName

      return classYearId === yearId || classYearTitle === yearTitle
    })
  }

  function getClassTitle(schoolClass: SchoolDocument) {
    const title = schoolClass.name ?? schoolClass.className ?? schoolClass.class
    return typeof title === 'string' ? title : 'Turma sem nome'
  }

  function getClassStudentCount(schoolClass: SchoolDocument) {
    return getStudentsForClass(schoolClass).length
  }

  function getStudentsForClass(schoolClass: SchoolDocument) {
    const classId = getDocumentId(schoolClass)
    const className = getClassTitle(schoolClass)

    return allStudents.filter(
      (student) =>
        student.active !== false &&
        (student.classId === classId || student.className === className),
    )
  }

  function getStudentCalendarTaskDate(task: SchoolDocument) {
    return getStringValue(task.date)
  }

  function getStudentCalendarTaskStartTime(task: SchoolDocument) {
    return getStringValue(task.startTime)
  }

  function getStudentCalendarTaskEndTime(task: SchoolDocument) {
    return getStringValue(task.endTime)
  }

  function getStudentCalendarTaskTitle(task: SchoolDocument) {
    return getStringValue(task.title) || 'Tarefa sem título'
  }

  function sortStudentCalendarTasks(tasks: SchoolDocument[]) {
    return [...tasks].sort((leftTask, rightTask) => {
      const leftDate = getStudentCalendarTaskDate(leftTask)
      const rightDate = getStudentCalendarTaskDate(rightTask)

      if (leftDate !== rightDate) {
        return leftDate.localeCompare(rightDate)
      }

      return getStudentCalendarTaskStartTime(leftTask).localeCompare(
        getStudentCalendarTaskStartTime(rightTask),
      )
    })
  }

  function getStudentCalendarTasksForDate(date: Date) {
    const dateKey = getCalendarDateTime(date)

    return studentCalendarTasks.filter((task) => getStudentCalendarTaskDate(task) === dateKey)
  }

  function getNextStudentCalendarTaskForm(tasks: SchoolDocument[]): StudentCalendarTaskForm {
    const sortedIntervals = tasks
      .map((task) => {
        const startMinutes = getCalendarTimeMinutes(getStudentCalendarTaskStartTime(task))
        const endMinutes = getCalendarTimeMinutes(getStudentCalendarTaskEndTime(task))

        return startMinutes === null || endMinutes === null ? null : { startMinutes, endMinutes }
      })
      .filter((interval): interval is { startMinutes: number; endMinutes: number } => (
        interval !== null
      ))
      .sort((leftInterval, rightInterval) => leftInterval.startMinutes - rightInterval.startMinutes)
    let nextStart = 8 * 60

    for (const interval of sortedIntervals) {
      if (nextStart + 60 <= interval.startMinutes) {
        break
      }

      nextStart = Math.max(nextStart, interval.endMinutes)
    }

    if (nextStart + 60 > 23 * 60 + 59) {
      nextStart = 8 * 60
    }

    return {
      ...EMPTY_STUDENT_CALENDAR_TASK_FORM,
      startTime: formatCalendarTimeFromMinutes(nextStart),
      endTime: formatCalendarTimeFromMinutes(nextStart + 60),
    }
  }

  function hasCalendarTaskTimeConflict(
    tasks: SchoolDocument[],
    startTime: string,
    endTime: string,
  ) {
    return tasks.some((task) =>
      doCalendarTimesOverlap(
        startTime,
        endTime,
        getStudentCalendarTaskStartTime(task),
        getStudentCalendarTaskEndTime(task),
      ),
    )
  }

  function openStudentCalendarTaskModal(calendarDay: StudentCalendarDay) {
    const tasks = getStudentCalendarTasksForDate(calendarDay.date)

    setSelectedStudentCalendarDay(calendarDay)
    setNewStudentCalendarTask(getNextStudentCalendarTaskForm(tasks))
    setIsCreatingCalendarTask(tasks.length === 0)
    setClassesError(null)
    setIsCalendarTaskModalOpen(true)
  }

  function closeStudentCalendarTaskModal() {
    setIsCalendarTaskModalOpen(false)
    setIsCreatingCalendarTask(false)
    setSelectedStudentCalendarDay(null)
    setNewStudentCalendarTask(EMPTY_STUDENT_CALENDAR_TASK_FORM)
    setClassesError(null)
  }

  function openNewStudentCalendarTaskForm() {
    setNewStudentCalendarTask(getNextStudentCalendarTaskForm(selectedStudentCalendarTasks))
    setIsCreatingCalendarTask(true)
    setClassesError(null)
  }

  function updateStudentCalendarTaskField(field: keyof StudentCalendarTaskForm, value: string) {
    setNewStudentCalendarTask((currentTask) => ({
      ...currentTask,
      [field]: value,
    }))
  }

  function getEvaluationMomentsForClass(schoolClass: SchoolDocument) {
    const classId = getDocumentId(schoolClass)
    const className = getClassTitle(schoolClass)

    return allEvaluationMoments.filter(
      (moment) => moment.classId === classId || moment.className === className,
    )
  }

  function getEvaluationMomentTypeLabel(moment: SchoolDocument) {
    return moment.type === 'questao-aula' ? 'Questão aula' : 'Teste'
  }

  function getEvaluationMomentSemester(moment: SchoolDocument): '1' | '2' {
    return String(moment.semester ?? '1') === '2' ? '2' : '1'
  }

  function getEvaluationMomentQuestionCount(moment: SchoolDocument) {
    return Array.isArray(moment.questions) ? moment.questions.length : 0
  }

  function getEvaluationMomentQuestions(moment: SchoolDocument): EvaluationQuestionForm[] {
    if (!Array.isArray(moment.questions)) {
      return []
    }

    return moment.questions.map((question) => {
      const questionRecord = getRecordValue(question)

      return {
        questionNumber: getStringValue(questionRecord.number || questionRecord.questionNumber),
        value: String(questionRecord.value ?? ''),
      }
    })
  }

  function getSelectedGradingMoment() {
    return allEvaluationMoments.find((moment) => getDocumentId(moment) === selectedGradingMomentId)
  }

  function getStudentMomentValueKey(momentId: string, studentId: string, questionNumber: string) {
    return `${momentId}:${studentId}:${questionNumber}`
  }

  function getStudentMomentValueRecord(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
  ) {
    const momentId = getDocumentId(moment)
    const studentId = getDocumentId(student)

    return allStudentMomentValues.find(
      (value) =>
        value.momentId === momentId &&
        value.studentId === studentId &&
        value.questionNumber === question.questionNumber,
    )
  }

  function isSameStudentMomentValue(leftValue: SchoolDocument, rightValue: SchoolDocument) {
    return (
      leftValue.momentId === rightValue.momentId &&
      leftValue.studentId === rightValue.studentId &&
      leftValue.questionNumber === rightValue.questionNumber
    )
  }

  function mergeStudentMomentValues(nextValues: SchoolDocument[]) {
    if (nextValues.length === 0) {
      return
    }

    setAllStudentMomentValues((currentValues) => [
      ...currentValues.filter(
        (currentValue) =>
          !nextValues.some((nextValue) => isSameStudentMomentValue(currentValue, nextValue)),
      ),
      ...nextValues,
    ])
  }

  function hasStudentMomentValueRecord(
    values: SchoolDocument[],
    momentId: string,
    studentId: string,
    questionNumber: string,
  ) {
    return values.some(
      (value) =>
        value.momentId === momentId &&
        value.studentId === studentId &&
        value.questionNumber === questionNumber,
    )
  }

  function buildStudentMomentValuePayload(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
    value: string,
  ): SchoolDocument | null {
    if (!selectedSchool || !selectedAcademicYearDocument || !selectedClass) {
      setClassesError('Seleciona escola, ano letivo e turma antes de gravar valores.')
      return null
    }

    const schoolId = getSchoolId(selectedSchool)
    const yearId = getDocumentId(selectedAcademicYearDocument)
    const classId = getDocumentId(selectedClass)
    const momentId = getDocumentId(moment)
    const studentId = getDocumentId(student)

    if (!schoolId || !yearId || !classId || !momentId || !studentId) {
      setClassesError('Não foi possível identificar todos os dados para gravar o valor.')
      return null
    }

    return {
      userId: getLoggedUserId(),
      schoolId,
      schoolName: getSchoolTitle(selectedSchool),
      yearId,
      academicYearId: yearId,
      academicYearName: getAcademicYearTitle(selectedAcademicYearDocument),
      classId,
      className: getClassTitle(selectedClass),
      momentId,
      name: getStringValue(moment.name),
      momentName: getStringValue(moment.name),
      studentId,
      studentUniqueId: student.id,
      studentName: getStringValue(student.name),
      questionNumber: question.questionNumber,
      questionValue: Number(question.value) || 0,
      value: value.trim() || '0',
    }
  }

  async function handleSaveStudentCalendarTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedSchool || !selectedAcademicYearDocument || !selectedClass || !selectedStudentCalendarDay) {
      setClassesError('Seleciona escola, ano letivo, turma e dia antes de gravar a tarefa.')
      return
    }

    const schoolId = getSchoolId(selectedSchool)
    const yearId = getDocumentId(selectedAcademicYearDocument)
    const classId = getDocumentId(selectedClass)

    if (!schoolId || !yearId || !classId) {
      setClassesError('Não foi possível identificar todos os dados para gravar a tarefa.')
      return
    }

    const title = newStudentCalendarTask.title.trim()
    const description = newStudentCalendarTask.description.trim()
    const startTime = newStudentCalendarTask.startTime
    const endTime = newStudentCalendarTask.endTime
    const startMinutes = getCalendarTimeMinutes(startTime)
    const endMinutes = getCalendarTimeMinutes(endTime)

    if (!title || !description) {
      setClassesError('Preenche o título e a descrição da tarefa.')
      return
    }

    if (startMinutes === null || endMinutes === null) {
      setClassesError('As horas devem estar no formato HH:MM.')
      return
    }

    if (startMinutes >= endMinutes) {
      setClassesError('A hora de fim deve ser posterior à hora de início.')
      return
    }

    if (hasCalendarTaskTimeConflict(selectedStudentCalendarTasks, startTime, endTime)) {
      setClassesError('Já existe uma tarefa nesse horário.')
      return
    }

    const payload: SchoolDocument = {
      userId: getLoggedUserId(),
      schoolId,
      schoolName: getSchoolTitle(selectedSchool),
      yearId,
      academicYearId: yearId,
      academicYearName: getAcademicYearTitle(selectedAcademicYearDocument),
      classId,
      className: getClassTitle(selectedClass),
      date: getCalendarDateTime(selectedStudentCalendarDay.date),
      title,
      description,
      startTime,
      endTime,
    }

    setIsLoadingClasses(true)
    setClassesError(null)

    try {
      const savedTask = await schoolApi.addStudentCalendarTask(payload)
      const task = {
        ...payload,
        _id: savedTask.id,
      }

      setStudentCalendarTasks((currentTasks) => sortStudentCalendarTasks([...currentTasks, task]))
      setIsCreatingCalendarTask(false)
      setNewStudentCalendarTask(EMPTY_STUDENT_CALENDAR_TASK_FORM)
      setMessage('Tarefa gravada.')
    } catch (calendarTaskError) {
      setClassesError(
        calendarTaskError instanceof Error
          ? calendarTaskError.message
          : 'Erro ao gravar tarefa no calendário.',
      )
    } finally {
      setIsLoadingClasses(false)
    }
  }

  async function handleSelectGradingMoment(momentId: string) {
    if (momentId !== selectedGradingMomentId && !canLeaveAssessmentMoment()) {
      return
    }

    setSelectedGradingMomentId(momentId)
    setAssessmentCellDrafts({})

    if (!momentId) {
      return
    }

    const moment = allEvaluationMoments.find((evaluationMoment) => getDocumentId(evaluationMoment) === momentId)
    if (!moment || !selectedClass) {
      setClassesError('Não foi possível identificar o momento de avaliação selecionado.')
      return
    }

    const classId = getDocumentId(selectedClass)
    if (!classId) {
      setClassesError('Não foi possível identificar a turma selecionada.')
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)

    try {
      let existingValues: SchoolDocument[] = []
      try {
        existingValues = await schoolApi.findStudentMomentValues({
          userId: getLoggedUserId(),
          classId,
          momentId,
        })
      } catch (loadError) {
        if (!(loadError instanceof Error) || !loadError.message.includes('HTTP 400')) {
          throw loadError
        }
      }

      const students = getStudentsForClass(selectedClass)
      const questions = getEvaluationMomentQuestions(moment)
      const missingValuePayloads = students.flatMap((student) => {
        const studentId = getDocumentId(student)
        if (!studentId) {
          return []
        }

        return questions
          .filter(
            (question) =>
              !hasStudentMomentValueRecord(
                existingValues,
                momentId,
                studentId,
                question.questionNumber,
              ),
          )
          .map((question) => buildStudentMomentValuePayload(student, moment, question, '0'))
          .filter((payload): payload is SchoolDocument => payload !== null)
      })
      const createdValues = await Promise.all(
        missingValuePayloads.map(async (payload) => {
          const savedValue = await schoolApi.saveStudentMomentValue(payload)

          return {
            ...payload,
            _id: savedValue.id,
          }
        }),
      )

      mergeStudentMomentValues([...existingValues, ...createdValues])
    } catch (valueError) {
      setClassesError(
        valueError instanceof Error
          ? valueError.message
          : 'Erro ao carregar os valores do momento de avaliação.',
      )
    } finally {
      setIsLoadingClasses(false)
    }
  }

  function getSavedStudentMomentCellValue(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
  ) {
    const savedValue = getStudentMomentValueRecord(student, moment, question)
    return savedValue?.value === undefined || savedValue?.value === null || savedValue.value === ''
      ? '0'
      : String(savedValue.value)
  }

  function getStudentMomentCellValue(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
  ) {
    const momentId = getDocumentId(moment)
    const studentId = getDocumentId(student)

    if (!momentId || !studentId) {
      return ''
    }

    const draftKey = getStudentMomentValueKey(momentId, studentId, question.questionNumber)
    if (draftKey in assessmentCellDrafts) {
      return assessmentCellDrafts[draftKey]
    }

    return getSavedStudentMomentCellValue(student, moment, question)
  }

  function getAssessmentChangePayloads(moment = getSelectedGradingMoment()) {
    if (!moment || !selectedClass) {
      return []
    }

    return getStudentsForClass(selectedClass).flatMap((student) =>
      getEvaluationMomentQuestions(moment).flatMap((question) => {
        const momentId = getDocumentId(moment)
        const studentId = getDocumentId(student)
        if (!momentId || !studentId) {
          return []
        }

        const draftKey = getStudentMomentValueKey(momentId, studentId, question.questionNumber)
        if (!(draftKey in assessmentCellDrafts)) {
          return []
        }

        const normalizedDraftValue = assessmentCellDrafts[draftKey].trim() || '0'
        if (getSavedStudentMomentCellValue(student, moment, question) === normalizedDraftValue) {
          return []
        }

        const payload = buildStudentMomentValuePayload(student, moment, question, normalizedDraftValue)
        return payload ? [payload] : []
      }),
    )
  }

  function hasUnsavedAssessmentChanges() {
    const moment = getSelectedGradingMoment()
    if (!moment || !selectedClass) {
      return false
    }

    return getStudentsForClass(selectedClass).some((student) =>
      getEvaluationMomentQuestions(moment).some((question) => {
        const momentId = getDocumentId(moment)
        const studentId = getDocumentId(student)
        if (!momentId || !studentId) {
          return false
        }

        const draftKey = getStudentMomentValueKey(momentId, studentId, question.questionNumber)
        return (
          draftKey in assessmentCellDrafts &&
          (assessmentCellDrafts[draftKey].trim() || '0') !== getSavedStudentMomentCellValue(student, moment, question)
        )
      }),
    )
  }

  function canLeaveAssessmentMoment() {
    if (!hasUnsavedAssessmentChanges()) {
      return true
    }

    window.alert('Existem alterações por gravar. Clica em Gravar antes de sair deste momento de avaliação.')
    return false
  }

  function handleStudentsMenuOptionChange(option: StudentsMenuOption) {
    if (option !== activeStudentsMenuOption && activeStudentsMenuOption === 3 && !canLeaveAssessmentMoment()) {
      return
    }

    setActiveStudentsMenuOption(option)
  }

  function moveStudentCalendarMonth(monthOffset: number) {
    setStudentCalendarDate((currentDate) => (
      new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1)
    ))
  }

  function resetStudentCalendarMonth() {
    setStudentCalendarDate(new Date())
  }

  function toggleStudentCalendarWeekMode() {
    setStudentCalendarWeekMode((currentMode) => (currentMode === 'work' ? 'full' : 'work'))
  }

  function openSettingsDashboardWithAssessmentGuard() {
    if (activeDashboard === 'students' && activeStudentsMenuOption === 3 && !canLeaveAssessmentMoment()) {
      return
    }

    openSettingsDashboard()
  }

  function removeAssessmentDraftsForMoment(momentId: string) {
    setAssessmentCellDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts }

      Object.keys(nextDrafts).forEach((draftKey) => {
        if (draftKey.startsWith(`${momentId}:`)) {
          delete nextDrafts[draftKey]
        }
      })

      return nextDrafts
    })
  }

  function getStudentMomentTotal(student: SchoolDocument, moment: SchoolDocument) {
    return getEvaluationMomentQuestions(moment).reduce(
      (total, question) => total + (Number(getStudentMomentCellValue(student, moment, question)) || 0),
      0,
    )
  }

  function getStudentMomentPercentage(student: SchoolDocument, moment: SchoolDocument) {
    return `${getStudentMomentPercentageValue(student, moment).toFixed(1)}%`
  }

  function getStudentMomentPercentageValue(student: SchoolDocument, moment: SchoolDocument) {
    const momentMaxValue = getEvaluationMomentMaxValue(moment)
    if (!momentMaxValue) {
      return 0
    }

    return (getStudentMomentTotal(student, moment) / momentMaxValue) * 100
  }

  function getStudentMomentPercentageStyle(student: SchoolDocument, moment: SchoolDocument) {
    const percentage = getStudentMomentPercentageValue(student, moment)
    const matchingRange =
      percentageRanges.find((range) => percentage >= range.min && percentage <= range.max) ??
      percentageRanges[percentageRanges.length - 1] ??
      DEFAULT_PERCENTAGE_RANGES[0]

    return {
      backgroundColor: matchingRange.backgroundColor,
      color: matchingRange.textColor,
    }
  }

  function getAssessmentsSemesterMoments() {
    if (!selectedClass || !selectedAssessmentsSemester) {
      return []
    }

    return getEvaluationMomentsForClass(selectedClass).filter(
      (moment) =>
        moment.type === 'teste' &&
        getEvaluationMomentSemester(moment) === selectedAssessmentsSemester,
    )
  }

  function getStudentSavedMomentTotal(student: SchoolDocument, moment: SchoolDocument) {
    return getEvaluationMomentQuestions(moment).reduce(
      (total, question) => total + (Number(getSavedStudentMomentCellValue(student, moment, question)) || 0),
      0,
    )
  }

  function getChartData(student: SchoolDocument) {
    const moments = selectedClass ? getEvaluationMomentsForClass(selectedClass) : []
    return moments.map((moment) => {
      const total = getStudentSavedMomentTotal(student, moment)
      const max = getEvaluationMomentMaxValue(moment) || 100
      return {
        name: getStringValue(moment.name) as string,
        Nota: total,
        Máximo: max,
        '%': Math.round((total / max) * 100),
      }
    })
  }

  const CHART_PALETTE = [
    '#2563eb', '#c0392b', '#16a34a', '#d97706', '#7c3aed',
    '#0891b2', '#db2777', '#65a30d', '#ea580c', '#6d28d9',
  ]

  function getAllStudentsForMomentData(students: SchoolDocument[], moment: SchoolDocument) {
    return students.map((student) => ({
      name: (getStringValue(student.name) as string) || 'Aluno',
      Nota: getStudentSavedMomentTotal(student, moment),
      Máximo: getEvaluationMomentMaxValue(moment) || 100,
    }))
  }

  function getChartTypeLabel(type: ChartType) {
    const labels: Record<ChartType, string> = {
      bar: '📊 Barras',
      line: '📈 Linhas',
      area: '🌊 Área',
      radar: '🕸 Radar',
    }
    return labels[type]
  }

  function nextChartType() {
    const order: ChartType[] = ['bar', 'line', 'area', 'radar']
    setChartType((prev) => order[(order.indexOf(prev) + 1) % order.length])
  }

  function exportChartToPdf() {
    window.print()
  }

  function getAssessmentsDashboardRows() {
    if (!selectedClass) {
      return []
    }

    const moments = getAssessmentsSemesterMoments()
    return getStudentsForClass(selectedClass).map((student) => [
      getStringValue(student.name),
      ...moments.map((moment) => String(getStudentSavedMomentTotal(student, moment))),
    ])
  }

  function buildSemesterEvaluationsPayload() {
    if (!selectedSchool || !selectedAcademicYearDocument || !selectedClass || !selectedAssessmentsSemester) {
      setClassesError('Seleciona escola, ano letivo, turma e semestre antes de gravar avaliações.')
      return null
    }

    const schoolId = getSchoolId(selectedSchool)
    const yearId = getDocumentId(selectedAcademicYearDocument)
    const classId = getDocumentId(selectedClass)

    if (!schoolId || !yearId || !classId) {
      setClassesError('Não foi possível identificar todos os dados para gravar avaliações.')
      return null
    }

    const moments = getAssessmentsSemesterMoments()
    const headers = [
      'Aluno',
      ...moments.map((moment) => `${getStringValue(moment.name)} (${getEvaluationMomentMaxValue(moment)})`),
    ]

    return {
      userId: getLoggedUserId(),
      schoolId,
      schoolName: getSchoolTitle(selectedSchool),
      yearId,
      academicYearId: yearId,
      academicYearName: getAcademicYearTitle(selectedAcademicYearDocument),
      classId,
      className: getClassTitle(selectedClass),
      semester: selectedAssessmentsSemester,
      title: `Avaliações - ${selectedAssessmentsSemester}.º semestre`,
      tests: moments.map((moment) => ({
        id: getDocumentId(moment),
        name: getStringValue(moment.name),
        totalValue: getEvaluationMomentMaxValue(moment),
      })),
      headers,
      rows: getAssessmentsDashboardRows(),
    }
  }

  async function saveSemesterEvaluations() {
    const payload = buildSemesterEvaluationsPayload()
    if (!payload) {
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)

    try {
      await schoolApi.saveSemesterEvaluations(payload)
      setMessage('Avaliações gravadas com sucesso.')
    } catch (saveError) {
      setClassesError(saveError instanceof Error ? saveError.message : 'Erro ao gravar avaliações.')
    } finally {
      setIsLoadingClasses(false)
    }
  }

  async function generateSemesterEvaluationsReport() {
    const payload = buildSemesterEvaluationsPayload()
    if (!payload) {
      return
    }

    if (getAssessmentsSemesterMoments().length === 0) {
      setClassesError('O semestre selecionado ainda não tem testes.')
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)
    setMessage(null)

    try {
      const report = await schoolApi.generateMomentAssessmentReport({
        title: payload.title,
        headers: payload.headers,
        rows: payload.rows,
      })
      window.open(schoolApi.getReportUrl(report.url), '_blank', 'noopener,noreferrer')
      setMessage(`Relatório criado em: ${report.path}`)
    } catch (reportError) {
      setClassesError(
        reportError instanceof Error ? reportError.message : 'Erro ao gerar relatório de avaliações.',
      )
    } finally {
      setIsLoadingClasses(false)
    }
  }

  function getQuestionMaxValue(question: EvaluationQuestionForm) {
    return Number(question.value) || 0
  }

  function getEvaluationMomentMaxValue(moment: SchoolDocument) {
    return Number(moment.totalValue) || 0
  }

  function getStudentMomentProjectedTotal(
    student: SchoolDocument,
    moment: SchoolDocument,
    targetQuestion: EvaluationQuestionForm,
    targetValue: string,
  ) {
    return getEvaluationMomentQuestions(moment).reduce((total, question) => {
      const value =
        question.questionNumber === targetQuestion.questionNumber
          ? targetValue
          : getStudentMomentCellValue(student, moment, question)

      return total + (Number(value) || 0)
    }, 0)
  }

  function getAssessmentCellValidationError(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
    value: string,
  ) {
    const normalizedValue = value.trim() || '0'
    if (!normalizedValue) {
      return null
    }

    const numericValue = Number(normalizedValue)
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      return 'Insere um valor válido para a questão.'
    }

    const questionMaxValue = getQuestionMaxValue(question)
    if (numericValue > questionMaxValue) {
      return `O valor da questão ${question.questionNumber} não pode ultrapassar ${questionMaxValue}.`
    }

    const projectedTotal = getStudentMomentProjectedTotal(student, moment, question, normalizedValue)
    const momentMaxValue = getEvaluationMomentMaxValue(moment)
    if (projectedTotal > momentMaxValue) {
      return `O total do aluno não pode ultrapassar ${momentMaxValue}. Total atual: ${projectedTotal}.`
    }

    return null
  }

  function updateAssessmentCellDraft(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
    value: string,
  ) {
    const momentId = getDocumentId(moment)
    const studentId = getDocumentId(student)

    if (!momentId || !studentId) {
      return
    }

    const validationError = getAssessmentCellValidationError(student, moment, question, value)
    if (validationError) {
      setClassesError(validationError)
      return
    }

    setClassesError(null)
    setAssessmentCellDrafts((currentDrafts) => ({
      ...currentDrafts,
      [getStudentMomentValueKey(momentId, studentId, question.questionNumber)]: value,
    }))
  }

  async function saveAssessmentCell(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
    value: string,
  ) {
    const momentId = getDocumentId(moment)
    const studentId = getDocumentId(student)
    if (!momentId || !studentId) {
      setClassesError('Não foi possível identificar todos os dados para gravar o valor.')
      return
    }

    const normalizedValue = value.trim() || '0'
    const validationError = getAssessmentCellValidationError(student, moment, question, normalizedValue)
    if (validationError) {
      setClassesError(validationError)
      return
    }

    const draftKey = getStudentMomentValueKey(momentId, studentId, question.questionNumber)
    setClassesError(null)
    setAssessmentCellDrafts((currentDrafts) => ({
      ...currentDrafts,
      [draftKey]: normalizedValue,
    }))
  }

  async function saveAssessmentChanges() {
    const moment = getSelectedGradingMoment()
    const momentId = moment ? getDocumentId(moment) : null
    const valuePayloads = getAssessmentChangePayloads(moment)
    if (!moment || !momentId || valuePayloads.length === 0) {
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)

    try {
      const savedValues = await Promise.all(
        valuePayloads.map(async (valuePayload) => {
          const savedRecord = allStudentMomentValues.find((currentValue) =>
            isSameStudentMomentValue(currentValue, valuePayload)
          )
          const savedValue = await schoolApi.saveStudentMomentValue(valuePayload)

          return {
            ...valuePayload,
            _id: savedValue.id ?? savedRecord?._id,
          }
        }),
      )

      mergeStudentMomentValues(savedValues)
      removeAssessmentDraftsForMoment(momentId)
      setMessage('Valores de avaliação gravados com sucesso.')
    } catch (saveError) {
      setClassesError(saveError instanceof Error ? saveError.message : 'Erro ao gravar valores dos alunos.')
    } finally {
      setIsLoadingClasses(false)
    }
  }

  async function generateAssessmentReport(momentToReport?: SchoolDocument) {
    const moment = momentToReport ?? getSelectedGradingMoment()
    if (!selectedClass || !moment) {
      setClassesError('Seleciona um momento de avaliação antes de gerar o relatório.')
      return
    }

    const questions = getEvaluationMomentQuestions(moment)
    if (questions.length === 0) {
      setClassesError('O momento de avaliação selecionado não tem questões para o relatório.')
      return
    }

    const students = getStudentsForClass(selectedClass)
    if (students.length === 0) {
      setClassesError('A turma ainda não tem alunos para o relatório.')
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)
    setMessage(null)

    try {
      const report = await schoolApi.generateMomentAssessmentReport({
        title: getStringValue(moment.name),
        headers: [
          'Aluno',
          ...questions.map((question) => `Q${question.questionNumber} (${getQuestionMaxValue(question)})`),
          'Total',
          '%',
        ],
        rows: students.map((student) => [
          getStringValue(student.name),
          ...questions.map((question) => getStudentMomentCellValue(student, moment, question) || '0'),
          String(getStudentMomentTotal(student, moment)),
          getStudentMomentPercentage(student, moment),
        ]),
      })
      window.open(schoolApi.getReportUrl(report.url), '_blank', 'noopener,noreferrer')
      setMessage(`Relatório criado em: ${report.path}`)
    } catch (reportError) {
      setClassesError(
        reportError instanceof Error ? reportError.message : 'Erro ao gerar relatório.',
      )
    } finally {
      setIsLoadingClasses(false)
    }
  }

  async function generateStudentDetailReport(student: SchoolDocument) {
    const guardian = getRecordValue(student.guardian)
    const studentName = getStringValue(student.name) || 'Aluno'

    setIsLoadingClasses(true)
    setClassesError(null)
    setMessage(null)

    try {
      const report = await schoolApi.generateMomentAssessmentReport({
        title: `Detalhe do aluno - ${studentName}`,
        headers: ['Campo', 'Valor'],
        rows: [
          ['ID único', String(student.id ?? '')],
          ['Nome do aluno', studentName],
          ['Número na escola', String(student.schoolNumber ?? '')],
          ['Email escolar', getStringValue(student.schoolEmail)],
          ['Encarregado de educação', getStringValue(guardian.name)],
          ['Contacto do EE', getStringValue(guardian.phone)],
          ['Email do EE', getStringValue(guardian.email)],
          ['Escola', getStringValue(student.schoolName) || (selectedSchool ? getSchoolTitle(selectedSchool) : '')],
          ['Ano letivo', getStringValue(student.academicYearName) || (selectedAcademicYearDocument ? getAcademicYearTitle(selectedAcademicYearDocument) : '')],
          ['Turma', getStringValue(student.className) || (selectedClass ? getClassTitle(selectedClass) : '')],
          ['Estado', student.active === false ? 'Inativo' : 'Ativo'],
        ],
      })
      window.open(schoolApi.getReportUrl(report.url), '_blank', 'noopener,noreferrer')
      setMessage(`Relatório criado em: ${report.path}`)
    } catch (reportError) {
      setClassesError(
        reportError instanceof Error ? reportError.message : 'Erro ao gerar relatório do aluno.',
      )
    } finally {
      setIsLoadingClasses(false)
    }
  }

  async function generateClassStudentsReport() {
    if (!selectedClass) {
      setClassesError('Seleciona uma turma antes de gerar o relatório.')
      return
    }

    const students = getStudentsForClass(selectedClass)
    if (students.length === 0) {
      setClassesError('A turma ainda não tem alunos para o relatório.')
      return
    }

    setIsLoadingClasses(true)
    setClassesError(null)
    setMessage(null)

    try {
      const report = await schoolApi.generateMomentAssessmentReport({
        title: `Alunos da turma - ${getClassTitle(selectedClass)}`,
        headers: [
          'ID',
          'Nome',
          'N.º escola',
          'Email escolar',
          'Encarregado de educação',
          'Contacto EE',
          'Email EE',
          'Estado',
        ],
        rows: students.map((student) => {
          const guardian = getRecordValue(student.guardian)

          return [
            String(student.id ?? ''),
            getStringValue(student.name),
            String(student.schoolNumber ?? ''),
            getStringValue(student.schoolEmail),
            getStringValue(guardian.name),
            getStringValue(guardian.phone),
            getStringValue(guardian.email),
            student.active === false ? 'Inativo' : 'Ativo',
          ]
        }),
      })
      window.open(schoolApi.getReportUrl(report.url), '_blank', 'noopener,noreferrer')
      setMessage(`Relatório criado em: ${report.path}`)
    } catch (reportError) {
      setClassesError(
        reportError instanceof Error ? reportError.message : 'Erro ao gerar relatório da turma.',
      )
    } finally {
      setIsLoadingClasses(false)
    }
  }

  function getLoggedUserId() {
    if (!user?.userId) {
      throw new Error('Não foi possível identificar o utilizador autenticado.')
    }

    return user.userId
  }

  function getNextStudentId(formStudents: StudentForm[]) {
    const existingIds = allStudents
      .map((student) => Number(student.id))
      .filter((studentId) => Number.isInteger(studentId))
    const formIds = formStudents.map((student) => student.id)

    return Math.max(0, ...existingIds, ...formIds) + 1
  }

  function hasAcademicYearChanged(year: SchoolDocument, payload: SchoolDocument) {
    return (
      year.name !== payload.name ||
      year.startYear !== payload.startYear ||
      year.endYear !== payload.endYear ||
      year.schoolId !== payload.schoolId ||
      year.schoolName !== payload.schoolName
    )
  }

  function getSchoolId(school: SchoolDocument) {
    return getDocumentId(school)
  }

  function getDocumentId(document: SchoolDocument) {
    return typeof document._id === 'string' ? document._id : null
  }

  function getStringValue(value: unknown) {
    return typeof value === 'string' ? value : ''
  }

  function getRecordValue(value: unknown) {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {}
  }

  function getSchoolFormFromDocument(school: SchoolDocument): SchoolForm {
    const address = getRecordValue(school.address)
    const director = getRecordValue(school.director)
    const phones = Array.isArray(school.phones) ? school.phones.map(getStringValue) : []

    return {
      name: getStringValue(school.name),
      schoolId: getStringValue(school.schoolId),
      group: getStringValue(school.group),
      address: getStringValue(address.street),
      postalCode: getStringValue(address.postalCode),
      locality: getStringValue(address.locality),
      phone1: phones[0] ?? '',
      phone2: phones[1] ?? '',
      phone3: phones[2] ?? '',
      directorName: getStringValue(director.name),
      directorContacts: getStringValue(director.contacts),
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const loggedUser = await authApi.login({ email, password })
      setUser(loggedUser)
      setSelectedSchool(null)
      setAcademicYears([])
      setAllAcademicYears([])
      setAllClasses([])
      setAllStudents([])
      setStudentCalendarTasks([])
      setSelectedAcademicYearDocument(null)
      setSelectedClass(null)
      setActiveDashboard('schools')
      setMessage(loggedUser.message)
    } catch (loginError) {
      setUser(null)
      setError(loginError instanceof Error ? loginError.message : 'Erro ao iniciar sessão.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (password !== confirmPassword) {
      setError('As passwords não coincidem.')
      return
    }

    setIsLoading(true)

    try {
      const registerResponse = await authApi.register({
        name,
        email,
        password,
        role: DEFAULT_REGISTER_ROLE,
      })
      setMessage(registerResponse.message)
      setAuthMode('login')
      setName('')
      setPassword('')
      setConfirmPassword('')
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Erro ao criar utilizador.')
    } finally {
      setIsLoading(false)
    }
  }

  function switchAuthMode(nextMode: 'login' | 'register') {
    setAuthMode(nextMode)
    setError(null)
    setMessage(null)
    setPassword('')
    setConfirmPassword('')
  }

  async function handleLogout() {
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const logoutResponse = await authApi.logout()
      setUser(null)
      setPassword('')
      setSelectedSchool(null)
      setAcademicYears([])
      setAllAcademicYears([])
      setAllClasses([])
      setAllStudents([])
      setStudentCalendarTasks([])
      setSelectedAcademicYearDocument(null)
      setSelectedClass(null)
      setActiveDashboard('schools')
      setMessage(logoutResponse.message)
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Erro ao terminar sessão.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className={user ? 'app-shell dashboard-page' : 'app-shell'}>
      {user ? (
        <section className="dashboard-shell" aria-labelledby="dashboard-title">
          <header className="topbar">
            <span className="topbar-brand">School Management</span>
            <nav className="topbar-nav" aria-label="Navegação principal">
              <button
                type="button"
                className={`topbar-nav-btn${activeDashboard === 'schools' ? ' active' : ''}`}
              >
                Escolas
              </button>
              <button
                type="button"
                className={`topbar-nav-btn${activeDashboard === 'years' ? ' active' : ''}`}
                disabled={schools.length === 0}
              >
                Anos Letivos
              </button>
              <button
                type="button"
                className={`topbar-nav-btn${activeDashboard === 'classes' ? ' active' : ''}`}
                disabled={allAcademicYears.length === 0}
              >
                Turmas
              </button>
              <button
                type="button"
                className={`topbar-nav-btn${activeDashboard === 'students' ? ' active' : ''}`}
                disabled={allClasses.length === 0}
              >
                Alunos
              </button>
            </nav>
            <div className="topbar-actions">
              <strong className="topbar-user-role">{user.role}</strong>
              <span className="topbar-user-email">{user.email ?? email}</span>
              <button
                type="button"
                className={`topbar-action-btn${activeDashboard === 'settings' ? ' active' : ''}`}
                onClick={openSettingsDashboardWithAssessmentGuard}
              >
                Configurações
              </button>
              <button
                type="button"
                className="topbar-action-btn topbar-logout"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? 'A terminar...' : 'Logout'}
              </button>
            </div>
          </header>
          <section className="dashboard-content">
            <header className="dashboard-header">
              {activeDashboard !== 'settings' && <h1 id="dashboard-title">{getDashboardTitle()}</h1>}
              {getDashboardDescription() && <p>{getDashboardDescription()}</p>}
            </header>

            {activeDashboard === 'settings' ? (
              <section className="students-panel settings-panel" aria-label="Configurações da aplicação">
                <div className="settings-theme-toggle">
                  <span>Aparência</span>
                  <button
                    type="button"
                    className="theme-toggle-btn secondary-button"
                    onClick={() => setDarkMode(prev => !prev)}
                    aria-label={darkMode ? 'Mudar para light mode' : 'Mudar para dark mode'}
                  >
                    {darkMode ? '☀ Light mode' : '☾ Dark mode'}
                  </button>
                </div>
                <form className="settings-form" onSubmit={saveAppSettings}>
                  <div className="students-panel-heading">
                    <h2>Configurações gerais</h2>
                    <button type="submit" disabled={isLoadingClasses}>
                      Gravar configurações
                    </button>
                  </div>
                  <section className="settings-periods" aria-label="Períodos do ano letivo">
                    <div>
                      <h3>Períodos do ano letivo</h3>
                      <p>Define se o ano letivo é dividido em semestres ou trimestres e as respetivas datas.</p>
                    </div>
                    <label className="settings-period-type-label">
                      Tipo de período
                      <select
                        value={academicPeriodType}
                        onChange={(e) => setAcademicPeriodType(e.target.value as AcademicPeriodType)}
                      >
                        <option value="semestres">Semestres</option>
                        <option value="trimestres">Trimestres</option>
                      </select>
                    </label>
                    <div className="settings-periods-table" role="table" aria-label="Datas dos períodos">
                      <div className="settings-periods-row settings-periods-head" role="row">
                        <span role="columnheader">Período</span>
                        <span role="columnheader">Data de início</span>
                        <span role="columnheader">Data de fim</span>
                      </div>
                      {(academicPeriodType === 'semestres' ? semesterPeriods : trimesterPeriods).map((period) => (
                        <div className="settings-periods-row" role="row" key={period.id}>
                          <span className="settings-period-label">{period.label}</span>
                          <div role="cell">
                            <input
                              type="date"
                              aria-label={`${period.label} — início`}
                              value={period.startDate}
                              onChange={(e) => updatePeriodDate(academicPeriodType, period.id, 'startDate', e.target.value)}
                            />
                          </div>
                          <div role="cell">
                            <input
                              type="date"
                              aria-label={`${period.label} — fim`}
                              value={period.endDate}
                              onChange={(e) => updatePeriodDate(academicPeriodType, period.id, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <div className="settings-grid">
                    <label>
                      Terminar sessão por inatividade (minutos)
                      <input
                        type="number"
                        min="1"
                        value={inactiveLogoutMinutes}
                        onChange={(event) =>
                          setInactiveLogoutMinutes(
                            normalizePositiveInteger(
                              event.target.value,
                              DEFAULT_INACTIVITY_LOGOUT_MINUTES,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      Tempo das mensagens no ecrã (segundos)
                      <input
                        type="number"
                        min="1"
                        value={messageTimeoutSeconds}
                        onChange={(event) =>
                          setMessageTimeoutSeconds(
                            normalizePositiveInteger(
                              event.target.value,
                              DEFAULT_MESSAGE_TIMEOUT_SECONDS,
                            ),
                          )
                        }
                      />
                    </label>
                  </div>
                  <section className="settings-ranges" aria-label="Cores da percentagem">
                    <div>
                      <h3>Cores da percentagem</h3>
                      <p>Define os intervalos usados na coluna % da grelha Alunos/M.Avaliação.</p>
                    </div>
                    <div className="settings-ranges-table" role="table" aria-label="Intervalos de percentagem">
                      <div className="settings-ranges-row settings-ranges-head" role="row">
                        <span role="columnheader">Mín.</span>
                        <span role="columnheader">Máx.</span>
                        <span role="columnheader">Fundo</span>
                        <span role="columnheader">Texto</span>
                        <span role="columnheader">Exemplo</span>
                      </div>
                      {percentageRanges.map((range) => (
                        <div className="settings-ranges-row" role="row" key={range.id}>
                          <label role="cell">
                            <span>Mín.</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={range.min}
                              onChange={(event) => updatePercentageRange(range.id, 'min', event.target.value)}
                            />
                          </label>
                          <label role="cell">
                            <span>Máx.</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={range.max}
                              onChange={(event) => updatePercentageRange(range.id, 'max', event.target.value)}
                            />
                          </label>
                          <label role="cell">
                            <span>Fundo</span>
                            <input
                              type="color"
                              value={range.backgroundColor}
                              onChange={(event) =>
                                updatePercentageRange(range.id, 'backgroundColor', event.target.value)
                              }
                            />
                          </label>
                          <label role="cell">
                            <span>Texto</span>
                            <input
                              type="color"
                              value={range.textColor}
                              onChange={(event) =>
                                updatePercentageRange(range.id, 'textColor', event.target.value)
                              }
                            />
                          </label>
                          <div role="cell" className="settings-ranges-preview">
                            <span
                              className="assessment-percentage"
                              style={{ backgroundColor: range.backgroundColor, color: range.textColor }}
                            >
                              {range.min}–{range.max}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </form>
              </section>
            ) : activeDashboard === 'schools' ? (
            <section className="schools-grid" aria-label="Escolas">
              <article className="school-card create-school-card">
                <h2>Criar nova escola</h2>
                <p>Adicionar uma nova escola à plataforma.</p>
                <button type="button" onClick={openCreateSchoolModal}>
                  Nova escola
                </button>
              </article>

              {schools.map((school, index) => (
                <article
                  className="school-card existing-school-card"
                  key={String(school._id ?? school.name ?? index)}
                >
                  <h2>{getSchoolTitle(school)}</h2>
                  <div className="school-card-meta" aria-label="Número de anos letivos">
                    <span>Anos letivos</span>
                    <strong>{getSchoolAcademicYearCount(school)}</strong>
                  </div>
                  <div className="school-card-actions">
                    <button type="button" onClick={() => openYearsDashboard(school)}>
                      Abrir
                    </button>
                    <button
                      type="button"
                      className="transparent-button"
                      onClick={() => openEditSchoolModal(school)}
                    >
                      Editar informação
                    </button>
                  </div>
                </article>
              ))}

            </section>
            ) : activeDashboard === 'years' && selectedSchool ? (
              <section className="schools-grid" aria-label="Anos letivos">
                <article className="school-card create-school-card">
                  <h2>Criar novo ano letivo</h2>
                  <p>Adicionar um novo ano letivo a esta escola.</p>
                  <button type="button" onClick={openCreateYearModal}>
                    Novo ano letivo
                  </button>
                </article>
                {academicYears.map((year, index) => (
                  <article
                    className="school-card year-card"
                    key={String(year._id ?? year.name ?? index)}
                  >
                    <h2>{getAcademicYearTitle(year)}</h2>
                    <div className="school-card-meta year-card-meta" aria-label="Número de turmas associadas">
                      <span>Turmas</span>
                      <strong>{getAcademicYearClassCount(year)}</strong>
                    </div>
                    <div className="school-card-actions">
                      <button type="button" onClick={() => openClassesDashboard(year)}>
                        Abrir
                      </button>
                      <button
                        type="button"
                        className="transparent-button"
                        onClick={() => openEditYearModal(year)}
                      >
                        Editar informação
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            ) : activeDashboard === 'years' ? (
              <section className="dashboard-empty-state">
                <h2>Seleciona uma escola</h2>
                <p>Vai a <strong>Escolas</strong> e abre uma escola para ver os seus anos letivos.</p>
              </section>
            ) : activeDashboard === 'classes' && selectedAcademicYearDocument ? (
              <section className="schools-grid" aria-label="Turmas">
                <article className="school-card create-school-card">
                  <h2>Criar nova turma</h2>
                  <p>Adicionar uma nova turma a este ano letivo.</p>
                  <button type="button" onClick={openCreateClassModal}>
                    Nova turma
                  </button>
                </article>
                {getClassesForAcademicYear(selectedAcademicYearDocument).map((schoolClass, index) => (
                  <article
                    className="school-card class-card"
                    key={String(schoolClass._id ?? schoolClass.name ?? index)}
                  >
                    <h2>{getClassTitle(schoolClass)}</h2>
                    <div className="school-card-meta class-card-meta" aria-label="Número de alunos associados">
                      <span>Alunos</span>
                      <strong>{getClassStudentCount(schoolClass)}</strong>
                    </div>
                    <div className="school-card-actions">
                      <button type="button" onClick={() => openStudentsDashboard(schoolClass)}>
                        Abrir alunos
                      </button>
                      <button
                        type="button"
                        className="transparent-button"
                        onClick={() => openEditClassModal(schoolClass)}
                      >
                        Editar nome
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            ) : activeDashboard === 'classes' ? (
              <section className="dashboard-empty-state">
                <h2>Seleciona um ano letivo</h2>
                <p>Vai a <strong>Anos Letivos</strong> e abre um ano letivo para ver as suas turmas.</p>
              </section>
            ) : activeDashboard === 'students' && selectedClass ? (
              <section className="students-dashboard" aria-label="Dashboard dos alunos">
                <aside className="students-sidebar" aria-label="Menu de alunos">
                  {STUDENTS_MENU_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={activeStudentsMenuOption === option.id ? 'active' : ''}
                      onClick={() => handleStudentsMenuOptionChange(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </aside>
                {activeStudentsMenuOption === 0 ? (
                  <section className="students-panel" aria-label="Calendário mensal">
                    <div className="student-calendar-heading">
                      <div>
                        <h2>Calendário</h2>
                        <p>{getStudentCalendarMonthLabel(studentCalendarDate)}</p>
                      </div>
                      <div className="student-calendar-actions" aria-label="Navegação do calendário">
                        <button
                          type="button"
                          className="student-calendar-week-toggle"
                          aria-pressed={isStudentCalendarFullWeek}
                          aria-label={
                            isStudentCalendarFullWeek
                              ? 'Mostrar apenas dias úteis'
                              : 'Mostrar semana toda'
                          }
                          onClick={toggleStudentCalendarWeekMode}
                        >
                          {isStudentCalendarFullWeek ? 'Semana toda' : 'Semana de trabalho'}
                        </button>
                        <button
                          type="button"
                          aria-label="Mês anterior"
                          onClick={() => moveStudentCalendarMonth(-1)}
                        >
                          ‹
                        </button>
                        <button type="button" onClick={resetStudentCalendarMonth}>
                          Hoje
                        </button>
                        <button
                          type="button"
                          aria-label="Mês seguinte"
                          onClick={() => moveStudentCalendarMonth(1)}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                    <div
                      className={[
                        'student-calendar',
                        isStudentCalendarFullWeek ? 'full-week' : 'work-week',
                      ].join(' ')}
                      role="table"
                      aria-label={
                        isStudentCalendarFullWeek
                          ? 'Calendário mensal com semana toda'
                          : 'Calendário mensal com semana de trabalho'
                      }
                    >
                      <div className="student-calendar-weekdays" role="row">
                        {visibleStudentCalendarWeekdays.map((weekday, weekdayIndex) => (
                          <span
                            key={weekday}
                            className={weekdayIndex >= CALENDAR_WORK_WEEKDAY_COUNT ? 'weekend' : ''}
                            role="columnheader"
                          >
                            {weekday}
                          </span>
                        ))}
                      </div>
                      <div className="student-calendar-grid">
                        {studentCalendarDays.map((calendarDay) => {
                          const calendarTasks = getStudentCalendarTasksForDate(calendarDay.date)

                          return (
                            <button
                              key={calendarDay.key}
                              type="button"
                              className={[
                                'student-calendar-day',
                                calendarDay.isCurrentMonth ? '' : 'outside-month',
                                calendarDay.isWeekend ? 'weekend' : '',
                                calendarDay.isToday ? 'today' : '',
                                calendarTasks.length > 0 ? 'has-tasks' : '',
                              ].filter(Boolean).join(' ')}
                              aria-label={`Abrir tarefas de ${getStudentCalendarDayLabel(calendarDay.date)}`}
                              onDoubleClick={() => openStudentCalendarTaskModal(calendarDay)}
                            >
                              <time
                                className="student-calendar-day-number"
                                dateTime={getCalendarDateTime(calendarDay.date)}
                              >
                                {calendarDay.day}
                              </time>
                              {calendarTasks.length > 0 && (
                                <span className="student-calendar-task-list">
                                  {calendarTasks.map((task, taskIndex) => (
                                    <span
                                      className="student-calendar-task-title"
                                      key={String(task._id ?? `${calendarDay.key}-${taskIndex}`)}
                                    >
                                      {getStudentCalendarTaskTitle(task)}
                                    </span>
                                  ))}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </section>
                ) : activeStudentsMenuOption === 2 ? (
                  <section className="students-panel" aria-label="Momentos de avaliação">
                    <div className="students-panel-heading">
                      <h2>Momento de Avaliação</h2>
                      <button
                        type="button"
                        onClick={openNewEvaluationMomentModal}
                      >
                        Inserir Momento de Avaliação
                      </button>
                    </div>
                    {getEvaluationMomentsForClass(selectedClass).length === 0 ? (
                      <p className="students-empty-state">Ainda não existem momentos de avaliação nesta turma.</p>
                    ) : (
                      <div className="evaluation-moments-table" role="table" aria-label="Momentos de avaliação">
                        <div className="evaluation-moments-row evaluation-moments-table-head" role="row">
                          <span role="columnheader">Nome</span>
                          <span role="columnheader">Tipo</span>
                          <span role="columnheader">Valor total</span>
                          <span role="columnheader">Questões</span>
                          <span role="columnheader">Ações</span>
                        </div>
                        {getEvaluationMomentsForClass(selectedClass).map((moment, index) => (
                          <div
                            className="evaluation-moments-row"
                            role="row"
                            key={String(moment._id ?? moment.name ?? index)}
                          >
                            <span role="cell">{getStringValue(moment.name)}</span>
                            <span role="cell">{getEvaluationMomentTypeLabel(moment)}</span>
                            <span role="cell">{String(moment.totalValue ?? '')}</span>
                            <span role="cell">{getEvaluationMomentQuestionCount(moment)}</span>
                            <span className="student-row-actions" role="cell">
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Editar momento de avaliação"
                                onClick={() => openEditEvaluationMomentModal(moment)}
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Gerar relatório do momento de avaliação"
                                onClick={() => generateAssessmentReport(moment)}
                                disabled={isLoadingClasses}
                              >
                                📄
                              </button>
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Apagar momento de avaliação"
                                onClick={() => deleteEvaluationMoment(moment)}
                              >
                                🗑
                              </button>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ) : activeStudentsMenuOption === 3 ? (
                  <section className="students-panel" aria-label="Alunos por momento de avaliação">
                    <div className="assessment-panel-heading">
                      <div>
                        <h2>Alunos/M.Avaliação</h2>
                        <p>Seleciona um momento de avaliação para preencher os valores dos alunos.</p>
                      </div>
                      <label>
                        Momento de avaliação
                        <select
                          value={selectedGradingMomentId}
                          onChange={(event) => void handleSelectGradingMoment(event.target.value)}
                        >
                          <option value="">Selecionar momento</option>
                          {getEvaluationMomentsForClass(selectedClass).map((moment, index) => (
                            <option
                              value={getDocumentId(moment) ?? ''}
                              key={String(moment._id ?? moment.name ?? index)}
                            >
                              {getStringValue(moment.name)}
                            </option>
                          ))}
                        </select>
                      </label>
                      {getSelectedGradingMoment() && (
                        <div className="assessment-panel-actions">
                          <button
                            type="button"
                            onClick={() => generateAssessmentReport()}
                            disabled={isLoadingClasses}
                          >
                            Relatório
                          </button>
                          <button
                            type="button"
                            onClick={() => void saveAssessmentChanges()}
                            disabled={!hasUnsavedAssessmentChanges() || isLoadingClasses}
                          >
                            Gravar
                          </button>
                        </div>
                      )}
                    </div>
                    {!getSelectedGradingMoment() ? (
                      <p className="students-empty-state">
                        Escolhe um momento de avaliação para ver a tabela de alunos.
                      </p>
                    ) : getEvaluationMomentQuestions(getSelectedGradingMoment()!).length === 0 ? (
                      <p className="students-empty-state">
                        O momento selecionado ainda não tem questões.
                      </p>
                    ) : getStudentsForClass(selectedClass).length === 0 ? (
                      <p className="students-empty-state">Ainda não existem alunos nesta turma.</p>
                    ) : (
                      <div className="student-assessment-table" role="table" aria-label="Valores por aluno e questão">
                        <div
                          className="student-assessment-row student-assessment-table-head"
                          role="row"
                          style={{
                            gridTemplateColumns: `minmax(180px, 1.4fr) repeat(${getEvaluationMomentQuestions(getSelectedGradingMoment()!).length}, minmax(84px, 1fr)) 90px 100px`,
                          }}
                        >
                          <span role="columnheader">Aluno</span>
                          {getEvaluationMomentQuestions(getSelectedGradingMoment()!).map((question) => (
                            <span role="columnheader" key={question.questionNumber}>
                              Q{question.questionNumber}{' '}
                              <strong className="question-max-value">
                                ({getQuestionMaxValue(question)})
                              </strong>
                            </span>
                          ))}
                          <span role="columnheader">Total</span>
                          <span role="columnheader">%</span>
                        </div>
                        {getStudentsForClass(selectedClass).map((student, studentIndex) => (
                          <div
                            className="student-assessment-row"
                            role="row"
                            key={String(student._id ?? student.id ?? studentIndex)}
                            style={{
                              gridTemplateColumns: `minmax(180px, 1.4fr) repeat(${getEvaluationMomentQuestions(getSelectedGradingMoment()!).length}, minmax(84px, 1fr)) 90px 100px`,
                            }}
                          >
                            <span role="cell">{getStringValue(student.name)}</span>
                            {getEvaluationMomentQuestions(getSelectedGradingMoment()!).map((question) => (
                              <span role="cell" key={question.questionNumber}>
                                <input
                                  type="number"
                                  min="0"
                                  max={getQuestionMaxValue(question)}
                                  step="0.01"
                                  value={getStudentMomentCellValue(student, getSelectedGradingMoment()!, question)}
                                  onChange={(event) =>
                                    updateAssessmentCellDraft(
                                      student,
                                      getSelectedGradingMoment()!,
                                      question,
                                      event.target.value,
                                    )
                                  }
                                  onBlur={(event) =>
                                    void saveAssessmentCell(
                                      student,
                                      getSelectedGradingMoment()!,
                                      question,
                                      event.target.value,
                                    )
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                      event.currentTarget.blur()
                                    }
                                  }}
                                  aria-label={`Valor de ${getStringValue(student.name)} na questão ${question.questionNumber}`}
                                />
                              </span>
                            ))}
                            <strong role="cell">
                              {getStudentMomentTotal(student, getSelectedGradingMoment()!)}
                            </strong>
                            <strong
                              role="cell"
                              className="assessment-percentage"
                              style={getStudentMomentPercentageStyle(student, getSelectedGradingMoment()!)}
                            >
                              {getStudentMomentPercentage(student, getSelectedGradingMoment()!)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ) : activeStudentsMenuOption === 4 ? (
                  <section className="students-panel" aria-label="Avaliações por semestre">
                    <div className="assessment-panel-heading">
                      <div>
                        <h2>Avaliações</h2>
                        <p>Seleciona um semestre para consultar os totais dos testes por aluno.</p>
                      </div>
                      <label>
                        Semestre
                        <select
                          value={selectedAssessmentsSemester}
                          onChange={(event) => setSelectedAssessmentsSemester(event.target.value)}
                        >
                          <option value="">Selecionar semestre</option>
                          <option value="1">1.º semestre</option>
                          <option value="2">2.º semestre</option>
                        </select>
                      </label>
                      <div className="assessment-panel-actions">
                        {selectedAssessmentsSemester && (
                          <button
                            type="button"
                            onClick={() => void generateSemesterEvaluationsReport()}
                            disabled={isLoadingClasses}
                          >
                            Relatório
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void saveSemesterEvaluations()}
                          disabled={!selectedAssessmentsSemester || isLoadingClasses}
                        >
                          Gravar
                        </button>
                      </div>
                    </div>
                    {!selectedAssessmentsSemester ? (
                      <p className="students-empty-state">
                        Escolhe um semestre para ver a tabela de avaliações.
                      </p>
                    ) : getAssessmentsSemesterMoments().length === 0 ? (
                      <p className="students-empty-state">
                        Ainda não existem testes no semestre selecionado.
                      </p>
                    ) : getStudentsForClass(selectedClass).length === 0 ? (
                      <p className="students-empty-state">Ainda não existem alunos nesta turma.</p>
                    ) : (
                      <div className="semester-assessments-table" role="table" aria-label="Avaliações por semestre">
                        <div
                          className="semester-assessments-row semester-assessments-head"
                          role="row"
                          style={{
                            gridTemplateColumns: `minmax(180px, 1.4fr) repeat(${getAssessmentsSemesterMoments().length}, minmax(120px, 1fr))`,
                          }}
                        >
                          <span role="columnheader">Aluno</span>
                          {getAssessmentsSemesterMoments().map((moment) => (
                            <span role="columnheader" key={getDocumentId(moment) ?? getStringValue(moment.name)}>
                              {getStringValue(moment.name)}{' '}
                              <strong className="question-max-value">
                                ({getEvaluationMomentMaxValue(moment)})
                              </strong>
                            </span>
                          ))}
                        </div>
                        {getStudentsForClass(selectedClass).map((student, studentIndex) => (
                          <div
                            className="semester-assessments-row"
                            role="row"
                            key={String(student._id ?? student.id ?? studentIndex)}
                            style={{
                              gridTemplateColumns: `minmax(180px, 1.4fr) repeat(${getAssessmentsSemesterMoments().length}, minmax(120px, 1fr))`,
                            }}
                          >
                            <span role="cell">{getStringValue(student.name)}</span>
                            {getAssessmentsSemesterMoments().map((moment) => (
                              <strong role="cell" key={getDocumentId(moment) ?? getStringValue(moment.name)}>
                                {getStudentSavedMomentTotal(student, moment)}
                              </strong>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ) : activeStudentsMenuOption === 5 ? (
                  (() => {
                    const ALL_STUDENTS_VALUE = '__all__'
                    const students = getStudentsForClass(selectedClass)
                    const allMoments = selectedClass ? getEvaluationMomentsForClass(selectedClass) : []
                    const isAllStudents = chartStudentId === ALL_STUDENTS_VALUE
                    const chartStudent = isAllStudents
                      ? null
                      : (students.find((s) => String(s._id ?? s.id) === chartStudentId) ?? students[0] ?? null)
                    const selectedMoment = isAllStudents
                      ? (allMoments.find((m) => String(m._id ?? m.id) === chartMomentId) ?? allMoments[0] ?? null)
                      : null
                    const singleData = chartStudent ? getChartData(chartStudent) : []
                    const allMomentData = isAllStudents && selectedMoment
                      ? getAllStudentsForMomentData(students, selectedMoment)
                      : []
                    const data = isAllStudents ? allMomentData : singleData
                    const hasData = data.length > 0
                    const CHART_COLOR = CHART_PALETTE[0]
                    const CHART_COLOR_2 = CHART_PALETTE[1]
                    const currentValue = chartStudentId || (students[0] ? String(students[0]._id ?? students[0].id) : '')
                    return (
                      <section className="students-panel charts-panel print-section" aria-label="Gráficos de avaliação">
                        <div className="students-panel-heading">
                          <h2>Gráficos</h2>
                          <div className="students-panel-heading-actions">
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={nextChartType}
                              title="Mudar tipo de gráfico"
                            >
                              {getChartTypeLabel(chartType)}
                            </button>
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={exportChartToPdf}
                              disabled={!hasData}
                              title="Exportar para PDF"
                            >
                              📄 Exportar PDF
                            </button>
                          </div>
                        </div>
                        <div className="chart-filters">
                          <label className="chart-student-select-label">
                            Aluno
                            <select
                              value={currentValue || ALL_STUDENTS_VALUE}
                              onChange={(e) => setChartStudentId(e.target.value)}
                            >
                              {students.length === 0 ? (
                                <option value="">Sem alunos</option>
                              ) : (
                                <>
                                  <option value={ALL_STUDENTS_VALUE}>Todos os alunos</option>
                                  {students.map((s, i) => (
                                    <option
                                      key={String(s._id ?? s.id ?? i)}
                                      value={String(s._id ?? s.id ?? i)}
                                    >
                                      {getStringValue(s.name)}
                                    </option>
                                  ))}
                                </>
                              )}
                            </select>
                          </label>
                          {isAllStudents && (
                            <label className="chart-student-select-label">
                              Momento de avaliação
                              <select
                                value={chartMomentId || String(allMoments[0]?._id ?? allMoments[0]?.id ?? '')}
                                onChange={(e) => setChartMomentId(e.target.value)}
                              >
                                {allMoments.length === 0 ? (
                                  <option value="">Sem momentos</option>
                                ) : (
                                  allMoments.map((m, i) => (
                                    <option
                                      key={String(m._id ?? m.id ?? i)}
                                      value={String(m._id ?? m.id ?? i)}
                                    >
                                      {getStringValue(m.name)}
                                    </option>
                                  ))
                                )}
                              </select>
                            </label>
                          )}
                        </div>
                        {!hasData ? (
                          <p className="students-empty-state">
                            {students.length === 0
                              ? 'Ainda não existem alunos nesta turma.'
                              : allMoments.length === 0
                                ? 'Ainda não existem momentos de avaliação nesta turma.'
                                : 'Seleciona um momento de avaliação.'}
                          </p>
                        ) : (
                          <div className="chart-container">
                            {chartStudent && (
                              <p className="chart-student-name">{getStringValue(chartStudent.name)}</p>
                            )}
                            {isAllStudents && selectedMoment && (
                              <p className="chart-student-name">
                                {getStringValue(selectedMoment.name)}
                                {' — '}máximo: {getEvaluationMomentMaxValue(selectedMoment)}
                              </p>
                            )}
                            <ResponsiveContainer width="100%" height={320} className="chart-responsive-container">
                              {chartType === 'bar' ? (
                                <BarChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 40 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                                  <YAxis tick={{ fontSize: 11 }} />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="Nota" fill={CHART_COLOR} radius={[4, 4, 0, 0]}>
                                    {isAllStudents
                                      ? data.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)
                                      : <LabelList dataKey="Nota" position="top" style={{ fontSize: 10, fontWeight: 700 }} />
                                    }
                                  </Bar>
                                  {!isAllStudents && (
                                    <Bar dataKey="Máximo" fill={CHART_COLOR_2} radius={[4, 4, 0, 0]} opacity={0.4} />
                                  )}
                                </BarChart>
                              ) : chartType === 'line' ? (
                                <LineChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 40 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                                  <YAxis tick={{ fontSize: 11 }} />
                                  <Tooltip />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="Nota"
                                    stroke={CHART_COLOR}
                                    strokeWidth={2}
                                    dot={isAllStudents
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      ? (props: any) => <circle key={props.index} cx={props.cx} cy={props.cy} r={5} fill={CHART_PALETTE[props.index % CHART_PALETTE.length]} stroke="#fff" strokeWidth={1.5} />
                                      : { r: 4 }
                                    }
                                  >
                                    {!isAllStudents && <LabelList dataKey="Nota" position="top" style={{ fontSize: 10, fontWeight: 700 }} />}
                                  </Line>
                                  {!isAllStudents && (
                                    <Line type="monotone" dataKey="Máximo" stroke={CHART_COLOR_2} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                  )}
                                </LineChart>
                              ) : chartType === 'area' ? (
                                <AreaChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 40 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                                  <YAxis tick={{ fontSize: 11 }} />
                                  <Tooltip />
                                  <Legend />
                                  <Area
                                    type="monotone"
                                    dataKey="Nota"
                                    stroke={CHART_COLOR}
                                    fill={CHART_COLOR}
                                    fillOpacity={0.2}
                                    strokeWidth={2}
                                    dot={isAllStudents
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      ? (props: any) => <circle key={props.index} cx={props.cx} cy={props.cy} r={5} fill={CHART_PALETTE[props.index % CHART_PALETTE.length]} stroke="#fff" strokeWidth={1.5} />
                                      : { r: 4 }
                                    }
                                  >
                                    {!isAllStudents && <LabelList dataKey="Nota" position="top" style={{ fontSize: 10, fontWeight: 700 }} />}
                                  </Area>
                                  {!isAllStudents && (
                                    <Area type="monotone" dataKey="Máximo" stroke={CHART_COLOR_2} fill={CHART_COLOR_2} fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                                  )}
                                </AreaChart>
                              ) : (
                                <RadarChart
                                  data={data}
                                  margin={{ top: 8, right: 24, left: 0, bottom: 8 }}
                                >
                                  <PolarGrid stroke="var(--border)" />
                                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                                  <PolarRadiusAxis tick={{ fontSize: 10 }} />
                                  <Radar name="Nota" dataKey="Nota" stroke={CHART_COLOR} fill={CHART_COLOR} fillOpacity={0.35} />
                                  {!isAllStudents && (
                                    <Radar name="Máximo" dataKey="Máximo" stroke={CHART_COLOR_2} fill={CHART_COLOR_2} fillOpacity={0.1} />
                                  )}
                                  <Legend />
                                  <Tooltip />
                                </RadarChart>
                              )}
                            </ResponsiveContainer>
                          </div>
                        )}
                      </section>
                    )
                  })()
                ) : (
                  <section className="students-panel" aria-label="Lista de alunos da turma">
                    <div className="students-panel-heading">
                      <h2>Alunos da turma</h2>
                      <div className="students-panel-heading-actions">
                        <button
                          type="button"
                          onClick={generateClassStudentsReport}
                          disabled={getStudentsForClass(selectedClass).length === 0 || isLoadingClasses}
                        >
                          Relatório
                        </button>
                        <button type="button" onClick={openNewStudentFromDashboard}>
                          Novo aluno
                        </button>
                      </div>
                    </div>
                    {getStudentsForClass(selectedClass).length === 0 ? (
                      <p className="students-empty-state">Ainda não existem alunos nesta turma.</p>
                    ) : (
                      <div className="students-table" role="table" aria-label="Alunos">
                        <div className="students-table-row students-table-head" role="row">
                          <span role="columnheader">ID</span>
                          <span role="columnheader">Nome</span>
                          <span role="columnheader">N.º escola</span>
                          <span role="columnheader">Ações</span>
                        </div>
                        {getStudentsForClass(selectedClass).map((student, index) => (
                          <div className="students-table-row" role="row" key={String(student._id ?? student.id ?? index)}>
                            <span role="cell">{String(student.id ?? '')}</span>
                            <span role="cell">{String(student.name ?? '')}</span>
                            <span role="cell">{String(student.schoolNumber ?? '')}</span>
                            <span className="student-row-actions" role="cell">
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Editar aluno"
                                onClick={() => openEditStudentModal(student)}
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Gerar relatório do aluno"
                                onClick={() => generateStudentDetailReport(student)}
                              >
                                📄
                              </button>
                              <span className="student-more-actions">
                                <button
                                  type="button"
                                  className="icon-button"
                                  aria-label="Apagar ou desativar aluno"
                                  onClick={() => {
                                    const studentId = getDocumentId(student)
                                    setStudentActionMenuId((currentId) =>
                                      currentId === studentId ? null : studentId,
                                    )
                                  }}
                                >
                                  ⋯
                                </button>
                                {studentActionMenuId === getDocumentId(student) && (
                                  <span className="student-action-menu">
                                    <button type="button" onClick={() => deleteStudent(student)}>
                                      Apagar aluno
                                    </button>
                                    <button type="button" onClick={() => deactivateStudent(student)}>
                                      Desativar aluno
                                    </button>
                                  </span>
                                )}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </section>
            ) : activeDashboard === 'students' ? (
              <section className="dashboard-empty-state">
                <h2>Seleciona uma turma</h2>
                <p>Vai a <strong>Turmas</strong> e abre uma turma para ver os seus alunos.</p>
              </section>
            ) : (
              <section className="dashboard-empty-state">
                <h2>Área em construção</h2>
                <p>Seleciona Escolas para voltar ao dashboard das escolas.</p>
              </section>
            )}

            {schoolsError && !isCreateSchoolModalOpen && <p className="dashboard-feedback">{schoolsError}</p>}
            {yearsError && !isCreateYearModalOpen && <p className="dashboard-feedback">{yearsError}</p>}
            {classesError && !isStudentModalOpen && !isEvaluationMomentModalOpen && !isCalendarTaskModalOpen && (
              <p className="dashboard-feedback">{classesError}</p>
            )}
            {message && <p className="dashboard-feedback success">{message}</p>}
            {isLoadingYears && <p className="dashboard-feedback info">A carregar anos letivos...</p>}
            {isLoadingClasses && <p className="dashboard-feedback info">A guardar turma...</p>}

            {/* Toast global — sempre acima de tudo */}
            <div className="toast-container" role="alert" aria-live="polite">
              {schoolsError && isCreateSchoolModalOpen && (
                <p className="toast error">{schoolsError}</p>
              )}
              {yearsError && isCreateYearModalOpen && (
                <p className="toast error">{yearsError}</p>
              )}
              {classesError && (isStudentModalOpen || isEvaluationMomentModalOpen || isCalendarTaskModalOpen) && (
                <p className="toast error">{classesError}</p>
              )}
            </div>

            {isCreateSchoolModalOpen && (
              <div className="modal-backdrop" role="presentation">
                <section className="modal-card" aria-labelledby="create-school-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={() => {
                      setIsCreateSchoolModalOpen(false)
                      resetSchoolForm()
                    }}
                  >
                    ×
                  </button>
                  <h2 id="create-school-title">
                    {editingSchoolId ? 'Editar escola' : 'Criar nova escola'}
                  </h2>
                  <form onSubmit={handleSaveSchool}>
                    <label>
                      ID da Escola
                      <input
                        type="text"
                        value={newSchool.schoolId}
                        onChange={(event) => updateNewSchoolField('schoolId', event.target.value)}
                        placeholder="Ex: ESC-001"
                        minLength={1}
                        autoFocus
                        required
                      />
                    </label>
                    <label>
                      Nome da escola
                      <input
                        type="text"
                        value={newSchool.name}
                        onChange={(event) => updateNewSchoolField('name', event.target.value)}
                        placeholder="Ex: Escola Secundária Central"
                        minLength={2}
                        required
                      />
                    </label>
                    <label>
                      Agrupamento
                      <input
                        type="text"
                        value={newSchool.group}
                        onChange={(event) => updateNewSchoolField('group', event.target.value)}
                        placeholder="Opcional"
                      />
                    </label>
                    <label>
                      Morada
                      <input
                        type="text"
                        value={newSchool.address}
                        onChange={(event) => updateNewSchoolField('address', event.target.value)}
                        placeholder="Rua, número e complemento"
                        required
                      />
                    </label>
                    <div className="form-row">
                      <label>
                        Código postal
                        <input
                          type="text"
                          inputMode="numeric"
                          value={newSchool.postalCode}
                          onChange={(event) => updatePostalCode(event.target.value)}
                          placeholder="0000-000"
                          maxLength={8}
                          required
                        />
                      </label>
                      <label>
                        Localidade
                        <input
                          type="text"
                          value={newSchool.locality}
                          onChange={(event) => updateNewSchoolField('locality', event.target.value)}
                          placeholder="Localidade"
                          required
                        />
                      </label>
                    </div>
                    <div className="form-row student-main-row">
                      <label>
                        Telefone 1
                        <input
                          type="tel"
                          value={newSchool.phone1}
                          onChange={(event) => updateNewSchoolField('phone1', event.target.value)}
                          placeholder="Obrigatório"
                          required
                        />
                      </label>
                      <label>
                        Telefone 2
                        <input
                          type="tel"
                          value={newSchool.phone2}
                          onChange={(event) => updateNewSchoolField('phone2', event.target.value)}
                          placeholder="Opcional"
                        />
                      </label>
                      <label>
                        Telefone 3
                        <input
                          type="tel"
                          value={newSchool.phone3}
                          onChange={(event) => updateNewSchoolField('phone3', event.target.value)}
                          placeholder="Opcional"
                        />
                      </label>
                    </div>
                    <label>
                      Nome da diretora
                      <input
                        type="text"
                        value={newSchool.directorName}
                        onChange={(event) => updateNewSchoolField('directorName', event.target.value)}
                        placeholder="Nome completo"
                        required
                      />
                    </label>
                    <label>
                      Contactos da diretora
                      <input
                        type="text"
                        value={newSchool.directorContacts}
                        onChange={(event) => updateNewSchoolField('directorContacts', event.target.value)}
                        placeholder="Opcional: telefone, email ou extensão"
                      />
                    </label>
                    <button type="submit" disabled={isLoadingSchools}>
                      {isLoadingSchools
                        ? 'A guardar...'
                        : editingSchoolId ? 'Guardar alterações' : 'Criar escola'}
                    </button>
                  </form>
                </section>
              </div>
            )}

            {isCreateYearModalOpen && (
              <div className="modal-backdrop" role="presentation">
                <section className="modal-card small-modal-card" aria-labelledby="create-year-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={() => {
                      setIsCreateYearModalOpen(false)
                      setEditingYearId(null)
                    }}
                  >
                    ×
                  </button>
                  <h2 id="create-year-title">
                    {editingYearId ? 'Editar ano letivo' : 'Criar novo ano letivo'}
                  </h2>
                  <form onSubmit={handleCreateAcademicYear}>
                    <label>
                      Ano letivo
                      <select
                        value={selectedAcademicYear}
                        onChange={(event) => setSelectedAcademicYear(event.target.value)}
                        autoFocus
                        required
                      >
                        {academicYearOptions.map((year) => (
                          <option key={year.value} value={year.value}>
                            {year.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Organização do ano letivo
                      <select
                        value={yearPeriodType}
                        onChange={(e) => setYearPeriodType(e.target.value as AcademicPeriodType)}
                        required
                      >
                        <option value="semestres">Semestres</option>
                        <option value="trimestres">Trimestres</option>
                      </select>
                    </label>
                    <button type="submit" disabled={isLoadingYears}>
                      {isLoadingYears
                        ? 'A guardar...'
                        : editingYearId ? 'Guardar alterações' : 'Criar ano letivo'}
                    </button>
                  </form>
                </section>
              </div>
            )}

            {isCreateClassModalOpen && (
              <div className="modal-backdrop" role="presentation">
                <section className="modal-card class-modal-card" aria-labelledby="create-class-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={() => {
                      setIsCreateClassModalOpen(false)
                      resetClassForm()
                    }}
                  >
                    ×
                  </button>
                  <h2 id="create-class-title">
                    {editingClassId ? 'Editar turma' : 'Criar nova turma'}
                  </h2>
                  <form onSubmit={handleSaveClass}>
                    <div className="form-row">
                      <label>
                        Ano
                        <input
                          type="number"
                          value={newClass.classYear}
                          onChange={(event) => updateNewClassField('classYear', event.target.value)}
                          placeholder="Ex: 7"
                          min={1}
                          max={12}
                          autoFocus
                          required
                        />
                      </label>
                      <label>
                        Letra da turma
                        <input
                          type="text"
                          value={newClass.classLetter}
                          onChange={(event) => updateNewClassField('classLetter', event.target.value.toUpperCase())}
                          placeholder="Ex: A"
                          maxLength={3}
                          required
                        />
                      </label>
                      <label>
                        Diretora de turma
                        <input
                          type="text"
                          value={newClass.directorName}
                          onChange={(event) => updateNewClassField('directorName', event.target.value)}
                          placeholder="Nome completo"
                          required
                        />
                      </label>
                    </div>

                    {!editingClassId && (
                    <section className="students-form-section" aria-label="Alunos da turma">
                      <div className="students-form-header">
                        <div>
                          <h3>Alunos</h3>
                          <p>Adiciona os alunos que devem ficar associados à turma.</p>
                        </div>
                        <button type="button" className="secondary-button" onClick={openStudentModal}>
                          Adicionar aluno
                        </button>
                      </div>

                      {newClass.students.length === 0 ? (
                        <p className="students-empty-state">Ainda não adicionaste alunos a esta turma.</p>
                      ) : (
                        <div className="students-form-list">
                          {newClass.students.map((student, index) => (
                            <article className="student-form-card" key={student.id}>
                              <div className="student-form-title">
                                <strong>{student.name}</strong>
                                <button
                                  type="button"
                                  className="transparent-button"
                                  onClick={() => removeStudentFromClassForm(index)}
                                >
                                  Remover
                                </button>
                              </div>
                              <dl className="student-summary">
                                <div>
                                  <dt>ID</dt>
                                  <dd>{student.id}</dd>
                                </div>
                                <div>
                                  <dt>Número</dt>
                                  <dd>{student.schoolNumber}</dd>
                                </div>
                                <div>
                                  <dt>Email escolar</dt>
                                  <dd>{student.schoolEmail}</dd>
                                </div>
                                <div>
                                  <dt>EE</dt>
                                  <dd>{student.guardianName}</dd>
                                </div>
                              </dl>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                    )}

                    <button type="submit" disabled={isLoadingClasses}>
                      {isLoadingClasses
                        ? 'A guardar...'
                        : editingClassId ? 'Guardar alterações' : 'Gravar turma'}
                    </button>
                  </form>
                </section>
              </div>
            )}

            {isEvaluationMomentModalOpen && (
              <div className="modal-backdrop" role="presentation">
                <section className="modal-card small-modal-card" aria-labelledby="create-evaluation-moment-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={closeEvaluationMomentModal}
                  >
                    ×
                  </button>
                  <h2 id="create-evaluation-moment-title">
                    {editingEvaluationMomentId
                      ? 'Editar Momento de Avaliação'
                      : 'Inserir Momento de Avaliação'}
                  </h2>
                  {classesError && <p className="modal-feedback error">{classesError}</p>}
                  <form onSubmit={handleSaveEvaluationMoment}>
                    <label>
                      Nome do momento de avaliação
                      <input
                        type="text"
                        value={newEvaluationMoment.name}
                        onChange={(event) => updateEvaluationMomentField('name', event.target.value)}
                        placeholder="Ex: Teste 1"
                        autoFocus
                        required
                      />
                    </label>
                    <div className="form-row three-columns">
                      <label>
                        Tipo
                        <select
                          value={newEvaluationMoment.type}
                          onChange={(event) =>
                            updateEvaluationMomentField(
                              'type',
                              event.target.value === 'questao-aula' ? 'questao-aula' : 'teste',
                            )
                          }
                          required
                        >
                          <option value="teste">Teste</option>
                          <option value="questao-aula">Questão aula</option>
                        </select>
                      </label>
                      <label>
                        Semestre
                        <select
                          value={newEvaluationMoment.semester}
                          onChange={(event) =>
                            updateEvaluationMomentField(
                              'semester',
                              event.target.value === '2' ? '2' : '1',
                            )
                          }
                          required
                        >
                          <option value="1">1.º semestre</option>
                          <option value="2">2.º semestre</option>
                        </select>
                      </label>
                      <label>
                        Valor total das questões
                        <select
                          value={newEvaluationMoment.totalValue}
                          onChange={(event) =>
                            updateEvaluationMomentField(
                              'totalValue',
                              event.target.value === '100' ? 100 : 20,
                            )
                          }
                          required
                        >
                          <option value={20}>20</option>
                          <option value={100}>100</option>
                        </select>
                      </label>
                    </div>
                    {newEvaluationMoment.questions.length > 0 && (
                      <section className="evaluation-questions-section" aria-label="Lista de questões">
                        <div className="evaluation-questions-header">
                          <h3>Questões</h3>
                          <span>
                            Total das questões: {getEvaluationQuestionsTotal()} /{' '}
                            {newEvaluationMoment.totalValue}
                          </span>
                        </div>
                        <div className="evaluation-questions-table" role="table" aria-label="Questões">
                          <div className="evaluation-questions-row evaluation-questions-table-head" role="row">
                            <span role="columnheader">N.º questão</span>
                            <span role="columnheader">Valor</span>
                            <span role="columnheader">Ações</span>
                          </div>
                          {newEvaluationMoment.questions.map((question, index) => (
                            <div className="evaluation-questions-row" role="row" key={index}>
                              <span role="cell">{question.questionNumber}</span>
                              <span role="cell">{question.value}</span>
                              <span role="cell">
                                <button
                                  type="button"
                                  className="transparent-button"
                                  onClick={() => removeEvaluationQuestion(index)}
                                >
                                  Remover
                                </button>
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={openEvaluationQuestionModal}
                    >
                      Inserir lista de questões
                    </button>
                    <button type="submit" disabled={isLoadingClasses}>
                      {isLoadingClasses
                        ? 'A guardar...'
                        : editingEvaluationMomentId
                          ? 'Guardar alterações'
                          : 'Gravar momento de avaliação'}
                    </button>
                  </form>
                </section>
              </div>
            )}

            {isEvaluationQuestionModalOpen && (
              <div className="modal-backdrop student-modal-backdrop" role="presentation">
                <section className="modal-card small-modal-card" aria-labelledby="create-evaluation-question-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={closeEvaluationQuestionModal}
                  >
                    ×
                  </button>
                  <h2 id="create-evaluation-question-title">Inserir questão</h2>
                  <form onSubmit={handleSaveEvaluationQuestion}>
                    <label>
                      N.º da questão
                      <input
                        type="text"
                        value={newEvaluationQuestion.questionNumber}
                        onChange={(event) =>
                          updateNewEvaluationQuestion('questionNumber', event.target.value)
                        }
                        placeholder="Ex: 1"
                        autoFocus
                        required
                      />
                    </label>
                    <label>
                      Valor da questão
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newEvaluationQuestion.value}
                        onChange={(event) =>
                          updateNewEvaluationQuestion('value', event.target.value)
                        }
                        placeholder="Ex: 5"
                        required
                      />
                    </label>
                    <button type="submit">Gravar questão</button>
                  </form>
                </section>
              </div>
            )}

            {isCalendarTaskModalOpen && selectedStudentCalendarDay && (
              <div className="modal-backdrop student-modal-backdrop" role="presentation">
                <section className="modal-card calendar-task-modal-card" aria-labelledby="calendar-task-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={closeStudentCalendarTaskModal}
                  >
                    ×
                  </button>
                  <h2 id="calendar-task-title">Tarefas do calendário</h2>
                  {classesError && <p className="modal-feedback error">{classesError}</p>}
                  {selectedStudentCalendarTasks.length > 0 && (
                    <section className="calendar-task-summary" aria-label="Tarefas existentes">
                      <h3>{getStudentCalendarDayLabel(selectedStudentCalendarDay.date)}</h3>
                      <div className="calendar-task-summary-list">
                        {selectedStudentCalendarTasks.map((task, taskIndex) => (
                          <article
                            className="calendar-task-summary-card"
                            key={String(task._id ?? `task-${taskIndex}`)}
                          >
                            <strong>{getStudentCalendarTaskTitle(task)}</strong>
                            <span>
                              {getStudentCalendarTaskStartTime(task)} - {getStudentCalendarTaskEndTime(task)}
                            </span>
                            <p>{getStringValue(task.description)}</p>
                          </article>
                        ))}
                      </div>
                      {!isCreatingCalendarTask && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={openNewStudentCalendarTaskForm}
                        >
                          Nova tarefa
                        </button>
                      )}
                    </section>
                  )}
                  {isCreatingCalendarTask && (
                    <form onSubmit={handleSaveStudentCalendarTask}>
                      <label>
                        Dia
                        <input
                          type="text"
                          value={getStudentCalendarDayLabel(selectedStudentCalendarDay.date)}
                          readOnly
                        />
                      </label>
                      <label>
                        Título
                        <input
                          type="text"
                          value={newStudentCalendarTask.title}
                          onChange={(event) => updateStudentCalendarTaskField('title', event.target.value)}
                          placeholder="Ex: Entrega de trabalho"
                          autoFocus
                          required
                        />
                      </label>
                      <label>
                        Descrição
                        <textarea
                          value={newStudentCalendarTask.description}
                          onChange={(event) => updateStudentCalendarTaskField('description', event.target.value)}
                          placeholder="Detalhes da tarefa"
                          required
                        />
                      </label>
                      <div className="form-row">
                        <label>
                          Hora de início
                          <input
                            type="time"
                            value={newStudentCalendarTask.startTime}
                            onChange={(event) => updateStudentCalendarTaskField('startTime', event.target.value)}
                            required
                          />
                        </label>
                        <label>
                          Hora de fim
                          <input
                            type="time"
                            value={newStudentCalendarTask.endTime}
                            onChange={(event) => updateStudentCalendarTaskField('endTime', event.target.value)}
                            required
                          />
                        </label>
                      </div>
                      <button type="submit" disabled={isLoadingClasses}>
                        {isLoadingClasses ? 'A guardar...' : 'Gravar'}
                      </button>
                    </form>
                  )}
                </section>
              </div>
            )}

            {isStudentModalOpen && (
              <div className="modal-backdrop student-modal-backdrop" role="presentation">
                <section className="modal-card student-modal-card" aria-labelledby="create-student-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={closeStudentModal}
                  >
                    ×
                  </button>
                  <h2 id="create-student-title">
                    {editingStudentId ? 'Editar aluno' : 'Adicionar aluno'}
                  </h2>
                  {classesError && <p className="modal-feedback error">{classesError}</p>}
                  <form onSubmit={handleSaveStudent}>
                    <div className="form-row three-columns">
                      <label>
                        ID único
                        <input type="number" value={newStudent.id} readOnly />
                      </label>
                      <label>
                        Nome do aluno
                        <input
                          type="text"
                          value={newStudent.name}
                          onChange={(event) => updateNewStudentField('name', event.target.value)}
                          placeholder="Nome completo"
                          autoFocus
                          required
                        />
                      </label>
                      <label>
                        Número na escola
                        <input
                          type="text"
                          value={newStudent.schoolNumber}
                          onChange={(event) => updateNewStudentField('schoolNumber', event.target.value)}
                          placeholder="Ex: 12345"
                          required
                        />
                      </label>
                    </div>
                    <label>
                      Email escolar
                      <input
                        type="email"
                        value={newStudent.schoolEmail}
                        onChange={(event) => updateNewStudentField('schoolEmail', event.target.value)}
                        placeholder="aluno@escola.pt"
                        required
                      />
                    </label>
                    <div className="form-row three-columns">
                      <label>
                        Encarregado de educação
                        <input
                          type="text"
                          value={newStudent.guardianName}
                          onChange={(event) => updateNewStudentField('guardianName', event.target.value)}
                          placeholder="Nome completo"
                          required
                        />
                      </label>
                      <label>
                        Contacto do EE
                        <input
                          type="tel"
                          value={newStudent.guardianPhone}
                          onChange={(event) => updateNewStudentField('guardianPhone', event.target.value)}
                          placeholder="Telefone"
                          required
                        />
                      </label>
                      <label>
                        Email do EE
                        <input
                          type="email"
                          value={newStudent.guardianEmail}
                          onChange={(event) => updateNewStudentField('guardianEmail', event.target.value)}
                          placeholder="encarregado@example.com"
                          required
                        />
                      </label>
                    </div>
                    <button type="submit" disabled={isLoadingClasses}>
                      {isLoadingClasses
                        ? 'A guardar...'
                        : editingStudentId ? 'Guardar alterações' : 'Gravar aluno'}
                    </button>
                  </form>
                </section>
              </div>
            )}
          </section>
        </section>
      ) : (
        <section className="login-card" aria-labelledby="auth-title">
          {authMode === 'login' ? (
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-heading">
              <h1 id="auth-title">School Management</h1>
            </div>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="utilizador@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="A tua password"
                required
              />
            </label>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'A entrar...' : 'Entrar'}
            </button>
            <p className="auth-switch">
              Ainda não tens conta?{' '}
              <button type="button" onClick={() => switchAuthMode('register')}>
                Criar novo utilizador
              </button>
            </p>
          </form>
        ) : (
          <form className="login-form register-form" onSubmit={handleRegister}>
            <div className="login-heading">
              <h1 id="auth-title">School Management</h1>
            </div>

            <label>
              Nome
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome do utilizador"
                minLength={3}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="utilizador@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 8 caracteres e 1 símbolo"
                minLength={8}
                required
              />
              <span className={`password-strength ${passwordStrength.level}`}>
                <span className="password-strength-track" aria-hidden="true">
                  <span style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                </span>
                {passwordStrength.label}
              </span>
            </label>
            <label>
              Confirmar password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repete a password"
                minLength={8}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <span className="password-match-error">As passwords não coincidem.</span>
              )}
            </label>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'A criar...' : 'Criar utilizador'}
            </button>
            <p className="auth-switch">
              Já tens conta?{' '}
              <button type="button" onClick={() => switchAuthMode('login')}>
                Entrar
              </button>
            </p>
          </form>
          )}

          {message && <p className="feedback success">{message}</p>}
          {error && <p className="feedback error">{error}</p>}
        </section>
      )}
    </main>
  )
}

export default App
