export type SchoolForm = {
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

export type StudentForm = {
  id: number
  name: string
  schoolNumber: string
  schoolEmail: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  active: boolean
}

export type EvaluationMomentForm = {
  name: string
  templateId: string
  semester: '1' | '2'
  totalValue: 20 | 100
  questions: EvaluationQuestionForm[]
}

export type EvaluationQuestionForm = {
  questionNumber: string
  value: string
}

export type StudentCalendarTaskForm = {
  title: string
  description: string
  startTime: string
  endTime: string
}

export type ClassForm = {
  classYear: string
  classLetter: string
  directorName: string
  students: StudentForm[]
}

export type DashboardSection = 'schools' | 'years' | 'classes' | 'students' | 'settings'

export type StudentsMenuOption = 0 | 1 | 2 | 3 | 4 | 5

export type ChartType = 'bar' | 'line' | 'area' | 'radar'

export type StudentCalendarWeekMode = 'work' | 'full'

export type AcademicPeriodType = 'semestres' | 'trimestres'

export type AcademicPeriod = {
  id: string
  label: string
  startDate: string
  endDate: string
}

export type EvaluationMomentTemplate = {
  id: string
  type: string
  weightPercentage: number
  backgroundColor: string
  averageBackgroundColor: string
  weightedBackgroundColor: string
  textColor: string
}

export type AcademicYearOption = {
  value: string
  label: string
  startYear: number
  endYear: number
}

export type StudentCalendarDay = {
  date: Date
  day: number
  isCurrentMonth: boolean
  isWeekend: boolean
  isToday: boolean
  key: string
}

export type PasswordStrength = {
  label: string
  level: 'empty' | 'weak' | 'medium' | 'strong'
  score: number
}
