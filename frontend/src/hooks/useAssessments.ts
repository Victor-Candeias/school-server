import { schoolApi } from '../api/school'
import type { SchoolDocument } from '../api/school'
import type { EvaluationQuestionForm } from '../types'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'

export function useAssessments(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'loadAllStudentMomentValues' | 'getSelectedGradingMoment' | 'getStudentMomentValueKey' | 'getStudentMomentValueRecord' | 'isSameStudentMomentValue' | 'mergeStudentMomentValues' | 'hasStudentMomentValueRecord' | 'buildStudentMomentValuePayload' | 'handleSelectGradingMoment' | 'getSavedStudentMomentCellValue' | 'getStudentMomentCellValue' | 'getAssessmentChangePayloads' | 'hasUnsavedAssessmentChanges' | 'canLeaveAssessmentMoment' | 'removeAssessmentDraftsForMoment' | 'getStudentMomentTotal' | 'getAssessmentsSemesterMoments' | 'getStudentSavedMomentTotal' | 'getAllStudentsForMomentData' | 'getAssessmentsDashboardRows' | 'buildSemesterEvaluationsPayload' | 'saveSemesterEvaluations' | 'getStudentMomentProjectedTotal' | 'getAssessmentCellValidationError' | 'updateAssessmentCellDraft' | 'saveAssessmentCell' | 'saveAssessmentChanges'> {
async function loadAllStudentMomentValues() {
    try {
      const existingValues = await schoolApi.findStudentMomentValues({ userId: runtime.getLoggedUserId() })
      runtime.setAllStudentMomentValues(existingValues)
    } catch (valueError) {
      const errorMessage =
        valueError instanceof Error ? valueError.message : 'Erro ao carregar valores dos alunos.'

      runtime.setAllStudentMomentValues([])
      if (!errorMessage.includes('HTTP 400')) {
        runtime.setClassesError(errorMessage)
      }
    }
  }

function getSelectedGradingMoment() {
    return runtime.allEvaluationMoments.find((moment) => runtime.getDocumentId(moment) === runtime.selectedGradingMomentId)
  }

function getStudentMomentValueKey(momentId: string, studentId: string, questionNumber: string) {
    return `${momentId}:${studentId}:${questionNumber}`
  }

function getStudentMomentValueRecord(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
  ) {
    const momentId = runtime.getDocumentId(moment)
    const studentId = runtime.getDocumentId(student)

    return runtime.allStudentMomentValues.find(
      (value) =>
        value.momentId === momentId &&
        value.studentId === studentId &&
        value.questionNumber === question.questionNumber,
    )
  }

function isSameStudentMomentValue(leftValue: SchoolDocument, rightValue: SchoolDocument) {
    return (
      leftValue.momentId === rightValue.momentId &&
      leftValue.studentId === rightValue.studentId &&
      leftValue.questionNumber === rightValue.questionNumber
    )
  }

function mergeStudentMomentValues(nextValues: SchoolDocument[]) {
    if (nextValues.length === 0) {
      return
    }

    runtime.setAllStudentMomentValues((currentValues) => [
      ...currentValues.filter(
        (currentValue) =>
          !nextValues.some((nextValue) => isSameStudentMomentValue(currentValue, nextValue)),
      ),
      ...nextValues,
    ])
  }

function hasStudentMomentValueRecord(
    values: SchoolDocument[],
    momentId: string,
    studentId: string,
    questionNumber: string,
  ) {
    return values.some(
      (value) =>
        value.momentId === momentId &&
        value.studentId === studentId &&
        value.questionNumber === questionNumber,
    )
  }

function buildStudentMomentValuePayload(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
    value: string,
  ): SchoolDocument | null {
    if (!runtime.selectedSchool || !runtime.selectedAcademicYearDocument || !runtime.selectedClass) {
      runtime.setClassesError('Seleciona escola, ano letivo e turma antes de gravar valores.')
      return null
    }

    const schoolId = runtime.getSchoolId(runtime.selectedSchool)
    const yearId = runtime.getDocumentId(runtime.selectedAcademicYearDocument)
    const classId = runtime.getDocumentId(runtime.selectedClass)
    const momentId = runtime.getDocumentId(moment)
    const studentId = runtime.getDocumentId(student)

    if (!schoolId || !yearId || !classId || !momentId || !studentId) {
      runtime.setClassesError('Não foi possível identificar todos os dados para gravar o valor.')
      return null
    }

    return {
      userId: runtime.getLoggedUserId(),
      schoolId,
      schoolName: runtime.getSchoolTitle(runtime.selectedSchool),
      yearId,
      academicYearId: yearId,
      academicYearName: runtime.getAcademicYearTitle(runtime.selectedAcademicYearDocument),
      classId,
      className: runtime.getClassTitle(runtime.selectedClass),
      momentId,
      name: runtime.getStringValue(moment.name),
      momentName: runtime.getStringValue(moment.name),
      studentId,
      studentUniqueId: student.id,
      studentName: runtime.getStringValue(student.name),
      questionNumber: question.questionNumber,
      questionValue: Number(question.value) || 0,
      value: value.trim() || '0',
    }
  }

async function handleSelectGradingMoment(momentId: string) {
    if (momentId !== runtime.selectedGradingMomentId && !canLeaveAssessmentMoment()) {
      return
    }

    runtime.setSelectedGradingMomentId(momentId)
    runtime.setAssessmentCellDrafts({})

    if (!momentId) {
      return
    }

    const moment = runtime.allEvaluationMoments.find((evaluationMoment) => runtime.getDocumentId(evaluationMoment) === momentId)
    if (!moment || !runtime.selectedClass) {
      runtime.setClassesError('Não foi possível identificar o momento de avaliação selecionado.')
      return
    }

    const classId = runtime.getDocumentId(runtime.selectedClass)
    if (!classId) {
      runtime.setClassesError('Não foi possível identificar a turma selecionada.')
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      let existingValues: SchoolDocument[] = []
      try {
        existingValues = await schoolApi.findStudentMomentValues({
          userId: runtime.getLoggedUserId(),
          classId,
          momentId,
        })
      } catch (loadError) {
        if (!(loadError instanceof Error) || !loadError.message.includes('HTTP 400')) {
          throw loadError
        }
      }

      const students = runtime.getStudentsForClass(runtime.selectedClass)
      const questions = runtime.getEvaluationMomentQuestions(moment)
      const missingValuePayloads = students.flatMap((student) => {
        const studentId = runtime.getDocumentId(student)
        if (!studentId) {
          return []
        }

        return questions
          .filter(
            (question) =>
              !hasStudentMomentValueRecord(
                existingValues,
                momentId,
                studentId,
                question.questionNumber,
              ),
          )
          .map((question) => buildStudentMomentValuePayload(student, moment, question, '0'))
          .filter((payload): payload is SchoolDocument => payload !== null)
      })
      const createdValues = await Promise.all(
        missingValuePayloads.map(async (payload) => {
          const savedValue = await schoolApi.saveStudentMomentValue(payload)

          return {
            ...payload,
            _id: savedValue.id,
          }
        }),
      )

      mergeStudentMomentValues([...existingValues, ...createdValues])
    } catch (valueError) {
      runtime.setClassesError(
        valueError instanceof Error
          ? valueError.message
          : 'Erro ao carregar os valores do momento de avaliação.',
      )
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

function getSavedStudentMomentCellValue(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
  ) {
    const savedValue = getStudentMomentValueRecord(student, moment, question)
    return savedValue?.value === undefined || savedValue?.value === null || savedValue.value === ''
      ? '0'
      : String(savedValue.value)
  }

function getStudentMomentCellValue(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
  ) {
    const momentId = runtime.getDocumentId(moment)
    const studentId = runtime.getDocumentId(student)

    if (!momentId || !studentId) {
      return ''
    }

    const draftKey = getStudentMomentValueKey(momentId, studentId, question.questionNumber)
    if (draftKey in runtime.assessmentCellDrafts) {
      return runtime.assessmentCellDrafts[draftKey]
    }

    return getSavedStudentMomentCellValue(student, moment, question)
  }

function getAssessmentChangePayloads(moment = getSelectedGradingMoment()) {
    if (!moment || !runtime.selectedClass) {
      return []
    }

    return runtime.getStudentsForClass(runtime.selectedClass).flatMap((student) =>
      runtime.getEvaluationMomentQuestions(moment).flatMap((question) => {
        const momentId = runtime.getDocumentId(moment)
        const studentId = runtime.getDocumentId(student)
        if (!momentId || !studentId) {
          return []
        }

        const draftKey = getStudentMomentValueKey(momentId, studentId, question.questionNumber)
        if (!(draftKey in runtime.assessmentCellDrafts)) {
          return []
        }

        const normalizedDraftValue = runtime.assessmentCellDrafts[draftKey].trim() || '0'
        if (getSavedStudentMomentCellValue(student, moment, question) === normalizedDraftValue) {
          return []
        }

        const payload = buildStudentMomentValuePayload(student, moment, question, normalizedDraftValue)
        return payload ? [payload] : []
      }),
    )
  }

function hasUnsavedAssessmentChanges() {
    const moment = getSelectedGradingMoment()
    if (!moment || !runtime.selectedClass) {
      return false
    }

    return runtime.getStudentsForClass(runtime.selectedClass).some((student) =>
      runtime.getEvaluationMomentQuestions(moment).some((question) => {
        const momentId = runtime.getDocumentId(moment)
        const studentId = runtime.getDocumentId(student)
        if (!momentId || !studentId) {
          return false
        }

        const draftKey = getStudentMomentValueKey(momentId, studentId, question.questionNumber)
        return (
          draftKey in runtime.assessmentCellDrafts &&
          (runtime.assessmentCellDrafts[draftKey].trim() || '0') !== getSavedStudentMomentCellValue(student, moment, question)
        )
      }),
    )
  }

function canLeaveAssessmentMoment() {
    if (!hasUnsavedAssessmentChanges()) {
      return true
    }

    window.alert('Existem alterações por gravar. Clica em Gravar antes de sair deste momento de avaliação.')
    return false
  }

function removeAssessmentDraftsForMoment(momentId: string) {
    runtime.setAssessmentCellDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts }

      Object.keys(nextDrafts).forEach((draftKey) => {
        if (draftKey.startsWith(`${momentId}:`)) {
          delete nextDrafts[draftKey]
        }
      })

      return nextDrafts
    })
  }

function getStudentMomentTotal(student: SchoolDocument, moment: SchoolDocument) {
    return runtime.getEvaluationMomentQuestions(moment).reduce(
      (total, question) => total + (Number(getStudentMomentCellValue(student, moment, question)) || 0),
      0,
    )
  }

function getAssessmentsSemesterMoments() {
    if (!runtime.selectedClass || !runtime.selectedAssessmentsSemester) {
      return []
    }

    return runtime.getEvaluationMomentsForClass(runtime.selectedClass).filter(
      (moment) =>
        runtime.getEvaluationMomentSemester(moment) === runtime.selectedAssessmentsSemester,
    )
  }

function getStudentSavedMomentTotal(student: SchoolDocument, moment: SchoolDocument) {
    return runtime.getEvaluationMomentQuestions(moment).reduce(
      (total, question) => total + (Number(getSavedStudentMomentCellValue(student, moment, question)) || 0),
      0,
    )
  }

function getAllStudentsForMomentData(students: SchoolDocument[], moment: SchoolDocument) {
    return students.map((student) => ({
      name: (runtime.getStringValue(student.name) as string) || 'Aluno',
      Nota: getStudentSavedMomentTotal(student, moment),
      Máximo: runtime.getEvaluationMomentMaxValue(moment) || 100,
    }))
  }

function getAssessmentsDashboardRows() {
    if (!runtime.selectedClass) {
      return []
    }

    const moments = getAssessmentsSemesterMoments()
    return runtime.getStudentsForClass(runtime.selectedClass).map((student) => [
      runtime.getStringValue(student.name),
      ...moments.map((moment) => String(getStudentSavedMomentTotal(student, moment))),
    ])
  }

function buildSemesterEvaluationsPayload() {
    if (!runtime.selectedSchool || !runtime.selectedAcademicYearDocument || !runtime.selectedClass || !runtime.selectedAssessmentsSemester) {
      runtime.setClassesError('Seleciona escola, ano letivo, turma e semestre antes de gravar avaliações.')
      return null
    }

    const schoolId = runtime.getSchoolId(runtime.selectedSchool)
    const yearId = runtime.getDocumentId(runtime.selectedAcademicYearDocument)
    const classId = runtime.getDocumentId(runtime.selectedClass)

    if (!schoolId || !yearId || !classId) {
      runtime.setClassesError('Não foi possível identificar todos os dados para gravar avaliações.')
      return null
    }

    const moments = getAssessmentsSemesterMoments()
    const headers = [
      'Aluno',
      ...moments.map((moment) => `${runtime.getStringValue(moment.name)} (${runtime.getEvaluationMomentMaxValue(moment)})`),
    ]

    return {
      userId: runtime.getLoggedUserId(),
      schoolId,
      schoolName: runtime.getSchoolTitle(runtime.selectedSchool),
      yearId,
      academicYearId: yearId,
      academicYearName: runtime.getAcademicYearTitle(runtime.selectedAcademicYearDocument),
      classId,
      className: runtime.getClassTitle(runtime.selectedClass),
      semester: runtime.selectedAssessmentsSemester,
      title: `Avaliações - ${runtime.selectedAssessmentsSemester}.º semestre`,
      tests: moments.map((moment) => ({
        id: runtime.getDocumentId(moment),
        name: runtime.getStringValue(moment.name),
        totalValue: runtime.getEvaluationMomentMaxValue(moment),
      })),
      headers,
      rows: getAssessmentsDashboardRows(),
    }
  }

async function saveSemesterEvaluations() {
    const payload = buildSemesterEvaluationsPayload()
    if (!payload) {
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      await schoolApi.saveSemesterEvaluations(payload)
      runtime.setMessage('Avaliações gravadas com sucesso.')
    } catch (saveError) {
      runtime.setClassesError(saveError instanceof Error ? saveError.message : 'Erro ao gravar avaliações.')
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

function getStudentMomentProjectedTotal(
    student: SchoolDocument,
    moment: SchoolDocument,
    targetQuestion: EvaluationQuestionForm,
    targetValue: string,
  ) {
    return runtime.getEvaluationMomentQuestions(moment).reduce((total, question) => {
      const value =
        question.questionNumber === targetQuestion.questionNumber
          ? targetValue
          : getStudentMomentCellValue(student, moment, question)

      return total + (Number(value) || 0)
    }, 0)
  }

function getAssessmentCellValidationError(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
    value: string,
  ) {
    const normalizedValue = value.trim() || '0'
    if (!normalizedValue) {
      return null
    }

    const numericValue = Number(normalizedValue)
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      return 'Insere um valor válido para a questão.'
    }

    const questionMaxValue = runtime.getQuestionMaxValue(question)
    if (numericValue > questionMaxValue) {
      return `O valor da questão ${question.questionNumber} não pode ultrapassar ${questionMaxValue}.`
    }

    const projectedTotal = getStudentMomentProjectedTotal(student, moment, question, normalizedValue)
    const momentMaxValue = runtime.getEvaluationMomentMaxValue(moment)
    if (projectedTotal > momentMaxValue) {
      return `O total do aluno não pode ultrapassar ${momentMaxValue}. Total atual: ${projectedTotal}.`
    }

    return null
  }

function updateAssessmentCellDraft(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
    value: string,
  ) {
    const momentId = runtime.getDocumentId(moment)
    const studentId = runtime.getDocumentId(student)

    if (!momentId || !studentId) {
      return
    }

    const validationError = getAssessmentCellValidationError(student, moment, question, value)
    if (validationError) {
      runtime.setClassesError(validationError)
      return
    }

    runtime.setClassesError(null)
    runtime.setAssessmentCellDrafts((currentDrafts) => ({
      ...currentDrafts,
      [getStudentMomentValueKey(momentId, studentId, question.questionNumber)]: value,
    }))
  }

async function saveAssessmentCell(
    student: SchoolDocument,
    moment: SchoolDocument,
    question: EvaluationQuestionForm,
    value: string,
  ) {
    const momentId = runtime.getDocumentId(moment)
    const studentId = runtime.getDocumentId(student)
    if (!momentId || !studentId) {
      runtime.setClassesError('Não foi possível identificar todos os dados para gravar o valor.')
      return
    }

    const normalizedValue = value.trim() || '0'
    const validationError = getAssessmentCellValidationError(student, moment, question, normalizedValue)
    if (validationError) {
      runtime.setClassesError(validationError)
      return
    }

    const draftKey = getStudentMomentValueKey(momentId, studentId, question.questionNumber)
    runtime.setClassesError(null)
    runtime.setAssessmentCellDrafts((currentDrafts) => ({
      ...currentDrafts,
      [draftKey]: normalizedValue,
    }))
  }

async function saveAssessmentChanges() {
    const moment = getSelectedGradingMoment()
    const momentId = moment ? runtime.getDocumentId(moment) : null
    const valuePayloads = getAssessmentChangePayloads(moment)
    if (!moment || !momentId || valuePayloads.length === 0) {
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      const savedValues = await Promise.all(
        valuePayloads.map(async (valuePayload) => {
          const savedRecord = runtime.allStudentMomentValues.find((currentValue) =>
            isSameStudentMomentValue(currentValue, valuePayload)
          )
          const savedValue = await schoolApi.saveStudentMomentValue(valuePayload)

          return {
            ...valuePayload,
            _id: savedValue.id ?? savedRecord?._id,
          }
        }),
      )

      mergeStudentMomentValues(savedValues)
      removeAssessmentDraftsForMoment(momentId)
      runtime.setMessage('Valores de avaliação gravados com sucesso.')
    } catch (saveError) {
      runtime.setClassesError(saveError instanceof Error ? saveError.message : 'Erro ao gravar valores dos alunos.')
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

  return {
    loadAllStudentMomentValues,
    getSelectedGradingMoment,
    getStudentMomentValueKey,
    getStudentMomentValueRecord,
    isSameStudentMomentValue,
    mergeStudentMomentValues,
    hasStudentMomentValueRecord,
    buildStudentMomentValuePayload,
    handleSelectGradingMoment,
    getSavedStudentMomentCellValue,
    getStudentMomentCellValue,
    getAssessmentChangePayloads,
    hasUnsavedAssessmentChanges,
    canLeaveAssessmentMoment,
    removeAssessmentDraftsForMoment,
    getStudentMomentTotal,
    getAssessmentsSemesterMoments,
    getStudentSavedMomentTotal,
    getAllStudentsForMomentData,
    getAssessmentsDashboardRows,
    buildSemesterEvaluationsPayload,
    saveSemesterEvaluations,
    getStudentMomentProjectedTotal,
    getAssessmentCellValidationError,
    updateAssessmentCellDraft,
    saveAssessmentCell,
    saveAssessmentChanges,
  }
}
