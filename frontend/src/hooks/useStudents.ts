import { schoolApi } from '../api/school'
import type { FormEvent } from 'react'
import type { SchoolDocument } from '../api/school'
import type { StudentForm } from '../types'
import type { StudentsMenuOption } from '../types'
import { EMPTY_STUDENT_FORM } from '../utils/constants'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'

export function useStudents(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'loadAllStudents' | 'updateNewStudentField' | 'handleSaveStudent' | 'saveStudentToSelectedClass' | 'saveExistingStudent' | 'openStudentModal' | 'openNewStudentFromDashboard' | 'closeStudentModal' | 'openEditStudentModal' | 'deactivateStudent' | 'deleteStudent' | 'removeStudentFromClassForm' | 'openStudentsDashboard' | 'getClassStudentCount' | 'getStudentsForClass' | 'handleStudentsMenuOptionChange' | 'generateStudentDetailReport' | 'generateClassStudentsReport' | 'getNextStudentId'> {
async function loadAllStudents() {
    try {
      const existingStudents = await schoolApi.findStudents({ userId: runtime.getLoggedUserId() })
      runtime.setAllStudents(existingStudents)
    } catch (studentError) {
      const errorMessage =
        studentError instanceof Error ? studentError.message : 'Erro ao carregar alunos.'

      runtime.setAllStudents([])
      if (!errorMessage.includes('HTTP 400')) {
        runtime.setClassesError(errorMessage)
      }
    }
  }

function updateNewStudentField(field: keyof Omit<StudentForm, 'id'>, value: string) {
    runtime.setNewStudent((currentStudent) => ({
      ...currentStudent,
      [field]: value,
    }))
  }

function handleSaveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (runtime.editingStudentId) {
      void saveExistingStudent()
      return
    }

    if (runtime.activeDashboard === 'students' && runtime.selectedClass) {
      void saveStudentToSelectedClass()
      return
    }

    // Validação de número único dentro do formulário da turma
    const newSchoolNumber = runtime.newStudent.schoolNumber.trim()
    const duplicateInForm = runtime.newClass.students.some(
      (s) => s.schoolNumber.trim() === newSchoolNumber,
    )
    // Validação contra alunos já existentes na escola
    const duplicateInDb = runtime.allStudents.some(
      (s) => runtime.getStringValue(s.schoolNumber).trim() === newSchoolNumber,
    )
    if (duplicateInForm || duplicateInDb) {
      runtime.setClassesError(`O número de escola "${newSchoolNumber}" já está em uso.`)
      return
    }

    runtime.setNewClass((currentClass) => ({
      ...currentClass,
      students: [
        ...currentClass.students,
        {
          ...runtime.newStudent,
          name: runtime.newStudent.name.trim(),
          schoolNumber: newSchoolNumber,
          schoolEmail: runtime.newStudent.schoolEmail.trim(),
          guardianName: runtime.newStudent.guardianName.trim(),
          guardianPhone: runtime.newStudent.guardianPhone.trim(),
          guardianEmail: runtime.newStudent.guardianEmail.trim(),
          active: true,
        },
      ],
    }))
    closeStudentModal()
  }

async function saveStudentToSelectedClass() {
    if (!runtime.selectedSchool || !runtime.selectedAcademicYearDocument || !runtime.selectedClass) {
      runtime.setClassesError('Seleciona uma escola, ano letivo e turma antes de criar o aluno.')
      return
    }

    const schoolId = runtime.getSchoolId(runtime.selectedSchool)
    const yearId = runtime.getDocumentId(runtime.selectedAcademicYearDocument)
    const classId = runtime.getDocumentId(runtime.selectedClass)

    if (!schoolId || !yearId || !classId) {
      runtime.setClassesError('Não foi possível identificar a escola, ano letivo ou turma selecionada.')
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      const schoolNumber = runtime.newStudent.schoolNumber.trim()

      // Validação: número único na escola
      const duplicate = runtime.allStudents.some(
        (s) => runtime.getStringValue(s.schoolNumber).trim() === schoolNumber,
      )
      if (duplicate) {
        runtime.setClassesError(`O número de escola "${schoolNumber}" já está em uso.`)
        runtime.setIsLoadingClasses(false)
        return
      }

      await schoolApi.addStudent({
        userId: runtime.getLoggedUserId(),
        id: runtime.newStudent.id,
        name: runtime.newStudent.name.trim(),
        schoolNumber,
        schoolEmail: runtime.newStudent.schoolEmail.trim(),
        guardian: {
          name: runtime.newStudent.guardianName.trim(),
          phone: runtime.newStudent.guardianPhone.trim(),
          email: runtime.newStudent.guardianEmail.trim(),
        },
        schoolId,
        schoolName: runtime.getSchoolTitle(runtime.selectedSchool),
        yearId,
        academicYearId: yearId,
        academicYearName: runtime.getAcademicYearTitle(runtime.selectedAcademicYearDocument),
        classId,
        className: runtime.getClassTitle(runtime.selectedClass),
        active: true,
      })
      closeStudentModal()
      await loadAllStudents()
    } catch (studentError) {
      runtime.setClassesError(studentError instanceof Error ? studentError.message : 'Erro ao criar aluno.')
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

async function saveExistingStudent() {
    if (!runtime.editingStudentId) {
      return
    }

    const currentStudent = runtime.allStudents.find((student) => runtime.getDocumentId(student) === runtime.editingStudentId)
    if (!currentStudent) {
      runtime.setClassesError('Não foi possível identificar o aluno para edição.')
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      const schoolNumber = runtime.newStudent.schoolNumber.trim()

      // Validação: número único excluindo o próprio aluno
      const duplicate = runtime.allStudents.some(
        (s) => runtime.getDocumentId(s) !== runtime.editingStudentId &&
          runtime.getStringValue(s.schoolNumber).trim() === schoolNumber,
      )
      if (duplicate) {
        runtime.setClassesError(`O número de escola "${schoolNumber}" já está em uso.`)
        runtime.setIsLoadingClasses(false)
        return
      }

      const { _id, ...studentPayload } = currentStudent

      await schoolApi.updateStudent(runtime.editingStudentId, {
        ...studentPayload,
        id: runtime.newStudent.id,
        name: runtime.newStudent.name.trim(),
        schoolNumber,
        schoolEmail: runtime.newStudent.schoolEmail.trim(),
        guardian: {
          name: runtime.newStudent.guardianName.trim(),
          phone: runtime.newStudent.guardianPhone.trim(),
          email: runtime.newStudent.guardianEmail.trim(),
        },
        active: runtime.newStudent.active,
      })
      closeStudentModal()
      await loadAllStudents()
    } catch (studentError) {
      runtime.setClassesError(studentError instanceof Error ? studentError.message : 'Erro ao editar aluno.')
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

function openStudentModal() {
    runtime.setEditingStudentId(null)
    runtime.setNewStudent({
      ...EMPTY_STUDENT_FORM,
      id: getNextStudentId(runtime.newClass.students),
    })
    runtime.setIsStudentModalOpen(true)
  }

function openNewStudentFromDashboard() {
    runtime.setEditingStudentId(null)
    runtime.setStudentActionMenuId(null)
    runtime.setNewStudent({
      ...EMPTY_STUDENT_FORM,
      id: getNextStudentId([]),
    })
    runtime.setIsStudentModalOpen(true)
  }

function closeStudentModal() {
    runtime.setIsStudentModalOpen(false)
    runtime.setEditingStudentId(null)
    runtime.setNewStudent(EMPTY_STUDENT_FORM)
  }

function openEditStudentModal(student: SchoolDocument) {
    const studentId = runtime.getDocumentId(student)
    if (!studentId) {
      runtime.setClassesError('Não foi possível identificar o aluno para edição.')
      return
    }

    const guardian = runtime.getRecordValue(student.guardian)
    runtime.setEditingStudentId(studentId)
    runtime.setStudentActionMenuId(null)
    runtime.setNewStudent({
      id: Number(student.id) || getNextStudentId([]),
      name: runtime.getStringValue(student.name),
      schoolNumber: runtime.getStringValue(student.schoolNumber),
      schoolEmail: runtime.getStringValue(student.schoolEmail),
      guardianName: runtime.getStringValue(guardian.name),
      guardianPhone: runtime.getStringValue(guardian.phone),
      guardianEmail: runtime.getStringValue(guardian.email),
      active: student.active !== false,
    })
    runtime.setIsStudentModalOpen(true)
  }

async function deactivateStudent(student: SchoolDocument) {
    const studentId = runtime.getDocumentId(student)
    if (!studentId) {
      runtime.setClassesError('Não foi possível identificar o aluno para desativar.')
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      await schoolApi.updateStudent(studentId, { ...student, active: false })
      runtime.setStudentActionMenuId(null)
      await loadAllStudents()
    } catch (studentError) {
      runtime.setClassesError(studentError instanceof Error ? studentError.message : 'Erro ao desativar aluno.')
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

async function deleteStudent(student: SchoolDocument) {
    const studentId = runtime.getDocumentId(student)
    if (!studentId) {
      runtime.setClassesError('Não foi possível identificar o aluno para apagar.')
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      await schoolApi.deleteStudent(studentId)
      runtime.setStudentActionMenuId(null)
      await loadAllStudents()
    } catch (studentError) {
      runtime.setClassesError(studentError instanceof Error ? studentError.message : 'Erro ao apagar aluno.')
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

function removeStudentFromClassForm(index: number) {
    runtime.setNewClass((currentClass) => ({
      ...currentClass,
      students: currentClass.students.filter((_, studentIndex) => studentIndex !== index),
    }))
  }

function openStudentsDashboard(schoolClass: SchoolDocument) {
    runtime.setSelectedClass(schoolClass)
    runtime.setActiveStudentsMenuOption(1)
    runtime.setSelectedGradingMomentId('')
    runtime.setSelectedAssessmentsSemester('')
    runtime.setAssessmentCellDrafts({})
    runtime.setStudentCalendarTasks([])
    runtime.setActiveDashboard('students')
    void runtime.loadStudentCalendarTasks(schoolClass)
  }

function getClassStudentCount(schoolClass: SchoolDocument) {
    return getStudentsForClass(schoolClass).length
  }

function getStudentsForClass(schoolClass: SchoolDocument) {
    const classId = runtime.getDocumentId(schoolClass)
    const className = runtime.getClassTitle(schoolClass)

    return runtime.allStudents.filter(
      (student) =>
        student.active !== false &&
        (student.classId === classId || student.className === className),
    )
  }

function handleStudentsMenuOptionChange(option: StudentsMenuOption) {
    if (option !== runtime.activeStudentsMenuOption && runtime.activeStudentsMenuOption === 3 && !runtime.canLeaveAssessmentMoment()) {
      return
    }

    runtime.setActiveStudentsMenuOption(option)
  }

async function generateStudentDetailReport(student: SchoolDocument) {
    const guardian = runtime.getRecordValue(student.guardian)
    const studentName = runtime.getStringValue(student.name) || 'Aluno'

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)
    runtime.setMessage(null)

    try {
      const report = await schoolApi.generateMomentAssessmentReport({
        title: `Detalhe do aluno - ${studentName}`,
        headers: ['Campo', 'Valor'],
        rows: [
          ['ID único', String(student.id ?? '')],
          ['Nome do aluno', studentName],
          ['Número na escola', String(student.schoolNumber ?? '')],
          ['Email escolar', runtime.getStringValue(student.schoolEmail)],
          ['Encarregado de educação', runtime.getStringValue(guardian.name)],
          ['Contacto do EE', runtime.getStringValue(guardian.phone)],
          ['Email do EE', runtime.getStringValue(guardian.email)],
          ['Escola', runtime.getStringValue(student.schoolName) || (runtime.selectedSchool ? runtime.getSchoolTitle(runtime.selectedSchool) : '')],
          ['Ano letivo', runtime.getStringValue(student.academicYearName) || (runtime.selectedAcademicYearDocument ? runtime.getAcademicYearTitle(runtime.selectedAcademicYearDocument) : '')],
          ['Turma', runtime.getStringValue(student.className) || (runtime.selectedClass ? runtime.getClassTitle(runtime.selectedClass) : '')],
          ['Estado', student.active === false ? 'Inativo' : 'Ativo'],
        ],
      })
      window.open(schoolApi.getReportUrl(report.url), '_blank', 'noopener,noreferrer')
      runtime.setMessage(`Relatório criado em: ${report.path}`)
    } catch (reportError) {
      runtime.setClassesError(
        reportError instanceof Error ? reportError.message : 'Erro ao gerar relatório do aluno.',
      )
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

async function generateClassStudentsReport() {
    if (!runtime.selectedClass) {
      runtime.setClassesError('Seleciona uma turma antes de gerar o relatório.')
      return
    }

    const students = getStudentsForClass(runtime.selectedClass)
    if (students.length === 0) {
      runtime.setClassesError('A turma ainda não tem alunos para o relatório.')
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)
    runtime.setMessage(null)

    try {
      const report = await schoolApi.generateMomentAssessmentReport({
        title: `Alunos da turma - ${runtime.getClassTitle(runtime.selectedClass)}`,
        headers: [
          'ID',
          'Nome',
          'N.º escola',
          'Email escolar',
          'Encarregado de educação',
          'Contacto EE',
          'Email EE',
          'Estado',
        ],
        rows: students.map((student) => {
          const guardian = runtime.getRecordValue(student.guardian)

          return [
            String(student.id ?? ''),
            runtime.getStringValue(student.name),
            String(student.schoolNumber ?? ''),
            runtime.getStringValue(student.schoolEmail),
            runtime.getStringValue(guardian.name),
            runtime.getStringValue(guardian.phone),
            runtime.getStringValue(guardian.email),
            student.active === false ? 'Inativo' : 'Ativo',
          ]
        }),
      })
      window.open(schoolApi.getReportUrl(report.url), '_blank', 'noopener,noreferrer')
      runtime.setMessage(`Relatório criado em: ${report.path}`)
    } catch (reportError) {
      runtime.setClassesError(
        reportError instanceof Error ? reportError.message : 'Erro ao gerar relatório da turma.',
      )
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

function getNextStudentId(formStudents: StudentForm[]) {
    const existingIds = runtime.allStudents
      .map((student) => Number(student.id))
      .filter((studentId) => Number.isInteger(studentId))
    const formIds = formStudents.map((student) => student.id)

    return Math.max(0, ...existingIds, ...formIds) + 1
  }

  return {
    loadAllStudents,
    updateNewStudentField,
    handleSaveStudent,
    saveStudentToSelectedClass,
    saveExistingStudent,
    openStudentModal,
    openNewStudentFromDashboard,
    closeStudentModal,
    openEditStudentModal,
    deactivateStudent,
    deleteStudent,
    removeStudentFromClassForm,
    openStudentsDashboard,
    getClassStudentCount,
    getStudentsForClass,
    handleStudentsMenuOptionChange,
    generateStudentDetailReport,
    generateClassStudentsReport,
    getNextStudentId,
  }
}
