import { apiRequest } from './client'
import { API_CONFIG } from './config'

export type SchoolDocument = Record<string, unknown>

export type AppSettings = {
  inactiveLogoutMinutes: number
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

  findClasses: (query?: Record<string, unknown>) => findCollection('/class/find', query),
  addClass: (document: SchoolDocument) => addDocument('/class/add', document),

  findStudents: (query?: Record<string, unknown>) => findCollection('/students/find', query),
  addStudent: (document: SchoolDocument) => addDocument('/students/add', document),

  getAppSettings: () =>
    apiRequest<AppSettings>(API_CONFIG.schoolBaseUrl, '/config/app-settings'),
}
