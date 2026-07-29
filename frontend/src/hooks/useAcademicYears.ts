import { schoolApi } from '../api/school'
import type { FormEvent } from 'react'
import type { SchoolDocument } from '../api/school'
import type { AcademicPeriodType } from '../types'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'

export function useAcademicYears(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'loadAcademicYears' | 'loadAllAcademicYears' | 'handleCreateAcademicYear' | 'openYearsDashboard' | 'openCreateYearModal' | 'openEditYearModal' | 'deleteYear' | 'getAcademicYearTitle' | 'getSchoolAcademicYearCount' | 'getAcademicYearClassCount' | 'getClassesForAcademicYear' | 'returnToYearsDashboard' | 'hasAcademicYearChanged'> {
async function loadAcademicYears(school: SchoolDocument) {
    const schoolId = runtime.getSchoolId(school)
    if (!schoolId) {
      runtime.setYearsError('Não foi possível identificar a escola selecionada.')
      runtime.setAcademicYears([])
      return
    }

    runtime.setIsLoadingYears(true)
    runtime.setYearsError(null)

    try {
      const existingYears = await schoolApi.findYears({ userId: runtime.getLoggedUserId(), schoolId })
      runtime.setAcademicYears(existingYears)
    } catch (yearError) {
      const errorMessage =
        yearError instanceof Error ? yearError.message : 'Erro ao carregar anos letivos.'

      runtime.setAcademicYears([])
      runtime.setYearsError(errorMessage.includes('HTTP 400') ? null : errorMessage)
    } finally {
      runtime.setIsLoadingYears(false)
    }
  }

async function loadAllAcademicYears() {
    try {
      const existingYears = await schoolApi.findYears({ userId: runtime.getLoggedUserId() })
      runtime.setAllAcademicYears(existingYears)
    } catch (yearError) {
      const errorMessage =
        yearError instanceof Error ? yearError.message : 'Erro ao carregar anos letivos.'

      runtime.setAllAcademicYears([])
      if (!errorMessage.includes('HTTP 400')) {
        runtime.setYearsError(errorMessage)
      }
    }
  }

async function handleCreateAcademicYear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!runtime.selectedSchool) {
      runtime.setYearsError('Seleciona uma escola antes de criar o ano letivo.')
      return
    }

    const schoolId = runtime.getSchoolId(runtime.selectedSchool)
    const option = runtime.academicYearOptions.find((year) => year.value === runtime.selectedAcademicYear)

    if (!schoolId || !option) {
      runtime.setYearsError('Não foi possível criar o ano letivo.')
      return
    }

    runtime.setIsLoadingYears(true)
    runtime.setYearsError(null)

    try {
      const userId = runtime.getLoggedUserId()
      const yearPayload = {
        userId,
        schoolId,
        schoolName: runtime.getSchoolTitle(runtime.selectedSchool),
        name: option.label,
        startYear: option.startYear,
        endYear: option.endYear,
        periodType: runtime.yearPeriodType,
      }

      // Impede duplicados: mesmo ano letivo na mesma escola
      const duplicate = runtime.academicYears.find((y) => {
        if (runtime.editingYearId && runtime.getDocumentId(y) === runtime.editingYearId) return false
        return (
          Number(y.startYear) === option.startYear &&
          Number(y.endYear) === option.endYear
        )
      })
      if (duplicate) {
        runtime.setYearsError(`O ano letivo ${option.label} já existe para esta escola.`)
        runtime.setIsLoadingYears(false)
        return
      }

      if (runtime.editingYearId) {
        const currentYear = runtime.academicYears.find((year) => runtime.getDocumentId(year) === runtime.editingYearId)
        if (currentYear && !hasAcademicYearChanged(currentYear, yearPayload)) {
          runtime.setEditingYearId(null)
          runtime.setIsCreateYearModalOpen(false)
          return
        }

        await schoolApi.updateYear(runtime.editingYearId, yearPayload)
        runtime.setSelectedAcademicYearDocument((currentYear) =>
          currentYear && runtime.getDocumentId(currentYear) === runtime.editingYearId
            ? { ...currentYear, ...yearPayload }
            : currentYear,
        )
      } else {
        await schoolApi.addYear(yearPayload)
      }

      runtime.setEditingYearId(null)
      runtime.setIsCreateYearModalOpen(false)
      await loadAcademicYears(runtime.selectedSchool)
      await loadAllAcademicYears()
    } catch (yearError) {
      runtime.setYearsError(yearError instanceof Error ? yearError.message : 'Erro ao criar ano letivo.')
    } finally {
      runtime.setIsLoadingYears(false)
    }
  }

function openYearsDashboard(school: SchoolDocument) {
    runtime.setSelectedSchool(school)
    runtime.setSelectedAcademicYearDocument(null)
    runtime.setActiveDashboard('years')
  }

function openCreateYearModal() {
    runtime.setEditingYearId(null)
    runtime.setSelectedAcademicYear(runtime.academicYearOptions[0].value)
    runtime.setYearPeriodType(runtime.academicPeriodType)
    runtime.setIsCreateYearModalOpen(true)
  }

function openEditYearModal(year: SchoolDocument) {
    const yearId = runtime.getDocumentId(year)
    if (!yearId) {
      runtime.setYearsError('Não foi possível identificar o ano letivo para edição.')
      return
    }

    runtime.setEditingYearId(yearId)
    runtime.setSelectedAcademicYear(getAcademicYearTitle(year))
    runtime.setYearPeriodType((year.periodType as AcademicPeriodType) ?? runtime.academicPeriodType)
    runtime.setIsCreateYearModalOpen(true)
  }

async function deleteYear(year: SchoolDocument) {
    const yearId = runtime.getDocumentId(year)
    if (!yearId) {
      runtime.setYearsError('Não foi possível identificar o ano letivo para apagar.')
      return
    }

    if (!window.confirm('Tens a certeza que queres apagar este ano letivo?')) {
      return
    }

    runtime.setIsLoadingYears(true)
    runtime.setYearsError(null)

    try {
      await schoolApi.deleteYear(yearId)
      if (runtime.selectedSchool) {
        await loadAcademicYears(runtime.selectedSchool)
      }
    } catch (yearError) {
      runtime.setYearsError(yearError instanceof Error ? yearError.message : 'Erro ao apagar ano letivo.')
    } finally {
      runtime.setIsLoadingYears(false)
    }
  }

function getAcademicYearTitle(year: SchoolDocument) {
    const title = year.name ?? year.label ?? year.year
    return typeof title === 'string' ? title : 'Ano letivo sem nome'
  }

function getSchoolAcademicYearCount(school: SchoolDocument) {
    const schoolId = runtime.getSchoolId(school)
    if (!schoolId) {
      return 0
    }

    return runtime.allAcademicYears.filter((year) => year.schoolId === schoolId).length
  }

function getAcademicYearClassCount(year: SchoolDocument) {
    return getClassesForAcademicYear(year).length
  }

function getClassesForAcademicYear(year: SchoolDocument) {
    const yearId = typeof year._id === 'string' ? year._id : ''
    const yearTitle = getAcademicYearTitle(year)

    return runtime.allClasses.filter((schoolClass) => {
      const classYearId = schoolClass.yearId ?? schoolClass.academicYearId
      const classYearTitle = schoolClass.year ?? schoolClass.academicYear ?? schoolClass.academicYearName

      return classYearId === yearId || classYearTitle === yearTitle
    })
  }

function returnToYearsDashboard() {
    if (runtime.activeDashboard === 'students' && runtime.activeStudentsMenuOption === 3 && !runtime.canLeaveAssessmentMoment()) {
      return
    }

    runtime.setSelectedAcademicYearDocument(null)
    runtime.setSelectedClass(null)
    runtime.setActiveDashboard('years')
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

  return {
    loadAcademicYears,
    loadAllAcademicYears,
    handleCreateAcademicYear,
    openYearsDashboard,
    openCreateYearModal,
    openEditYearModal,
    deleteYear,
    getAcademicYearTitle,
    getSchoolAcademicYearCount,
    getAcademicYearClassCount,
    getClassesForAcademicYear,
    returnToYearsDashboard,
    hasAcademicYearChanged,
  }
}
