import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'
import { useEvaluationMoments } from './useEvaluationMoments'
import { useAssessments } from './useAssessments'
import { useCharts } from './useCharts'
import { useReports } from './useReports'

export function useEvaluations(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'loadAllEvaluationMoments' | 'loadAllStudentMomentValues' | 'updateEvaluationMomentField' | 'updateNewEvaluationQuestion' | 'openEvaluationQuestionModal' | 'handleSaveEvaluationQuestion' | 'closeEvaluationQuestionModal' | 'removeEvaluationQuestion' | 'getEvaluationQuestionsTotal' | 'handleSaveEvaluationMoment' | 'openNewEvaluationMomentModal' | 'closeEvaluationMomentModal' | 'openEditEvaluationMomentModal' | 'deleteEvaluationMoment' | 'getEvaluationMomentsForClass' | 'getEvaluationMomentTypeLabel' | 'getEvaluationMomentSemester' | 'getEvaluationMomentQuestionCount' | 'getEvaluationMomentQuestions' | 'getSelectedGradingMoment' | 'getStudentMomentValueKey' | 'getStudentMomentValueRecord' | 'isSameStudentMomentValue' | 'mergeStudentMomentValues' | 'hasStudentMomentValueRecord' | 'buildStudentMomentValuePayload' | 'handleSelectGradingMoment' | 'getSavedStudentMomentCellValue' | 'getStudentMomentCellValue' | 'getAssessmentChangePayloads' | 'hasUnsavedAssessmentChanges' | 'canLeaveAssessmentMoment' | 'removeAssessmentDraftsForMoment' | 'getStudentMomentServerMetric' | 'getStudentMomentTotal' | 'getStudentMomentProcessedPercentageValue' | 'handleSelectAssessmentsSemester' | 'getAssessmentsSemesterMoments' | 'getAssessmentsSemesterMomentGroups' | 'getStudentSavedMomentTotal' | 'getStudentAssessmentGroupAverage' | 'getStudentAssessmentGroupWeightedValue' | 'getStudentAssessmentFinalValue' | 'getStudentAssessmentFinalGrade' | 'getStudentAssessmentFinalStyle' | 'hasUnsavedSemesterEvaluationsChanges' | 'formatAssessmentValue' | 'getChartData' | 'getAllStudentsForMomentData' | 'getChartTypeLabel' | 'nextChartType' | 'exportChartToPdf' | 'getAssessmentsDashboardRows' | 'buildSemesterEvaluationsPayload' | 'saveSemesterEvaluations' | 'getStudentAttitudeValueKey' | 'updateStudentAttitudeDraft' | 'saveStudentAttitudeCell' | 'generateSemesterEvaluationsReport' | 'getQuestionMaxValue' | 'getEvaluationMomentMaxValue' | 'updateAssessmentCellDraft' | 'saveAssessmentCell' | 'saveAssessmentChanges' | 'generateAssessmentReport'> {
  const actions = Object.assign(
    {},
    useEvaluationMoments(runtime),
    useAssessments(runtime),
    useCharts(runtime),
    useReports(runtime),
  )
  Object.assign(runtime, actions)
  return actions
}
