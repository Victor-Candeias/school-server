import { schoolApi } from '../api/school'
import type { FormEvent } from 'react'
import type { SchoolDocument } from '../api/school'
import { EMPTY_CLASS_FORM } from '../utils/constants'
import { formatPostalCode } from '../utils/formatting'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'

export function useClasses(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'loadAllClasses' | 'handleSaveClass' | 'updatePostalCode' | 'updateNewClassField' | 'resetClassForm' | 'openCreateClassModal' | 'openEditClassModal' | 'openClassesDashboard' | 'getDashboardTitle' | 'getDashboardDescription' | 'getClassTitle' | 'returnToClassesDashboard' | 'getDocumentId' | 'getStringValue' | 'getRecordValue'> {
async function loadAllClasses() {
    try {
      const existingClasses = await schoolApi.findClasses({ userId: runtime.getLoggedUserId() })
      runtime.setAllClasses(existingClasses)
    } catch (classError) {
      const errorMessage =
        classError instanceof Error ? classError.message : 'Erro ao carregar turmas.'

      runtime.setAllClasses([])
      if (!errorMessage.includes('HTTP 400')) {
        runtime.setYearsError(errorMessage)
      }
    }
  }

async function handleSaveClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!runtime.selectedSchool || !runtime.selectedAcademicYearDocument) {
      runtime.setClassesError('Seleciona uma escola e um ano letivo antes de criar a turma.')
      return
    }

    const schoolId = runtime.getSchoolId(runtime.selectedSchool)
    const yearId = getDocumentId(runtime.selectedAcademicYearDocument)

    if (!schoolId || !yearId) {
      runtime.setClassesError('Não foi possível identificar a escola ou o ano letivo selecionado.')
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      const className = `${runtime.newClass.classYear.trim()}.º ${runtime.newClass.classLetter.trim().toUpperCase()}`

      // Impede duplicados: mesmo ano + letra no mesmo ano letivo
      const duplicate = runtime.allClasses.find((c) => {
        if (runtime.editingClassId && getDocumentId(c) === runtime.editingClassId) return false
        return (
          getStringValue(c.yearId) === yearId &&
          getClassTitle(c).trim().toLowerCase() === className.toLowerCase()
        )
      })
      if (duplicate) {
        runtime.setClassesError(`Já existe a turma "${className}" neste ano letivo.`)
        runtime.setIsLoadingClasses(false)
        return
      }

      if (runtime.editingClassId) {
        const currentClass = runtime.allClasses.find((schoolClass) => getDocumentId(schoolClass) === runtime.editingClassId)
        const classPayload = {
          ...currentClass,
          name: className,
          director: {
            name: runtime.newClass.directorName.trim(),
          },
        }

        await schoolApi.updateClass(runtime.editingClassId, classPayload)
        runtime.setSelectedClass((currentClass) =>
          currentClass && getDocumentId(currentClass) === runtime.editingClassId
            ? { ...currentClass, ...classPayload }
            : currentClass,
        )
      } else {
        const userId = runtime.getLoggedUserId()
        const schoolName = runtime.getSchoolTitle(runtime.selectedSchool)
        const academicYearName = runtime.getAcademicYearTitle(runtime.selectedAcademicYearDocument)
        const classPayload = {
          userId,
          schoolId,
          schoolName,
          yearId,
          academicYearId: yearId,
          academicYearName,
          name: className,
          director: {
            name: runtime.newClass.directorName.trim(),
          },
        }
        const createdClass = await schoolApi.addClass(classPayload)
        const classId = createdClass.id

        await Promise.all(
          runtime.newClass.students.map((student) =>
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
      runtime.setIsCreateClassModalOpen(false)
      await loadAllClasses()
      await runtime.loadAllStudents()
    } catch (classError) {
      runtime.setClassesError(classError instanceof Error ? classError.message : 'Erro ao criar turma.')
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

function updatePostalCode(value: string) {
    runtime.updateNewSchoolField('postalCode', formatPostalCode(value))
  }

function updateNewClassField(field: 'classYear' | 'classLetter' | 'directorName', value: string) {
    runtime.setNewClass((currentClass) => ({
      ...currentClass,
      [field]: value,
    }))
  }

function resetClassForm() {
    runtime.setNewClass(EMPTY_CLASS_FORM)
    runtime.setEditingClassId(null)
    runtime.closeStudentModal()
  }

function openCreateClassModal() {
    resetClassForm()
    runtime.setClassesError(null)
    runtime.setIsCreateClassModalOpen(true)
  }

function openEditClassModal(schoolClass: SchoolDocument) {
    const classId = getDocumentId(schoolClass)
    if (!classId) {
      runtime.setClassesError('Não foi possível identificar a turma para edição.')
      return
    }

    const director = getRecordValue(schoolClass.director)
    const existingName = getClassTitle(schoolClass)
    // Tenta separar "7.º A" → year="7", letter="A"
    const nameMatch = existingName.match(/^(\d+)(?:\.º)?\s+(.+)$/)
    runtime.setEditingClassId(classId)
    runtime.setNewClass({
      classYear: nameMatch ? nameMatch[1] : '',
      classLetter: nameMatch ? nameMatch[2] : existingName,
      directorName: getStringValue(director.name),
      students: [],
    })
    runtime.setClassesError(null)
    runtime.setIsCreateClassModalOpen(true)
  }

function openClassesDashboard(year: SchoolDocument) {
    runtime.setSelectedAcademicYearDocument(year)
    runtime.setSelectedClass(null)
    runtime.setStudentCalendarTasks([])
    runtime.setActiveDashboard('classes')
  }

function getDashboardTitle() {
    if (runtime.activeDashboard === 'years' && runtime.selectedSchool) {
      return runtime.getSchoolTitle(runtime.selectedSchool)
    }

    if (runtime.activeDashboard === 'settings') {
      return 'Configurações'
    }

    if (runtime.activeDashboard === 'classes' && runtime.selectedAcademicYearDocument) {
      return runtime.getAcademicYearTitle(runtime.selectedAcademicYearDocument)
    }

    if (runtime.activeDashboard === 'students' && runtime.selectedClass) {
      return getClassTitle(runtime.selectedClass)
    }

    return 'Escolas'
  }

function getDashboardDescription() {
    if (runtime.activeDashboard === 'years' && runtime.selectedSchool) {
      return 'Gere os anos letivos desta escola.'
    }

    if (runtime.activeDashboard === 'settings') {
      return ''
    }

    if (runtime.activeDashboard === 'classes' && runtime.selectedAcademicYearDocument) {
      return 'Gere as turmas deste ano letivo.'
    }

    if (runtime.activeDashboard === 'students' && runtime.selectedClass) {
      return 'Dashboard dos alunos da turma.'
    }

    return 'Cria novas escolas e consulta as escolas existentes.'
  }

function getClassTitle(schoolClass: SchoolDocument) {
    const title = schoolClass.name ?? schoolClass.className ?? schoolClass.class
    return typeof title === 'string' ? title : 'Turma sem nome'
  }

function returnToClassesDashboard() {
    if (runtime.activeStudentsMenuOption === 3 && !runtime.canLeaveAssessmentMoment()) {
      return
    }

    runtime.setSelectedClass(null)
    runtime.setActiveDashboard('classes')
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

  return {
    loadAllClasses,
    handleSaveClass,
    updatePostalCode,
    updateNewClassField,
    resetClassForm,
    openCreateClassModal,
    openEditClassModal,
    openClassesDashboard,
    getDashboardTitle,
    getDashboardDescription,
    getClassTitle,
    returnToClassesDashboard,
    getDocumentId,
    getStringValue,
    getRecordValue,
  }
}
