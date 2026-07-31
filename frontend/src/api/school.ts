import { apiRequest } from './client'
import { API_CONFIG } from './config'
import type { EvaluationMomentTemplate } from '../types'

export type SchoolDocument = Record<string, unknown>

export type AppSettings = {
  inactiveLogoutMinutes: number
  messageTimeoutSeconds: number
  popupBackgroundColor: string
  popupTextColor: string
  errorPopupBackgroundColor: string
  errorPopupTextColor: string
  percentageRanges: PercentageRange[]
  evaluationMomentTemplates?: EvaluationMomentTemplate[]
  academicPeriodType?: string
  semesterPeriods?: unknown[]
  trimesterPeriods?: unknown[]
}

export type PercentageRange = {
  id: string
  min: number
  max: number
  nota: number
  backgroundColor: string
  textColor: string
}

function findCollection<T = SchoolDocument>(path: string, query: Record<string, unknown> = {}) {
  return apiRequest<T[]>(API_CONFIG.schoolBaseUrl, path, {
    method: 'POST',
    body: query,
  })
}

function addDocument(path: string, document: SchoolDocument) {
  return apiRequest<{ message: string; id: string }>(API_CONFIG.schoolBaseUrl, path, {
    method: 'POST',
    body: document,
  })
}

export const schoolApi = {
  findSchools: (query?: Record<string, unknown>) => findCollection('/schools/find', query),
  addSchool: (document: SchoolDocument) => addDocument('/schools/add', document),
  updateSchool: (id: string, document: SchoolDocument) =>
    apiRequest<number>(API_CONFIG.schoolBaseUrl, '/schools/update', {
      method: 'PUT',
      body: { id, data: document },
    }),

  findYears: (query?: Record<string, unknown>) => findCollection('/years/find', query),
  addYear: (document: SchoolDocument) => addDocument('/years/add', document),
  updateYear: (id: string, document: SchoolDocument) =>
    apiRequest<number>(API_CONFIG.schoolBaseUrl, '/years/update', {
      method: 'PUT',
      body: { id, data: document },
    }),
  deleteYear: (id: string) =>
    apiRequest<number>(API_CONFIG.schoolBaseUrl, '/years/delete', {
      method: 'DELETE',
      body: { id },
    }),

  findClasses: (query?: Record<string, unknown>) => findCollection('/class/find', query),
  addClass: (document: SchoolDocument) => addDocument('/class/add', document),
  updateClass: (id: string, document: SchoolDocument) =>
    apiRequest<number>(API_CONFIG.schoolBaseUrl, '/class/update', {
      method: 'PUT',
      body: { id, data: document },
    }),

  findStudents: (query?: Record<string, unknown>) => findCollection('/students/find', query),
  addStudent: (document: SchoolDocument) => addDocument('/students/add', document),
  updateStudent: (id: string, document: SchoolDocument) =>
    apiRequest<number>(API_CONFIG.schoolBaseUrl, '/students/update', {
      method: 'PUT',
      body: { id, data: document },
    }),
  deleteStudent: (id: string) =>
    apiRequest<number>(API_CONFIG.schoolBaseUrl, '/students/delete', {
      method: 'DELETE',
      body: { id },
    }),

  addEvaluationMoment: (document: SchoolDocument) =>
    addDocument('/config/addevaluationmoments', document),
  findEvaluationMoments: (query?: Record<string, unknown>) =>
    findCollection('/config/findevaluationmoments', query),
  updateEvaluationMoment: (id: string, document: SchoolDocument) =>
    apiRequest<number>(API_CONFIG.schoolBaseUrl, '/config/updateevaluationmoments', {
      method: 'PUT',
      body: { id, data: document },
    }),
  deleteEvaluationMoment: (id: string) =>
    apiRequest<number>(API_CONFIG.schoolBaseUrl, '/config/deleteevaluationmoments', {
      method: 'DELETE',
      body: { id },
    }),
  findStudentMomentValues: (query?: Record<string, unknown>) =>
    findCollection('/config/findmomentsclass', query),
  saveStudentMomentValue: (document: SchoolDocument) =>
    apiRequest<{ id?: string; value: SchoolDocument }>(
      API_CONFIG.schoolBaseUrl,
      '/config/upsertmomentvalue',
      {
        method: 'PUT',
        body: document,
      },
    ),
  findStudentCalendarTasks: (query?: Record<string, unknown>) =>
    findCollection('/config/findstudentscalendar', query),
  addStudentCalendarTask: (document: SchoolDocument) =>
    apiRequest<{ id?: string; value: SchoolDocument }>(
      API_CONFIG.schoolBaseUrl,
      '/config/addstudentscalendar',
      {
        method: 'PUT',
        body: document,
      },
    ),
  saveSemesterEvaluations: (document: SchoolDocument) =>
    apiRequest<{ id?: string; value: SchoolDocument }>(
      API_CONFIG.schoolBaseUrl,
      '/config/upsertsemesterevaluations',
      {
        method: 'PUT',
        body: document,
      },
    ),
  generateMomentAssessmentReport: (document: SchoolDocument) =>
    apiRequest<{ path: string; url: string }>(
      API_CONFIG.schoolBaseUrl,
      '/config/moment-assessment-report',
      {
        method: 'POST',
        body: document,
      },
    ),
  getReportUrl: (path: string) => `${API_CONFIG.schoolBaseUrl}${path}`,

  getAppSettings: () =>
    apiRequest<AppSettings>(API_CONFIG.schoolBaseUrl, '/config/app-settings'),
  updateAppSettings: (settings: AppSettings) =>
    apiRequest<AppSettings>(API_CONFIG.schoolBaseUrl, '/config/app-settings', {
      method: 'PUT',
      body: settings,
    }),
}
