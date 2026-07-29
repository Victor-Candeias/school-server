import { schoolApi } from '../api/school'
import type { FormEvent } from 'react'
import type { SchoolDocument } from '../api/school'
import type { EvaluationMomentForm } from '../types'
import type { EvaluationQuestionForm } from '../types'
import { EMPTY_EVALUATION_MOMENT_FORM } from '../utils/constants'
import { EMPTY_EVALUATION_QUESTION_FORM } from '../utils/constants'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'

export function useEvaluationMoments(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'loadAllEvaluationMoments' | 'updateEvaluationMomentField' | 'updateNewEvaluationQuestion' | 'openEvaluationQuestionModal' | 'handleSaveEvaluationQuestion' | 'closeEvaluationQuestionModal' | 'removeEvaluationQuestion' | 'getEvaluationQuestionsTotal' | 'handleSaveEvaluationMoment' | 'openNewEvaluationMomentModal' | 'closeEvaluationMomentModal' | 'openEditEvaluationMomentModal' | 'deleteEvaluationMoment' | 'getEvaluationMomentsForClass' | 'getEvaluationMomentTypeLabel' | 'getEvaluationMomentSemester' | 'getEvaluationMomentQuestionCount' | 'getEvaluationMomentQuestions' | 'getQuestionMaxValue' | 'getEvaluationMomentMaxValue'> {
async function loadAllEvaluationMoments() {
    try {
      const existingMoments = await schoolApi.findEvaluationMoments({ userId: runtime.getLoggedUserId() })
      runtime.setAllEvaluationMoments(existingMoments)
    } catch (momentError) {
      const errorMessage =
        momentError instanceof Error ? momentError.message : 'Erro ao carregar momentos de avaliação.'

      runtime.setAllEvaluationMoments([])
      if (!errorMessage.includes('HTTP 400')) {
        runtime.setClassesError(errorMessage)
      }
    }
  }

function updateEvaluationMomentField<Field extends keyof EvaluationMomentForm>(
    field: Field,
    value: EvaluationMomentForm[Field],
  ) {
    runtime.setNewEvaluationMoment((currentMoment) => ({
      ...currentMoment,
      [field]: value,
    }))
  }

function updateNewEvaluationQuestion(field: keyof EvaluationQuestionForm, value: string) {
    runtime.setNewEvaluationQuestion((currentQuestion) => ({
      ...currentQuestion,
      [field]: value,
    }))
  }

function openEvaluationQuestionModal() {
    runtime.setNewEvaluationQuestion({
      questionNumber: String(runtime.newEvaluationMoment.questions.length + 1),
      value: '',
    })
    runtime.setIsEvaluationQuestionModalOpen(true)
  }

function handleSaveEvaluationQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    runtime.setNewEvaluationMoment((currentMoment) => ({
      ...currentMoment,
      questions: [
        ...currentMoment.questions,
        {
          questionNumber: runtime.newEvaluationQuestion.questionNumber.trim(),
          value: runtime.newEvaluationQuestion.value,
        },
      ],
    }))
    closeEvaluationQuestionModal()
  }

function closeEvaluationQuestionModal() {
    runtime.setIsEvaluationQuestionModalOpen(false)
    runtime.setNewEvaluationQuestion(EMPTY_EVALUATION_QUESTION_FORM)
  }

function removeEvaluationQuestion(questionIndex: number) {
    runtime.setNewEvaluationMoment((currentMoment) => ({
      ...currentMoment,
      questions: currentMoment.questions.filter((_, index) => index !== questionIndex),
    }))
  }

function getEvaluationQuestionsTotal() {
    return runtime.newEvaluationMoment.questions.reduce(
      (total, question) => total + (Number(question.value) || 0),
      0,
    )
  }

async function handleSaveEvaluationMoment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!runtime.selectedSchool || !runtime.selectedAcademicYearDocument || !runtime.selectedClass) {
      runtime.setClassesError('Seleciona uma escola, ano letivo e turma antes de criar o momento de avaliação.')
      return
    }

    const schoolId = runtime.getSchoolId(runtime.selectedSchool)
    const yearId = runtime.getDocumentId(runtime.selectedAcademicYearDocument)
    const classId = runtime.getDocumentId(runtime.selectedClass)

    if (!schoolId || !yearId || !classId) {
      runtime.setClassesError('Não foi possível identificar a escola, ano letivo ou turma selecionada.')
      return
    }

    const selectedTemplate = runtime.evaluationMomentTemplates.find(
      (template) => template.id === runtime.newEvaluationMoment.templateId,
    )

    if (!selectedTemplate) {
      runtime.setClassesError('Seleciona um template para o momento de avaliação.')
      return
    }

    const questions = runtime.newEvaluationMoment.questions.map((question) => ({
      number: question.questionNumber.trim(),
      value: Number(question.value),
    }))
    const hasIncompleteQuestions = questions.some(
      (question) => !question.number || !Number.isFinite(question.value) || question.value <= 0,
    )
    const questionsTotal = getEvaluationQuestionsTotal()

    if (runtime.newEvaluationMoment.questions.length > 0 && hasIncompleteQuestions) {
      runtime.setClassesError('Preenche o número e o valor de todas as questões.')
      return
    }

    if (runtime.newEvaluationMoment.questions.length > 0 && questionsTotal !== runtime.newEvaluationMoment.totalValue) {
      runtime.setClassesError(
        `O total das questões deve ser ${runtime.newEvaluationMoment.totalValue}. Total atual: ${questionsTotal}.`,
      )
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      const evaluationMomentPayload = {
        userId: runtime.getLoggedUserId(),
        schoolId,
        schoolName: runtime.getSchoolTitle(runtime.selectedSchool),
        yearId,
        academicYearId: yearId,
        academicYearName: runtime.getAcademicYearTitle(runtime.selectedAcademicYearDocument),
        classId,
        className: runtime.getClassTitle(runtime.selectedClass),
        name: runtime.newEvaluationMoment.name.trim(),
        type: selectedTemplate.type,
        evaluationMomentTemplateId: selectedTemplate.id,
        evaluationMomentTemplateType: selectedTemplate.type,
        evaluationMomentTemplateWeightPercentage: selectedTemplate.weightPercentage,
        semester: runtime.newEvaluationMoment.semester,
        totalValue: runtime.newEvaluationMoment.totalValue,
        questions,
      }

      if (runtime.editingEvaluationMomentId) {
        await schoolApi.updateEvaluationMoment(runtime.editingEvaluationMomentId, evaluationMomentPayload)
      } else {
        await schoolApi.addEvaluationMoment(evaluationMomentPayload)
      }

      closeEvaluationMomentModal()
      await loadAllEvaluationMoments()
    } catch (evaluationMomentError) {
      runtime.setClassesError(
        evaluationMomentError instanceof Error
          ? evaluationMomentError.message
          : 'Erro ao criar momento de avaliação.',
      )
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

function openNewEvaluationMomentModal() {
    runtime.setEditingEvaluationMomentId(null)
    runtime.setNewEvaluationMoment(EMPTY_EVALUATION_MOMENT_FORM)
    runtime.setClassesError(null)
    runtime.setIsEvaluationMomentModalOpen(true)
  }

function closeEvaluationMomentModal() {
    runtime.setIsEvaluationMomentModalOpen(false)
    closeEvaluationQuestionModal()
    runtime.setEditingEvaluationMomentId(null)
    runtime.setNewEvaluationMoment(EMPTY_EVALUATION_MOMENT_FORM)
  }

function openEditEvaluationMomentModal(moment: SchoolDocument) {
    const momentId = runtime.getDocumentId(moment)
    if (!momentId) {
      runtime.setClassesError('Não foi possível identificar o momento de avaliação para edição.')
      return
    }

    const questions = Array.isArray(moment.questions) ? moment.questions : []
    const storedTemplateId = runtime.getStringValue(moment.evaluationMomentTemplateId)
    const storedTemplateType = runtime.getStringValue(
      moment.evaluationMomentTemplateType || moment.type,
    )
    const matchingTemplate = runtime.evaluationMomentTemplates.find(
      (template) =>
        template.id === storedTemplateId
        || (!storedTemplateId && template.type === storedTemplateType),
    )

    runtime.setEditingEvaluationMomentId(momentId)
    runtime.setNewEvaluationMoment({
      name: runtime.getStringValue(moment.name),
      templateId: matchingTemplate?.id ?? '',
      semester: getEvaluationMomentSemester(moment),
      totalValue: moment.totalValue === 100 ? 100 : 20,
      questions: questions.map((question) => {
        const questionRecord = runtime.getRecordValue(question)

        return {
          questionNumber: runtime.getStringValue(questionRecord.number),
          value: String(questionRecord.value ?? ''),
        }
      }),
    })
    runtime.setClassesError(null)
    runtime.setIsEvaluationMomentModalOpen(true)
  }

async function deleteEvaluationMoment(moment: SchoolDocument) {
    const momentId = runtime.getDocumentId(moment)
    if (!momentId) {
      runtime.setClassesError('Não foi possível identificar o momento de avaliação para apagar.')
      return
    }

    if (!window.confirm('Tens a certeza que queres apagar este momento de avaliação?')) {
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      await schoolApi.deleteEvaluationMoment(momentId)
      await loadAllEvaluationMoments()
    } catch (momentError) {
      runtime.setClassesError(
        momentError instanceof Error
          ? momentError.message
          : 'Erro ao apagar momento de avaliação.',
      )
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

function getEvaluationMomentsForClass(schoolClass: SchoolDocument) {
    const classId = runtime.getDocumentId(schoolClass)
    const className = runtime.getClassTitle(schoolClass)

    return runtime.allEvaluationMoments.filter(
      (moment) => moment.classId === classId || moment.className === className,
    )
  }

function getEvaluationMomentTypeLabel(moment: SchoolDocument) {
    const momentType = runtime.getStringValue(
      moment.evaluationMomentTemplateType || moment.type,
    )

    if (momentType === 'questao-aula') {
      return 'Questão aula'
    }

    if (momentType === 'teste') {
      return 'Teste'
    }

    return momentType
  }

function getEvaluationMomentSemester(moment: SchoolDocument): '1' | '2' {
    return String(moment.semester ?? '1') === '2' ? '2' : '1'
  }

function getEvaluationMomentQuestionCount(moment: SchoolDocument) {
    return Array.isArray(moment.questions) ? moment.questions.length : 0
  }

function getEvaluationMomentQuestions(moment: SchoolDocument): EvaluationQuestionForm[] {
    if (!Array.isArray(moment.questions)) {
      return []
    }

    return moment.questions.map((question) => {
      const questionRecord = runtime.getRecordValue(question)

      return {
        questionNumber: runtime.getStringValue(questionRecord.number || questionRecord.questionNumber),
        value: String(questionRecord.value ?? ''),
      }
    })
  }

function getQuestionMaxValue(question: EvaluationQuestionForm) {
    return Number(question.value) || 0
  }

function getEvaluationMomentMaxValue(moment: SchoolDocument) {
    return Number(moment.totalValue) || 0
  }

  return {
    loadAllEvaluationMoments,
    updateEvaluationMomentField,
    updateNewEvaluationQuestion,
    openEvaluationQuestionModal,
    handleSaveEvaluationQuestion,
    closeEvaluationQuestionModal,
    removeEvaluationQuestion,
    getEvaluationQuestionsTotal,
    handleSaveEvaluationMoment,
    openNewEvaluationMomentModal,
    closeEvaluationMomentModal,
    openEditEvaluationMomentModal,
    deleteEvaluationMoment,
    getEvaluationMomentsForClass,
    getEvaluationMomentTypeLabel,
    getEvaluationMomentSemester,
    getEvaluationMomentQuestionCount,
    getEvaluationMomentQuestions,
    getQuestionMaxValue,
    getEvaluationMomentMaxValue,
  }
}
