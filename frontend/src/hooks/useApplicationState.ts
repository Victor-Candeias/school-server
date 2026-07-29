import { useState } from 'react'
import type { LoginResponse } from '../api/auth'
import type { PercentageRange } from '../api/school'
import type { SchoolDocument } from '../api/school'
import type { AcademicPeriod } from '../types'
import type { AcademicPeriodType } from '../types'
import type { ChartType } from '../types'
import type { ClassForm } from '../types'
import type { DashboardSection } from '../types'
import type { EvaluationMomentForm } from '../types'
import type { EvaluationMomentTemplate } from '../types'
import type { EvaluationQuestionForm } from '../types'
import type { SchoolForm } from '../types'
import type { StudentCalendarDay } from '../types'
import type { StudentCalendarTaskForm } from '../types'
import type { StudentCalendarWeekMode } from '../types'
import type { StudentForm } from '../types'
import type { StudentsMenuOption } from '../types'
import { CALENDAR_WEEKDAYS } from '../utils/constants'
import { CALENDAR_WORK_WEEKDAY_COUNT } from '../utils/constants'
import { DEFAULT_ACADEMIC_PERIOD_TYPE } from '../utils/constants'
import { DEFAULT_INACTIVITY_LOGOUT_MINUTES } from '../utils/constants'
import { DEFAULT_EVALUATION_MOMENT_TEMPLATES } from '../utils/constants'
import { DEFAULT_MESSAGE_TIMEOUT_SECONDS } from '../utils/constants'
import { DEFAULT_PERCENTAGE_RANGES } from '../utils/constants'
import { EMPTY_CLASS_FORM } from '../utils/constants'
import { EMPTY_EVALUATION_MOMENT_FORM } from '../utils/constants'
import { EMPTY_EVALUATION_QUESTION_FORM } from '../utils/constants'
import { EMPTY_SCHOOL_FORM } from '../utils/constants'
import { EMPTY_STUDENT_CALENDAR_TASK_FORM } from '../utils/constants'
import { EMPTY_STUDENT_FORM } from '../utils/constants'
import { buildDefaultSemesterPeriods } from '../utils/constants'
import { buildDefaultTrimesterPeriods } from '../utils/constants'
import { getPasswordStrength } from '../utils/validation'
import { getAcademicYearOptions } from '../utils/formatting'
import { getDefaultStudentCalendarWeekMode } from '../utils/calendar'
import { getStudentCalendarDays } from '../utils/calendar'

export function useApplicationState() {
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
const [evaluationMomentTemplates, setEvaluationMomentTemplates] =
    useState<EvaluationMomentTemplate[]>(DEFAULT_EVALUATION_MOMENT_TEMPLATES)
const [academicPeriodType, setAcademicPeriodType] = useState<AcademicPeriodType>(
    DEFAULT_ACADEMIC_PERIOD_TYPE,
  )
const [semesterPeriods, setSemesterPeriods] = useState<AcademicPeriod[]>(buildDefaultSemesterPeriods)
const [trimesterPeriods, setTrimesterPeriods] = useState<AcademicPeriod[]>(buildDefaultTrimesterPeriods)
const [savedAppSettingsFingerprint, setSavedAppSettingsFingerprint] = useState<string | null>(null)
const [yearPeriodType, setYearPeriodType] = useState<AcademicPeriodType>(DEFAULT_ACADEMIC_PERIOD_TYPE)
const passwordStrength = getPasswordStrength(password)
const isStudentCalendarFullWeek = studentCalendarWeekMode === 'full'
  const visibleStudentCalendarWeekdays = isStudentCalendarFullWeek
    ? CALENDAR_WEEKDAYS
    : CALENDAR_WEEKDAYS.slice(0, CALENDAR_WORK_WEEKDAY_COUNT)
  const studentCalendarDays = getStudentCalendarDays(
    studentCalendarDate,
    isStudentCalendarFullWeek,
  )

  return {
    darkMode,
    setDarkMode,
    authMode,
    setAuthMode,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    user,
    setUser,
    message,
    setMessage,
    error,
    setError,
    isLoading,
    setIsLoading,
    schools,
    setSchools,
    schoolsError,
    setSchoolsError,
    isLoadingSchools,
    setIsLoadingSchools,
    academicYears,
    setAcademicYears,
    allAcademicYears,
    setAllAcademicYears,
    allClasses,
    setAllClasses,
    allStudents,
    setAllStudents,
    allEvaluationMoments,
    setAllEvaluationMoments,
    allStudentMomentValues,
    setAllStudentMomentValues,
    studentCalendarTasks,
    setStudentCalendarTasks,
    yearsError,
    setYearsError,
    isLoadingYears,
    setIsLoadingYears,
    classesError,
    setClassesError,
    isLoadingClasses,
    setIsLoadingClasses,
    isCreateYearModalOpen,
    setIsCreateYearModalOpen,
    isCreateClassModalOpen,
    setIsCreateClassModalOpen,
    isStudentModalOpen,
    setIsStudentModalOpen,
    isEvaluationMomentModalOpen,
    setIsEvaluationMomentModalOpen,
    isEvaluationQuestionModalOpen,
    setIsEvaluationQuestionModalOpen,
    isCalendarTaskModalOpen,
    setIsCalendarTaskModalOpen,
    isCreatingCalendarTask,
    setIsCreatingCalendarTask,
    editingYearId,
    setEditingYearId,
    editingClassId,
    setEditingClassId,
    editingStudentId,
    setEditingStudentId,
    editingEvaluationMomentId,
    setEditingEvaluationMomentId,
    studentActionMenuId,
    setStudentActionMenuId,
    activeStudentsMenuOption,
    setActiveStudentsMenuOption,
    studentCalendarDate,
    setStudentCalendarDate,
    studentCalendarWeekMode,
    setStudentCalendarWeekMode,
    selectedStudentCalendarDay,
    setSelectedStudentCalendarDay,
    newStudentCalendarTask,
    setNewStudentCalendarTask,
    selectedGradingMomentId,
    setSelectedGradingMomentId,
    selectedAssessmentsSemester,
    setSelectedAssessmentsSemester,
    assessmentCellDrafts,
    setAssessmentCellDrafts,
    chartStudentId,
    setChartStudentId,
    chartType,
    setChartType,
    chartMomentId,
    setChartMomentId,
    selectedAcademicYearDocument,
    setSelectedAcademicYearDocument,
    academicYearOptions,
    selectedAcademicYear,
    setSelectedAcademicYear,
    newSchool,
    setNewSchool,
    newClass,
    setNewClass,
    newStudent,
    setNewStudent,
    newEvaluationMoment,
    setNewEvaluationMoment,
    newEvaluationQuestion,
    setNewEvaluationQuestion,
    isCreateSchoolModalOpen,
    setIsCreateSchoolModalOpen,
    editingSchoolId,
    setEditingSchoolId,
    selectedSchool,
    setSelectedSchool,
    selectedClass,
    setSelectedClass,
    activeDashboard,
    setActiveDashboard,
    inactiveLogoutMinutes,
    setInactiveLogoutMinutes,
    messageTimeoutSeconds,
    setMessageTimeoutSeconds,
    percentageRanges,
    setPercentageRanges,
    evaluationMomentTemplates,
    setEvaluationMomentTemplates,
    academicPeriodType,
    setAcademicPeriodType,
    semesterPeriods,
    setSemesterPeriods,
    trimesterPeriods,
    setTrimesterPeriods,
    savedAppSettingsFingerprint,
    setSavedAppSettingsFingerprint,
    yearPeriodType,
    setYearPeriodType,
    passwordStrength,
    isStudentCalendarFullWeek,
    visibleStudentCalendarWeekdays,
    studentCalendarDays,
  }
}

export type ApplicationStateModel = ReturnType<typeof useApplicationState>
