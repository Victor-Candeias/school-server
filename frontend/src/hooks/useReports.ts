import { schoolApi } from '../api/school'
import type { SchoolDocument } from '../api/school'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'

export function useReports(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'generateSemesterEvaluationsReport' | 'generateAssessmentReport'> {
async function generateSemesterEvaluationsReport() {
    const payload = runtime.buildSemesterEvaluationsPayload()
    if (!payload) {
      return
    }

    if (runtime.getAssessmentsSemesterMoments().length === 0) {
      runtime.setClassesError('O semestre selecionado ainda não tem testes.')
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)
    runtime.setMessage(null)

    try {
      const report = await schoolApi.generateMomentAssessmentReport({
        title: payload.title,
        headers: payload.headers,
        rows: payload.rows,
      })
      window.open(schoolApi.getReportUrl(report.url), '_blank', 'noopener,noreferrer')
      runtime.setMessage(`Relatório criado em: ${report.path}`)
    } catch (reportError) {
      runtime.setClassesError(
        reportError instanceof Error ? reportError.message : 'Erro ao gerar relatório de avaliações.',
      )
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

async function generateAssessmentReport(momentToReport?: SchoolDocument) {
    const moment = momentToReport ?? runtime.getSelectedGradingMoment()
    if (!runtime.selectedClass || !moment) {
      runtime.setClassesError('Seleciona um momento de avaliação antes de gerar o relatório.')
      return
    }

    const questions = runtime.getEvaluationMomentQuestions(moment)
    if (questions.length === 0) {
      runtime.setClassesError('O momento de avaliação selecionado não tem questões para o relatório.')
      return
    }

    const students = runtime.getStudentsForClass(runtime.selectedClass)
    if (students.length === 0) {
      runtime.setClassesError('A turma ainda não tem alunos para o relatório.')
      return
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)
    runtime.setMessage(null)

    try {
      const report = await schoolApi.generateMomentAssessmentReport({
        title: runtime.getStringValue(moment.name),
        headers: [
          'Aluno',
          ...questions.map((question) => `Q${question.questionNumber} (${runtime.getQuestionMaxValue(question)})`),
          'Total',
          '%',
        ],
        rows: students.map((student) => [
          runtime.getStringValue(student.name),
          ...questions.map((question) => runtime.getStudentMomentCellValue(student, moment, question) || '0'),
          String(runtime.getStudentMomentTotal(student, moment)),
          runtime.getStudentMomentPercentage(student, moment),
        ]),
      })
      window.open(schoolApi.getReportUrl(report.url), '_blank', 'noopener,noreferrer')
      runtime.setMessage(`Relatório criado em: ${report.path}`)
    } catch (reportError) {
      runtime.setClassesError(
        reportError instanceof Error ? reportError.message : 'Erro ao gerar relatório.',
      )
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

  return {
    generateSemesterEvaluationsReport,
    generateAssessmentReport,
  }
}
