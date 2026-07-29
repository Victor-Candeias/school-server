import { schoolApi } from '../api/school'
import type { FormEvent } from 'react'
import type { SchoolDocument } from '../api/school'
import type { SchoolForm } from '../types'
import { EMPTY_SCHOOL_FORM } from '../utils/constants'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'

export function useSchools(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'loadSchools' | 'handleSaveSchool' | 'getSchoolPayload' | 'updateNewSchoolField' | 'resetSchoolForm' | 'openCreateSchoolModal' | 'openEditSchoolModal' | 'getSchoolTitle' | 'returnToSchoolsDashboard' | 'getSchoolId' | 'getSchoolFormFromDocument'> {
async function loadSchools() {
    runtime.setIsLoadingSchools(true)
    runtime.setSchoolsError(null)

    try {
      const existingSchools = await schoolApi.findSchools({ userId: runtime.getLoggedUserId() })
      runtime.setSchools(existingSchools)
    } catch (schoolError) {
      const errorMessage =
        schoolError instanceof Error ? schoolError.message : 'Erro ao carregar escolas.'

      runtime.setSchools([])
      runtime.setSchoolsError(errorMessage.includes('HTTP 400') ? null : errorMessage)
    } finally {
      runtime.setIsLoadingSchools(false)
    }
  }

async function handleSaveSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    runtime.setIsLoadingSchools(true)
    runtime.setSchoolsError(null)

    try {
      const schoolPayload = getSchoolPayload()

      // Impede duplicados: mesmo schoolId
      const duplicate = runtime.schools.find((s) => {
        if (runtime.editingSchoolId && getSchoolId(s) === runtime.editingSchoolId) return false
        return runtime.getStringValue(s.schoolId).trim().toLowerCase() === schoolPayload.schoolId.toLowerCase()
      })
      if (duplicate) {
        runtime.setSchoolsError(`Já existe uma escola com o ID "${schoolPayload.schoolId}".`)
        runtime.setIsLoadingSchools(false)
        return
      }

      if (runtime.editingSchoolId) {
        await schoolApi.updateSchool(runtime.editingSchoolId, schoolPayload)
        runtime.setSelectedSchool((currentSchool) =>
          currentSchool && getSchoolId(currentSchool) === runtime.editingSchoolId
            ? { ...currentSchool, ...schoolPayload }
            : currentSchool,
        )
      } else {
        await schoolApi.addSchool(schoolPayload)
      }

      resetSchoolForm()
      runtime.setIsCreateSchoolModalOpen(false)
      await loadSchools()
    } catch (schoolError) {
      runtime.setSchoolsError(
        schoolError instanceof Error ? schoolError.message : 'Erro ao criar escola.',
      )
    } finally {
      runtime.setIsLoadingSchools(false)
    }
  }

function getSchoolPayload() {
    const phones = [runtime.newSchool.phone1, runtime.newSchool.phone2, runtime.newSchool.phone3]
      .map((phone) => phone.trim())
      .filter(Boolean)

    return {
      userId: runtime.getLoggedUserId(),
      schoolId: runtime.newSchool.schoolId.trim(),
      name: runtime.newSchool.name.trim(),
      group: runtime.newSchool.group.trim() || undefined,
      address: {
        street: runtime.newSchool.address.trim(),
        postalCode: runtime.newSchool.postalCode.trim(),
        locality: runtime.newSchool.locality.trim(),
      },
      phones,
      director: {
        name: runtime.newSchool.directorName.trim(),
        contacts: runtime.newSchool.directorContacts.trim() || undefined,
      },
    }
  }

function updateNewSchoolField(field: keyof SchoolForm, value: string) {
    runtime.setNewSchool((currentSchool) => ({
      ...currentSchool,
      [field]: value,
    }))
  }

function resetSchoolForm() {
    runtime.setNewSchool(EMPTY_SCHOOL_FORM)
    runtime.setEditingSchoolId(null)
  }

function openCreateSchoolModal() {
    resetSchoolForm()
    runtime.setIsCreateSchoolModalOpen(true)
  }

function openEditSchoolModal(school: SchoolDocument) {
    const schoolId = getSchoolId(school)
    if (!schoolId) {
      runtime.setSchoolsError('Não foi possível identificar a escola para edição.')
      return
    }

    runtime.setEditingSchoolId(schoolId)
    runtime.setNewSchool(getSchoolFormFromDocument(school))
    runtime.setIsCreateSchoolModalOpen(true)
  }

function getSchoolTitle(school: SchoolDocument) {
    const title = school.name ?? school.title ?? school.school ?? school._id
    return typeof title === 'string' ? title : 'Escola sem nome'
  }

function returnToSchoolsDashboard() {
    if (runtime.activeDashboard === 'students' && runtime.activeStudentsMenuOption === 3 && !runtime.canLeaveAssessmentMoment()) {
      return
    }

    runtime.setSelectedAcademicYearDocument(null)
    runtime.setSelectedClass(null)
    runtime.setActiveDashboard('schools')
  }

function getSchoolId(school: SchoolDocument) {
    return runtime.getDocumentId(school)
  }

function getSchoolFormFromDocument(school: SchoolDocument): SchoolForm {
    const address = runtime.getRecordValue(school.address)
    const director = runtime.getRecordValue(school.director)
    const phones = Array.isArray(school.phones) ? school.phones.map(runtime.getStringValue) : []

    return {
      name: runtime.getStringValue(school.name),
      schoolId: runtime.getStringValue(school.schoolId),
      group: runtime.getStringValue(school.group),
      address: runtime.getStringValue(address.street),
      postalCode: runtime.getStringValue(address.postalCode),
      locality: runtime.getStringValue(address.locality),
      phone1: phones[0] ?? '',
      phone2: phones[1] ?? '',
      phone3: phones[2] ?? '',
      directorName: runtime.getStringValue(director.name),
      directorContacts: runtime.getStringValue(director.contacts),
    }
  }

  return {
    loadSchools,
    handleSaveSchool,
    getSchoolPayload,
    updateNewSchoolField,
    resetSchoolForm,
    openCreateSchoolModal,
    openEditSchoolModal,
    getSchoolTitle,
    returnToSchoolsDashboard,
    getSchoolId,
    getSchoolFormFromDocument,
  }
}
