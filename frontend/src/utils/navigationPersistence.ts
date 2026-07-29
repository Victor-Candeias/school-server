import type { DashboardSection, StudentsMenuOption } from '../types'

const NAVIGATION_STORAGE_PREFIX = 'school-management:navigation:'
const DASHBOARD_SECTIONS: DashboardSection[] = [
  'schools',
  'years',
  'classes',
  'students',
  'settings',
]
const STUDENTS_MENU_OPTIONS: StudentsMenuOption[] = [0, 1, 2, 3, 4, 5]

export type PersistedNavigation = {
  activeDashboard: DashboardSection
  activeStudentsMenuOption: StudentsMenuOption
  schoolId: string | null
  academicYearId: string | null
  classId: string | null
}

export function saveNavigationState(userId: string, navigation: PersistedNavigation) {
  localStorage.setItem(getNavigationStorageKey(userId), JSON.stringify(navigation))
}

export function loadNavigationState(userId: string): PersistedNavigation | null {
  const storedValue = localStorage.getItem(getNavigationStorageKey(userId))

  if (!storedValue) {
    return null
  }

  try {
    const navigation = JSON.parse(storedValue) as Record<string, unknown>

    if (
      !DASHBOARD_SECTIONS.includes(navigation.activeDashboard as DashboardSection)
      || !STUDENTS_MENU_OPTIONS.includes(navigation.activeStudentsMenuOption as StudentsMenuOption)
      || !isNullableString(navigation.schoolId)
      || !isNullableString(navigation.academicYearId)
      || !isNullableString(navigation.classId)
    ) {
      return null
    }

    return navigation as PersistedNavigation
  } catch {
    return null
  }
}

function getNavigationStorageKey(userId: string) {
  return `${NAVIGATION_STORAGE_PREFIX}${encodeURIComponent(userId)}`
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}
