import type { SchoolDocument } from '../api/school'
import type { LoginResponse } from '../api/auth'
import type { PercentageRange } from '../api/school'
import type { FormEvent } from 'react'
import type {
  AcademicPeriod,
  AcademicPeriodType,
  ChartType,
  ClassForm,
  DashboardSection,
  EvaluationMomentForm,
  EvaluationMomentTemplate,
  EvaluationQuestionForm,
  SchoolForm,
  StudentCalendarDay,
  StudentCalendarTaskForm,
  StudentCalendarWeekMode,
  StudentForm,
  StudentsMenuOption,
} from '../types'

export type ApplicationState = {
  darkMode: boolean
  setDarkMode: import("react").Dispatch<import("react").SetStateAction<boolean>>
  authMode: "login" | "register"
  setAuthMode: import("react").Dispatch<import("react").SetStateAction<"login" | "register">>
  name: string
  setName: import("react").Dispatch<import("react").SetStateAction<string>>
  email: string
  setEmail: import("react").Dispatch<import("react").SetStateAction<string>>
  password: string
  setPassword: import("react").Dispatch<import("react").SetStateAction<string>>
  confirmPassword: string
  setConfirmPassword: import("react").Dispatch<import("react").SetStateAction<string>>
  user: LoginResponse | null
  setUser: import("react").Dispatch<import("react").SetStateAction<LoginResponse | null>>
  message: string | null
  setMessage: import("react").Dispatch<import("react").SetStateAction<string | null>>
  error: string | null
  setError: import("react").Dispatch<import("react").SetStateAction<string | null>>
  isLoading: boolean
  setIsLoading: import("react").Dispatch<import("react").SetStateAction<boolean>>
  schools: SchoolDocument[]
  setSchools: import("react").Dispatch<import("react").SetStateAction<SchoolDocument[]>>
  schoolsError: string | null
  setSchoolsError: import("react").Dispatch<import("react").SetStateAction<string | null>>
  isLoadingSchools: boolean
  setIsLoadingSchools: import("react").Dispatch<import("react").SetStateAction<boolean>>
  academicYears: SchoolDocument[]
  setAcademicYears: import("react").Dispatch<import("react").SetStateAction<SchoolDocument[]>>
  allAcademicYears: SchoolDocument[]
  setAllAcademicYears: import("react").Dispatch<import("react").SetStateAction<SchoolDocument[]>>
  allClasses: SchoolDocument[]
  setAllClasses: import("react").Dispatch<import("react").SetStateAction<SchoolDocument[]>>
  allStudents: SchoolDocument[]
  setAllStudents: import("react").Dispatch<import("react").SetStateAction<SchoolDocument[]>>
  allEvaluationMoments: SchoolDocument[]
  setAllEvaluationMoments: import("react").Dispatch<import("react").SetStateAction<SchoolDocument[]>>
  allStudentMomentValues: SchoolDocument[]
  setAllStudentMomentValues: import("react").Dispatch<import("react").SetStateAction<SchoolDocument[]>>
  studentCalendarTasks: SchoolDocument[]
  setStudentCalendarTasks: import("react").Dispatch<import("react").SetStateAction<SchoolDocument[]>>
  yearsError: string | null
  setYearsError: import("react").Dispatch<import("react").SetStateAction<string | null>>
  isLoadingYears: boolean
  setIsLoadingYears: import("react").Dispatch<import("react").SetStateAction<boolean>>
  classesError: string | null
  setClassesError: import("react").Dispatch<import("react").SetStateAction<string | null>>
  isLoadingClasses: boolean
  setIsLoadingClasses: import("react").Dispatch<import("react").SetStateAction<boolean>>
  isCreateYearModalOpen: boolean
  setIsCreateYearModalOpen: import("react").Dispatch<import("react").SetStateAction<boolean>>
  isCreateClassModalOpen: boolean
  setIsCreateClassModalOpen: import("react").Dispatch<import("react").SetStateAction<boolean>>
  isStudentModalOpen: boolean
  setIsStudentModalOpen: import("react").Dispatch<import("react").SetStateAction<boolean>>
  isEvaluationMomentModalOpen: boolean
  setIsEvaluationMomentModalOpen: import("react").Dispatch<import("react").SetStateAction<boolean>>
  isEvaluationQuestionModalOpen: boolean
  setIsEvaluationQuestionModalOpen: import("react").Dispatch<import("react").SetStateAction<boolean>>
  isCalendarTaskModalOpen: boolean
  setIsCalendarTaskModalOpen: import("react").Dispatch<import("react").SetStateAction<boolean>>
  isSettingsConfirmationOpen: boolean
  setIsSettingsConfirmationOpen: import("react").Dispatch<import("react").SetStateAction<boolean>>
  isCreatingCalendarTask: boolean
  setIsCreatingCalendarTask: import("react").Dispatch<import("react").SetStateAction<boolean>>
  editingYearId: string | null
  setEditingYearId: import("react").Dispatch<import("react").SetStateAction<string | null>>
  editingClassId: string | null
  setEditingClassId: import("react").Dispatch<import("react").SetStateAction<string | null>>
  editingStudentId: string | null
  setEditingStudentId: import("react").Dispatch<import("react").SetStateAction<string | null>>
  editingEvaluationMomentId: string | null
  setEditingEvaluationMomentId: import("react").Dispatch<import("react").SetStateAction<string | null>>
  studentActionMenuId: string | null
  setStudentActionMenuId: import("react").Dispatch<import("react").SetStateAction<string | null>>
  activeStudentsMenuOption: StudentsMenuOption
  setActiveStudentsMenuOption: import("react").Dispatch<import("react").SetStateAction<StudentsMenuOption>>
  studentCalendarDate: Date
  setStudentCalendarDate: import("react").Dispatch<import("react").SetStateAction<Date>>
  studentCalendarWeekMode: StudentCalendarWeekMode
  setStudentCalendarWeekMode: import("react").Dispatch<import("react").SetStateAction<StudentCalendarWeekMode>>
  selectedStudentCalendarDay: StudentCalendarDay | null
  setSelectedStudentCalendarDay: import("react").Dispatch<import("react").SetStateAction<StudentCalendarDay | null>>
  newStudentCalendarTask: StudentCalendarTaskForm
  setNewStudentCalendarTask: import("react").Dispatch<import("react").SetStateAction<StudentCalendarTaskForm>>
  selectedGradingMomentId: string
  setSelectedGradingMomentId: import("react").Dispatch<import("react").SetStateAction<string>>
  selectedAssessmentsSemester: string
  setSelectedAssessmentsSemester: import("react").Dispatch<import("react").SetStateAction<string>>
  assessmentCellDrafts: Record<string, string>
  setAssessmentCellDrafts: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>>
  chartStudentId: string
  setChartStudentId: import("react").Dispatch<import("react").SetStateAction<string>>
  chartType: ChartType
  setChartType: import("react").Dispatch<import("react").SetStateAction<ChartType>>
  chartMomentId: string
  setChartMomentId: import("react").Dispatch<import("react").SetStateAction<string>>
  selectedAcademicYearDocument: SchoolDocument | null
  setSelectedAcademicYearDocument: import("react").Dispatch<import("react").SetStateAction<SchoolDocument | null>>
  academicYearOptions: import("../types").AcademicYearOption[]
  selectedAcademicYear: string
  setSelectedAcademicYear: import("react").Dispatch<import("react").SetStateAction<string>>
  newSchool: SchoolForm
  setNewSchool: import("react").Dispatch<import("react").SetStateAction<SchoolForm>>
  newClass: ClassForm
  setNewClass: import("react").Dispatch<import("react").SetStateAction<ClassForm>>
  newStudent: StudentForm
  setNewStudent: import("react").Dispatch<import("react").SetStateAction<StudentForm>>
  newEvaluationMoment: EvaluationMomentForm
  setNewEvaluationMoment: import("react").Dispatch<import("react").SetStateAction<EvaluationMomentForm>>
  newEvaluationQuestion: EvaluationQuestionForm
  setNewEvaluationQuestion: import("react").Dispatch<import("react").SetStateAction<EvaluationQuestionForm>>
  isCreateSchoolModalOpen: boolean
  setIsCreateSchoolModalOpen: import("react").Dispatch<import("react").SetStateAction<boolean>>
  editingSchoolId: string | null
  setEditingSchoolId: import("react").Dispatch<import("react").SetStateAction<string | null>>
  selectedSchool: SchoolDocument | null
  setSelectedSchool: import("react").Dispatch<import("react").SetStateAction<SchoolDocument | null>>
  selectedClass: SchoolDocument | null
  setSelectedClass: import("react").Dispatch<import("react").SetStateAction<SchoolDocument | null>>
  activeDashboard: DashboardSection
  setActiveDashboard: import("react").Dispatch<import("react").SetStateAction<DashboardSection>>
  inactiveLogoutMinutes: number
  setInactiveLogoutMinutes: import("react").Dispatch<import("react").SetStateAction<number>>
  messageTimeoutSeconds: number
  setMessageTimeoutSeconds: import("react").Dispatch<import("react").SetStateAction<number>>
  popupBackgroundColor: string
  setPopupBackgroundColor: import("react").Dispatch<import("react").SetStateAction<string>>
  popupTextColor: string
  setPopupTextColor: import("react").Dispatch<import("react").SetStateAction<string>>
  percentageRanges: PercentageRange[]
  setPercentageRanges: import("react").Dispatch<import("react").SetStateAction<PercentageRange[]>>
  evaluationMomentTemplates: EvaluationMomentTemplate[]
  setEvaluationMomentTemplates: import("react").Dispatch<import("react").SetStateAction<EvaluationMomentTemplate[]>>
  academicPeriodType: AcademicPeriodType
  setAcademicPeriodType: import("react").Dispatch<import("react").SetStateAction<AcademicPeriodType>>
  semesterPeriods: AcademicPeriod[]
  setSemesterPeriods: import("react").Dispatch<import("react").SetStateAction<AcademicPeriod[]>>
  trimesterPeriods: AcademicPeriod[]
  setTrimesterPeriods: import("react").Dispatch<import("react").SetStateAction<AcademicPeriod[]>>
  savedAppSettingsFingerprint: string | null
  setSavedAppSettingsFingerprint: import("react").Dispatch<import("react").SetStateAction<string | null>>
  yearPeriodType: AcademicPeriodType
  setYearPeriodType: import("react").Dispatch<import("react").SetStateAction<AcademicPeriodType>>
  passwordStrength: import("../types").PasswordStrength
  isStudentCalendarFullWeek: boolean
  visibleStudentCalendarWeekdays: string[]
  studentCalendarDays: StudentCalendarDay[]
  selectedStudentCalendarTasks: SchoolDocument[]
}

export type AssessmentMomentGroup = {
  type: string
  weightPercentage: number
  moments: SchoolDocument[]
}

export type ApplicationActions = {
  loadSchools: () => Promise<void>
  loadAppSettings: () => Promise<void>
  loadAcademicYears: (school: SchoolDocument) => Promise<void>
  loadAllAcademicYears: () => Promise<void>
  loadAllClasses: () => Promise<void>
  loadAllStudents: () => Promise<void>
  loadAllEvaluationMoments: () => Promise<void>
  loadAllStudentMomentValues: () => Promise<void>
  loadStudentCalendarTasks: (schoolClass?: SchoolDocument | null) => Promise<void>
  saveAppSettings: () => Promise<boolean>
  hasUnsavedAppSettingsChanges: () => boolean
  handleSettingsAction: (event: FormEvent<HTMLFormElement>) => void
  saveAndCloseSettings: () => Promise<void>
  discardAndCloseSettings: () => void
  cancelSettingsClose: () => void
  addEvaluationMomentTemplate: () => void
  updateEvaluationMomentTemplate: (templateId: string, field: "type" | "weightPercentage", value: string) => void
  removeEvaluationMomentTemplate: (templateId: string) => void
  updatePercentageRange: (rangeId: string, field: "min" | "max" | "nota" | "backgroundColor" | "textColor", value: string) => void
  updatePeriodDate: (type: "semestres" | "trimestres", periodId: string, field: "startDate" | "endDate", value: string) => void
  handleCreateAcademicYear: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleSaveSchool: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleSaveClass: (event: FormEvent<HTMLFormElement>) => Promise<void>
  getSchoolPayload: () => { userId: string; schoolId: string; name: string; group: string | undefined; address: { street: string; postalCode: string; locality: string; }; phones: string[]; director: { name: string; contacts: string | undefined; }; }
  updateNewSchoolField: (field: keyof SchoolForm, value: string) => void
  updatePostalCode: (value: string) => void
  updateNewClassField: (field: "classYear" | "classLetter" | "directorName", value: string) => void
  updateNewStudentField: (field: keyof Omit<StudentForm, "id">, value: string) => void
  updateEvaluationMomentField: <Field extends keyof EvaluationMomentForm>(field: Field, value: EvaluationMomentForm[Field]) => void
  updateNewEvaluationQuestion: (field: keyof EvaluationQuestionForm, value: string) => void
  openEvaluationQuestionModal: () => void
  handleSaveEvaluationQuestion: (event: FormEvent<HTMLFormElement>) => void
  closeEvaluationQuestionModal: () => void
  removeEvaluationQuestion: (questionIndex: number) => void
  getEvaluationQuestionsTotal: () => number
  handleSaveEvaluationMoment: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleSaveStudent: (event: FormEvent<HTMLFormElement>) => void
  saveStudentToSelectedClass: () => Promise<void>
  saveExistingStudent: () => Promise<void>
  resetSchoolForm: () => void
  resetClassForm: () => void
  openCreateSchoolModal: () => void
  openEditSchoolModal: (school: SchoolDocument) => void
  openYearsDashboard: (school: SchoolDocument) => void
  openCreateYearModal: () => void
  openCreateClassModal: () => void
  openEditClassModal: (schoolClass: SchoolDocument) => void
  openStudentModal: () => void
  openNewStudentFromDashboard: () => void
  openNewEvaluationMomentModal: () => void
  closeStudentModal: () => void
  closeEvaluationMomentModal: () => void
  openEditEvaluationMomentModal: (moment: SchoolDocument) => void
  deleteEvaluationMoment: (moment: SchoolDocument) => Promise<void>
  openEditStudentModal: (student: SchoolDocument) => void
  deactivateStudent: (student: SchoolDocument) => Promise<void>
  deleteStudent: (student: SchoolDocument) => Promise<void>
  removeStudentFromClassForm: (index: number) => void
  openEditYearModal: (year: SchoolDocument) => void
  deleteYear: (year: SchoolDocument) => Promise<void>
  openClassesDashboard: (year: SchoolDocument) => void
  openStudentsDashboard: (schoolClass: SchoolDocument) => void
  openSettingsDashboard: () => void
  closeSettingsDashboard: () => void
  getDashboardTitle: () => string
  getDashboardDescription: () => "" | "Gere os anos letivos desta escola." | "Gere as turmas deste ano letivo." | "Dashboard dos alunos da turma." | "Cria novas escolas e consulta as escolas existentes."
  getSchoolTitle: (school: SchoolDocument) => string
  getAcademicYearTitle: (year: SchoolDocument) => string
  getSchoolAcademicYearCount: (school: SchoolDocument) => number
  getAcademicYearClassCount: (year: SchoolDocument) => number
  getClassesForAcademicYear: (year: SchoolDocument) => SchoolDocument[]
  getClassTitle: (schoolClass: SchoolDocument) => string
  getClassStudentCount: (schoolClass: SchoolDocument) => number
  getStudentsForClass: (schoolClass: SchoolDocument) => SchoolDocument[]
  getStudentCalendarTaskDate: (task: SchoolDocument) => string
  getStudentCalendarTaskStartTime: (task: SchoolDocument) => string
  getStudentCalendarTaskEndTime: (task: SchoolDocument) => string
  getStudentCalendarTaskTitle: (task: SchoolDocument) => string
  sortStudentCalendarTasks: (tasks: SchoolDocument[]) => SchoolDocument[]
  getStudentCalendarTasksForDate: (date: Date) => SchoolDocument[]
  getNextStudentCalendarTaskForm: (tasks: SchoolDocument[]) => StudentCalendarTaskForm
  hasCalendarTaskTimeConflict: (tasks: SchoolDocument[], startTime: string, endTime: string) => boolean
  openStudentCalendarTaskModal: (calendarDay: StudentCalendarDay) => void
  closeStudentCalendarTaskModal: () => void
  openNewStudentCalendarTaskForm: () => void
  updateStudentCalendarTaskField: (field: keyof StudentCalendarTaskForm, value: string) => void
  getEvaluationMomentsForClass: (schoolClass: SchoolDocument) => SchoolDocument[]
  getEvaluationMomentTypeLabel: (moment: SchoolDocument) => string
  getEvaluationMomentSemester: (moment: SchoolDocument) => "1" | "2"
  getEvaluationMomentQuestionCount: (moment: SchoolDocument) => number
  getEvaluationMomentQuestions: (moment: SchoolDocument) => EvaluationQuestionForm[]
  getSelectedGradingMoment: () => SchoolDocument | undefined
  getStudentMomentValueKey: (momentId: string, studentId: string, questionNumber: string) => string
  getStudentMomentValueRecord: (student: SchoolDocument, moment: SchoolDocument, question: EvaluationQuestionForm) => SchoolDocument | undefined
  isSameStudentMomentValue: (leftValue: SchoolDocument, rightValue: SchoolDocument) => boolean
  mergeStudentMomentValues: (nextValues: SchoolDocument[]) => void
  hasStudentMomentValueRecord: (values: SchoolDocument[], momentId: string, studentId: string, questionNumber: string) => boolean
  buildStudentMomentValuePayload: (student: SchoolDocument, moment: SchoolDocument, question: EvaluationQuestionForm, value: string) => SchoolDocument | null
  handleSaveStudentCalendarTask: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleSelectGradingMoment: (momentId: string) => Promise<void>
  persistCurrentNavigation: () => void
  getSavedStudentMomentCellValue: (student: SchoolDocument, moment: SchoolDocument, question: EvaluationQuestionForm) => string
  getStudentMomentCellValue: (student: SchoolDocument, moment: SchoolDocument, question: EvaluationQuestionForm) => string
  getAssessmentChangePayloads: (moment?: SchoolDocument | undefined) => SchoolDocument[]
  hasUnsavedAssessmentChanges: () => boolean
  canLeaveAssessmentMoment: () => boolean
  handleStudentsMenuOptionChange: (option: StudentsMenuOption) => void
  moveStudentCalendarMonth: (monthOffset: number) => void
  resetStudentCalendarMonth: () => void
  toggleStudentCalendarWeekMode: () => void
  openSettingsDashboardWithAssessmentGuard: () => void
  returnToSchoolsDashboard: () => void
  returnToYearsDashboard: () => void
  returnToClassesDashboard: () => void
  removeAssessmentDraftsForMoment: (momentId: string) => void
  getStudentMomentServerMetric: (student: SchoolDocument, moment: SchoolDocument, metric: 'studentMomentTotal' | 'studentMomentPercentage') => number | null
  getStudentMomentTotal: (student: SchoolDocument, moment: SchoolDocument) => number
  getStudentMomentProcessedPercentageValue: (student: SchoolDocument, moment: SchoolDocument) => number | null
  getStudentMomentPercentage: (student: SchoolDocument, moment: SchoolDocument) => string
  getStudentMomentPercentageValue: (student: SchoolDocument, moment: SchoolDocument) => number
  getStudentMomentPercentageStyle: (student: SchoolDocument, moment: SchoolDocument) => { backgroundColor: string; color: string; }
  getAssessmentsSemesterMoments: () => SchoolDocument[]
  getAssessmentsSemesterMomentGroups: () => AssessmentMomentGroup[]
  getStudentSavedMomentTotal: (student: SchoolDocument, moment: SchoolDocument) => number
  getStudentAssessmentGroupAverage: (student: SchoolDocument, group: AssessmentMomentGroup) => number
  getStudentAssessmentGroupWeightedValue: (student: SchoolDocument, group: AssessmentMomentGroup) => number
  getStudentAssessmentFinalValue: (student: SchoolDocument, groups: AssessmentMomentGroup[]) => number
  formatAssessmentValue: (value: number) => string
  getChartData: (student: SchoolDocument) => { name: string; Nota: number; Máximo: number; '%': number; }[]
  getAllStudentsForMomentData: (students: SchoolDocument[], moment: SchoolDocument) => { name: string; Nota: number; Máximo: number; }[]
  getChartTypeLabel: (type: ChartType) => string
  nextChartType: () => void
  exportChartToPdf: () => void
  getAssessmentsDashboardRows: () => string[][]
  buildSemesterEvaluationsPayload: () => { userId: string; schoolId: string; schoolName: string; yearId: string; academicYearId: string; academicYearName: string; classId: string; className: string; semester: string; title: string; tests: { id: string | null; name: string; totalValue: number; }[]; headers: string[]; rows: string[][]; } | null
  saveSemesterEvaluations: () => Promise<void>
  generateSemesterEvaluationsReport: () => Promise<void>
  getQuestionMaxValue: (question: EvaluationQuestionForm) => number
  getEvaluationMomentMaxValue: (moment: SchoolDocument) => number
  updateAssessmentCellDraft: (student: SchoolDocument, moment: SchoolDocument, question: EvaluationQuestionForm, value: string) => void
  saveAssessmentCell: (student: SchoolDocument, moment: SchoolDocument, question: EvaluationQuestionForm, value: string) => Promise<void>
  saveAssessmentChanges: () => Promise<void>
  generateAssessmentReport: (momentToReport?: SchoolDocument) => Promise<void>
  generateStudentDetailReport: (student: SchoolDocument) => Promise<void>
  generateClassStudentsReport: () => Promise<void>
  getLoggedUserId: () => string
  getNextStudentId: (formStudents: StudentForm[]) => number
  hasAcademicYearChanged: (year: SchoolDocument, payload: SchoolDocument) => boolean
  getSchoolId: (school: SchoolDocument) => string | null
  getDocumentId: (document: SchoolDocument) => string | null
  getStringValue: (value: unknown) => string
  getRecordValue: (value: unknown) => Record<string, unknown>
  getSchoolFormFromDocument: (school: SchoolDocument) => SchoolForm
  handleLogin: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleRegister: (event: FormEvent<HTMLFormElement>) => Promise<void>
  switchAuthMode: (nextMode: "login" | "register") => void
  handleLogout: () => Promise<void>
}

export type ApplicationRuntime = ApplicationState & ApplicationActions
