import type { PercentageRange } from '../api/school'
import type {
  AcademicPeriod,
  AcademicPeriodType,
  ClassForm,
  EvaluationMomentTemplate,
  EvaluationMomentForm,
  EvaluationQuestionForm,
  SchoolForm,
  StudentCalendarTaskForm,
  StudentForm,
  StudentsMenuOption,
} from '../types'

export const DEFAULT_INACTIVITY_LOGOUT_MINUTES = 15

export const DEFAULT_MESSAGE_TIMEOUT_SECONDS = 5

export const DEFAULT_REGISTER_ROLE = 'user'

export const INACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const

export const DEFAULT_PERCENTAGE_RANGES: PercentageRange[] = [
  { id: 'very-low', min: 0, max: 10, backgroundColor: '#dc2626', textColor: '#ffffff' },
  { id: 'low', min: 11, max: 39, backgroundColor: '#fdba74', textColor: '#7c2d12' },
  { id: 'mid-low', min: 40, max: 49, backgroundColor: '#fde68a', textColor: '#713f12' },
  { id: 'mid', min: 50, max: 69, backgroundColor: '#bbf7d0', textColor: '#14532d' },
  { id: 'high', min: 70, max: 85, backgroundColor: '#15803d', textColor: '#ffffff' },
  { id: 'very-high', min: 86, max: 100, backgroundColor: '#ddd6fe', textColor: '#4c1d95' },
]

export const DEFAULT_EVALUATION_MOMENT_TEMPLATES: EvaluationMomentTemplate[] = []

export const DEFAULT_ACADEMIC_PERIOD_TYPE: AcademicPeriodType = 'semestres'

export function buildDefaultSemesterPeriods(): AcademicPeriod[] {
  const y = new Date().getFullYear()
  const y1 = y + 1
  return [
    { id: 'sem1', label: '1.º Semestre', startDate: `${y}-09-01`, endDate: `${y1}-02-15` },
    { id: 'sem2', label: '2.º Semestre', startDate: `${y1}-01-02`, endDate: `${y1}-06-15` },
  ]
}

export function buildDefaultTrimesterPeriods(): AcademicPeriod[] {
  const y = new Date().getFullYear()
  const y1 = y + 1
  return [
    { id: 'trim1', label: '1.º Trimestre', startDate: `${y}-09-01`,  endDate: `${y}-12-15`  },
    { id: 'trim2', label: '2.º Trimestre', startDate: `${y1}-01-02`, endDate: `${y1}-03-15` },
    { id: 'trim3', label: '3.º Trimestre', startDate: `${y1}-04-01`, endDate: `${y1}-06-15` },
  ]
}

export const STUDENTS_MENU_OPTIONS: { id: StudentsMenuOption; label: string }[] = [
  { id: 0, label: 'Calendário' },
  { id: 1, label: 'Alunos' },
  { id: 2, label: 'Momento de Avaliação' },
  { id: 3, label: 'Alunos/M.Avaliação' },
  { id: 4, label: 'Avaliações' },
  { id: 5, label: 'Gráficos' },
]

export const CALENDAR_WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export const CALENDAR_WORK_WEEKDAY_COUNT = 5

export const EMPTY_SCHOOL_FORM: SchoolForm = {
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

export const EMPTY_CLASS_FORM: ClassForm = {
  classYear: '',
  classLetter: '',
  directorName: '',
  students: [],
}

export const EMPTY_STUDENT_FORM: StudentForm = {
  id: 1,
  name: '',
  schoolNumber: '',
  schoolEmail: '',
  guardianName: '',
  guardianPhone: '',
  guardianEmail: '',
  active: true,
}

export const EMPTY_EVALUATION_MOMENT_FORM: EvaluationMomentForm = {
  name: '',
  type: 'teste',
  semester: '1',
  totalValue: 20,
  questions: [],
}

export const EMPTY_EVALUATION_QUESTION_FORM: EvaluationQuestionForm = {
  questionNumber: '',
  value: '',
}

export const EMPTY_STUDENT_CALENDAR_TASK_FORM: StudentCalendarTaskForm = {
  title: '',
  description: '',
  startTime: '08:00',
  endTime: '09:00',
}
