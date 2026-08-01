import { schoolApi } from '../api/school'
import type { SchoolDocument } from '../api/school'
import type { EvaluationQuestionForm } from '../types'
import type { ApplicationActions, ApplicationRuntime, AssessmentMomentGroup } from './applicationRuntime'

export function useAssessments(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'loadAllStudentMomentValues' | 'getSelectedGradingMoment' | 'getStudentMomentValueKey' | 'getStudentMomentValueRecord' | 'isSameStudentMomentValue' | 'mergeStudentMomentValues' | 'hasStudentMomentValueRecord' | 'buildStudentMomentValuePayload' | 'handleSelectGradingMoment' | 'getSavedStudentMomentCellValue' | 'getStudentMomentCellValue' | 'getAssessmentChangePayloads' | 'hasUnsavedAssessmentChanges' | 'canLeaveAssessmentMoment' | 'removeAssessmentDraftsForMoment' | 'getStudentMomentServerMetric' | 'getStudentMomentTotal' | 'getStudentMomentProcessedPercentageValue' | 'handleSelectAssessmentsSemester' | 'getAssessmentsSemesterMoments' | 'getAssessmentsSemesterMomentGroups' | 'getStudentSavedMomentTotal' | 'getStudentAssessmentGroupAverage' | 'getStudentAssessmentGroupWeightedValue' | 'getStudentAssessmentFinalValue' | 'getStudentAssessmentFinalGrade' | 'getStudentAssessmentFinalStyle' | 'formatAssessmentValue' | 'getAllStudentsForMomentData' | 'getAssessmentsDashboardRows' | 'buildSemesterEvaluationsPayload' | 'saveSemesterEvaluations' | 'updateAssessmentCellDraft' | 'saveAssessmentCell' | 'saveAssessmentChanges'> {
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

function getStudentMomentServerMetric(
    student: SchoolDocument,
    moment: SchoolDocument,
    metric: 'studentMomentTotal' | 'studentMomentPercentage',
  ) {
    const momentId = runtime.getDocumentId(moment)
    const studentId = runtime.getDocumentId(student)
    if (!momentId || !studentId) {
      return null
    }

    const matchingValue = runtime.allStudentMomentValues.find(
      (value) => value.momentId === momentId && value.studentId === studentId && value[metric] !== undefined,
    )
    const processedValue = Number(matchingValue?.[metric])

    return Number.isFinite(processedValue) ? processedValue : null
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
    const serverTotal = getStudentMomentServerMetric(student, moment, 'studentMomentTotal')
    if (serverTotal !== null) {
      return serverTotal
    }

    return 0
  }

function getStudentMomentProcessedPercentageValue(student: SchoolDocument, moment: SchoolDocument) {
    return getStudentMomentServerMetric(student, moment, 'studentMomentPercentage')
  }

function getSemesterEvaluationRequest(semester: string): SchoolDocument | null {
    if (!runtime.selectedSchool || !runtime.selectedAcademicYearDocument || !runtime.selectedClass || !semester) {
      runtime.setClassesError('Seleciona escola, ano letivo, turma e semestre antes de consultar avaliações.')
      return null
    }

    const schoolId = runtime.getSchoolId(runtime.selectedSchool)
    const yearId = runtime.getDocumentId(runtime.selectedAcademicYearDocument)
    const classId = runtime.getDocumentId(runtime.selectedClass)

    if (!schoolId || !yearId || !classId) {
      runtime.setClassesError('Não foi possível identificar todos os dados para consultar avaliações.')
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
      semester,
      title: `Avaliações - ${semester}.º semestre`,
    }
  }

async function handleSelectAssessmentsSemester(semester: string) {
    runtime.setSelectedAssessmentsSemester(semester)
    runtime.setSemesterAssessmentSummary(null)

    if (!semester) {
      runtime.setClassesError(null)
      return
    }

    const payload = getSemesterEvaluationRequest(semester)
    if (!payload) {
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      const summary = await schoolApi.calculateSemesterEvaluations(payload)
      runtime.setSemesterAssessmentSummary(summary)
    } catch (summaryError) {
      runtime.setClassesError(
        summaryError instanceof Error ? summaryError.message : 'Erro ao calcular avaliações do semestre.',
      )
    } finally {
      runtime.setIsLoadingClasses(false)
    }
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

function getAssessmentsSemesterMomentGroups() {
    const summaryGroups = runtime.semesterAssessmentSummary?.groups
    if (Array.isArray(summaryGroups)) {
      return summaryGroups.flatMap((group) => {
        if (!group || typeof group !== 'object' || Array.isArray(group)) {
          return []
        }

        const groupRecord = group as Record<string, unknown>
        const moments = Array.isArray(groupRecord.moments) ? groupRecord.moments : []

        return [{
          type: runtime.getStringValue(groupRecord.type) || 'Sem tipo',
          weightPercentage: Number(groupRecord.weightPercentage) || 0,
          moments: moments.map((moment) => {
            const momentRecord = runtime.getRecordValue(moment)
            const summaryMomentId = runtime.getStringValue(momentRecord.id)
            return runtime.allEvaluationMoments.find((evaluationMoment) =>
              runtime.getDocumentId(evaluationMoment) === summaryMomentId
            ) ?? momentRecord
          }),
        }]
      })
    }

    return getAssessmentsSemesterMoments().reduce<AssessmentMomentGroup[]>((groups, moment) => {
      const type = runtime.getEvaluationMomentTypeLabel(moment) || 'Sem tipo'
      const existingGroup = groups.find((group) => group.type === type)
      const storedWeightPercentage = Number(moment.evaluationMomentTemplateWeightPercentage)
      const configuredWeightPercentage = runtime.evaluationMomentTemplates.find(
        (template) => template.type === type,
      )?.weightPercentage
      const weightPercentage = configuredWeightPercentage !== undefined
        && Number.isFinite(configuredWeightPercentage)
        ? configuredWeightPercentage
        : Number.isFinite(storedWeightPercentage)
          ? storedWeightPercentage
          : 0

      if (existingGroup) {
        existingGroup.moments.push(moment)
      } else {
        groups.push({ type, weightPercentage, moments: [moment] })
      }

      return groups
    }, [])
  }

function getStudentSavedMomentTotal(student: SchoolDocument, moment: SchoolDocument) {
    const serverMoment = getStudentAssessmentSummaryMoment(student, moment)
    if (serverMoment) {
      return Number(serverMoment.studentTotal) || 0
    }

    return getStudentMomentTotal(student, moment)
  }

function getStudentAssessmentSummary(student: SchoolDocument) {
    const summaryStudents = runtime.semesterAssessmentSummary?.students
    const studentId = runtime.getDocumentId(student)

    if (!Array.isArray(summaryStudents) || !studentId) {
      return null
    }

    const matchingSummary = summaryStudents.find((summaryStudent) => {
      const summaryRecord = runtime.getRecordValue(summaryStudent)
      return runtime.getStringValue(summaryRecord.studentId) === studentId
    })

    return matchingSummary ? runtime.getRecordValue(matchingSummary) : null
  }

function getStudentAssessmentSummaryGroup(student: SchoolDocument, groupType: string) {
    const studentSummary = getStudentAssessmentSummary(student)
    const groups = studentSummary?.groups

    if (!Array.isArray(groups)) {
      return null
    }

    const matchingGroup = groups.find((group) => {
      const groupRecord = runtime.getRecordValue(group)
      return runtime.getStringValue(groupRecord.type) === groupType
    })

    return matchingGroup ? runtime.getRecordValue(matchingGroup) : null
  }

function getStudentAssessmentSummaryMoment(student: SchoolDocument, moment: SchoolDocument) {
    const studentSummary = getStudentAssessmentSummary(student)
    const groups = studentSummary?.groups
    const momentId = runtime.getDocumentId(moment)

    if (!Array.isArray(groups) || !momentId) {
      return null
    }

    for (const group of groups) {
      const groupRecord = runtime.getRecordValue(group)
      const moments = groupRecord.moments
      if (!Array.isArray(moments)) {
        continue
      }

      const matchingMoment = moments.find((summaryMoment) => {
        const summaryMomentRecord = runtime.getRecordValue(summaryMoment)
        return runtime.getStringValue(summaryMomentRecord.id) === momentId
      })
      if (matchingMoment) {
        return runtime.getRecordValue(matchingMoment)
      }
    }

    return null
  }

function getStudentAssessmentGroupAverage(student: SchoolDocument, group: AssessmentMomentGroup) {
    const serverGroup = getStudentAssessmentSummaryGroup(student, group.type)
    if (serverGroup) {
      return Number(serverGroup.average) || 0
    }

    if (group.moments.length === 0) {
      return 0
    }

    const total = group.moments.reduce(
      (total, moment) => total + getStudentSavedMomentTotal(student, moment),
      0,
    )
    return total / group.moments.length
  }

function getStudentAssessmentGroupWeightedValue(student: SchoolDocument, group: AssessmentMomentGroup) {
    const serverGroup = getStudentAssessmentSummaryGroup(student, group.type)
    if (serverGroup) {
      return Number(serverGroup.weightedValue) || 0
    }

    return getStudentAssessmentGroupAverage(student, group) * (group.weightPercentage / 100)
  }

function getStudentAssessmentFinalValue(student: SchoolDocument, groups: AssessmentMomentGroup[]) {
    const serverStudent = getStudentAssessmentSummary(student)
    if (serverStudent) {
      return Number(serverStudent.finalValue) || 0
    }

    return groups.reduce(
      (finalValue, group) => finalValue + getStudentAssessmentGroupWeightedValue(student, group),
      0,
    )
  }

function getStudentAssessmentFinalGrade(student: SchoolDocument, groups: AssessmentMomentGroup[]) {
    const serverStudent = getStudentAssessmentSummary(student)
    if (serverStudent) {
      return Number(serverStudent.finalGrade) || 0
    }

    void groups
    return 0
  }

function getStudentAssessmentFinalStyle(student: SchoolDocument, groups: AssessmentMomentGroup[]) {
    const serverStudent = getStudentAssessmentSummary(student)
    if (serverStudent) {
      return {
        backgroundColor: runtime.getStringValue(serverStudent.finalBackgroundColor) || '#ffffff',
        color: runtime.getStringValue(serverStudent.finalTextColor) || '#0f172a',
      }
    }

    void groups
    return {
      backgroundColor: '#ffffff',
      color: '#0f172a',
    }
  }

function formatAssessmentValue(value: number) {
    return String(Number(value.toFixed(2)))
  }

function getAllStudentsForMomentData(students: SchoolDocument[], moment: SchoolDocument) {
    return students.map((student) => ({
      name: (runtime.getStringValue(student.name) as string) || 'Aluno',
      Nota: getStudentSavedMomentTotal(student, moment),
      Máximo: runtime.getEvaluationMomentMaxValue(moment) || 100,
    }))
  }

function getAssessmentsDashboardRows() {
    const summaryRows = runtime.semesterAssessmentSummary?.rows
    if (Array.isArray(summaryRows)) {
      return summaryRows.map((row) => Array.isArray(row) ? row.map(String) : [])
    }

    if (!runtime.selectedClass) {
      return []
    }

    const groups = getAssessmentsSemesterMomentGroups()
    return runtime.getStudentsForClass(runtime.selectedClass).map((student) => [
      runtime.getStringValue(student.name),
      ...groups.flatMap((group) => [
        ...group.moments.map((moment) => String(getStudentSavedMomentTotal(student, moment))),
        formatAssessmentValue(getStudentAssessmentGroupAverage(student, group)),
        formatAssessmentValue(getStudentAssessmentGroupWeightedValue(student, group)),
      ]),
      formatAssessmentValue(getStudentAssessmentFinalValue(student, groups)),
    ])
  }

function buildSemesterEvaluationsPayload() {
    return getSemesterEvaluationRequest(runtime.selectedAssessmentsSemester)
  }

async function saveSemesterEvaluations() {
    const payload = buildSemesterEvaluationsPayload()
    if (!payload) {
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      const savedSummary = await schoolApi.saveSemesterEvaluations(payload)
      runtime.setSemesterAssessmentSummary(savedSummary.value ?? payload)
      runtime.setMessage('Avaliações gravadas com sucesso.')
    } catch (saveError) {
      runtime.setClassesError(saveError instanceof Error ? saveError.message : 'Erro ao gravar avaliações.')
    } finally {
      runtime.setIsLoadingClasses(false)
    }
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
    const classId = runtime.selectedClass ? runtime.getDocumentId(runtime.selectedClass) : null
    const valuePayloads = getAssessmentChangePayloads(moment)
    if (!moment || !momentId || !classId || valuePayloads.length === 0) {
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
          const savedDocument = savedValue.value ?? valuePayload

          return {
            ...valuePayload,
            ...savedDocument,
            _id: savedValue.id ?? savedDocument._id ?? savedRecord?._id,
          }
        }),
      )

      mergeStudentMomentValues(savedValues)
      const refreshedValues = await schoolApi.findStudentMomentValues({
        userId: runtime.getLoggedUserId(),
        classId,
        momentId,
      })
      mergeStudentMomentValues(refreshedValues)
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
    getStudentMomentServerMetric,
    getStudentMomentTotal,
    getStudentMomentProcessedPercentageValue,
    handleSelectAssessmentsSemester,
    getAssessmentsSemesterMoments,
    getAssessmentsSemesterMomentGroups,
    getStudentSavedMomentTotal,
    getStudentAssessmentGroupAverage,
    getStudentAssessmentGroupWeightedValue,
    getStudentAssessmentFinalValue,
    getStudentAssessmentFinalGrade,
    getStudentAssessmentFinalStyle,
    formatAssessmentValue,
    getAllStudentsForMomentData,
    getAssessmentsDashboardRows,
    buildSemesterEvaluationsPayload,
    saveSemesterEvaluations,
    updateAssessmentCellDraft,
    saveAssessmentCell,
    saveAssessmentChanges,
  }
}
