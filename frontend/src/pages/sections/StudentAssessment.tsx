import { useState } from 'react'
import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'


type StudentAssessmentProps = {
  model: SchoolApplicationModel
}

const ALL_STUDENTS_VALUE = '__all__'

export function StudentAssessment({ model }: StudentAssessmentProps) {
  const [selectedAssessmentStudentId, setSelectedAssessmentStudentId] = useState(ALL_STUDENTS_VALUE)
  const {
    selectedGradingMomentId,
    handleSelectGradingMoment,
    getEvaluationMomentsForClass,
    selectedClass,
    getDocumentId,
    getStringValue,
    getSelectedGradingMoment,
    generateAssessmentReport,
    isLoadingClasses,
    saveAssessmentChanges,
    hasUnsavedAssessmentChanges,
    getEvaluationMomentQuestions,
    getStudentsForClass,
    getQuestionMaxValue,
    getStudentMomentCellValue,
    updateAssessmentCellDraft,
    saveAssessmentCell,
    getStudentMomentTotal,
    getStudentMomentPercentageStyle,
    getStudentMomentPercentage,
  } = model

  if (!selectedClass) return null
  const selectedMoment = getSelectedGradingMoment()
  const questions = selectedMoment ? getEvaluationMomentQuestions(selectedMoment) : []
  const students = getStudentsForClass(selectedClass)
  const hasSelectedStudent = students.some((student) => getDocumentId(student) === selectedAssessmentStudentId)
  const activeAssessmentStudentId = hasSelectedStudent ? selectedAssessmentStudentId : ALL_STUDENTS_VALUE
  const visibleStudents = activeAssessmentStudentId === ALL_STUDENTS_VALUE
    ? students
    : students.filter((student) => getDocumentId(student) === activeAssessmentStudentId)

  return (
    (
                  <section className="students-panel" aria-label="Alunos por momento de avaliação">
                    <div className="assessment-panel-heading">
                      <div>
                        <h2>Alunos/M.Avaliação</h2>
                        <p>Seleciona um momento de avaliação para preencher os valores dos alunos.</p>
                      </div>
                      <label>
                        Momento de avaliação
                        <select
                          value={selectedGradingMomentId}
                          onChange={(event) => void handleSelectGradingMoment(event.target.value)}
                        >
                          <option value="">Selecionar momento</option>
                          {getEvaluationMomentsForClass(selectedClass).map((moment, index) => (
                            <option
                              value={getDocumentId(moment) ?? ''}
                              key={String(moment._id ?? moment.name ?? index)}
                            >
                              {getStringValue(moment.name)}
                            </option>
                          ))}
                        </select>
                      </label>
                      {selectedMoment && (
                        <label>
                          Aluno
                          <select
                            value={activeAssessmentStudentId}
                            onChange={(event) => setSelectedAssessmentStudentId(event.target.value)}
                          >
                            <option value={ALL_STUDENTS_VALUE}>Todos os alunos</option>
                            {students.map((student, index) => (
                              <option
                                value={getDocumentId(student) ?? ''}
                                key={String(student._id ?? student.id ?? index)}
                              >
                                {getStringValue(student.name)}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {selectedMoment && (
                        <div className="assessment-panel-actions">
                          <button
                            type="button"
                            className="assessment-action-button"
                            onClick={() => generateAssessmentReport()}
                            disabled={isLoadingClasses}
                          >
                            Relatório
                          </button>
                          <button
                            type="button"
                            className="assessment-action-button assessment-save-button"
                            onClick={() => void saveAssessmentChanges()}
                            disabled={!hasUnsavedAssessmentChanges() || isLoadingClasses}
                          >
                            Gravar
                          </button>
                        </div>
                      )}
                    </div>
                    {!selectedMoment ? (
                      <p className="students-empty-state">
                        Escolhe um momento de avaliação para ver a tabela de alunos.
                      </p>
                    ) : questions.length === 0 ? (
                      <p className="students-empty-state">
                        O momento selecionado ainda não tem questões.
                      </p>
                    ) : students.length === 0 ? (
                      <p className="students-empty-state">Ainda não existem alunos nesta turma.</p>
                    ) : (
                      <div className="student-assessment-table" role="table" aria-label="Valores por aluno e questão">
                        <div
                          className="student-assessment-row student-assessment-table-head"
                          role="row"
                          style={{
                            gridTemplateColumns: `minmax(180px, 1.4fr) repeat(${questions.length}, minmax(84px, 1fr)) 90px 100px`,
                          }}
                        >
                          <span role="columnheader">Aluno</span>
                          {questions.map((question) => (
                            <span role="columnheader" key={question.questionNumber}>
                              Q{question.questionNumber}{' '}
                              <strong className="question-max-value">
                                ({getQuestionMaxValue(question)})
                              </strong>
                            </span>
                          ))}
                          <span role="columnheader">Total</span>
                          <span role="columnheader">%</span>
                        </div>
                        {visibleStudents.map((student, studentIndex) => (
                          <div
                            className="student-assessment-row"
                            role="row"
                            key={String(student._id ?? student.id ?? studentIndex)}
                            style={{
                              gridTemplateColumns: `minmax(180px, 1.4fr) repeat(${questions.length}, minmax(84px, 1fr)) 90px 100px`,
                            }}
                          >
                            <span className="assessment-student-name-cell" role="cell">
                              <span className="assessment-mobile-label" aria-hidden="true">Nome do aluno:</span>
                              {getStringValue(student.name)}
                            </span>
                            {questions.map((question) => (
                              <span className="assessment-question-cell" role="cell" key={question.questionNumber}>
                                <span className="assessment-mobile-label" aria-hidden="true">
                                  Q{question.questionNumber} ({getQuestionMaxValue(question)}):
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  max={getQuestionMaxValue(question)}
                                  step="0.01"
                                  value={getStudentMomentCellValue(student, selectedMoment, question)}
                                  onChange={(event) =>
                                    updateAssessmentCellDraft(
                                      student,
                                      selectedMoment,
                                      question,
                                      event.target.value,
                                    )
                                  }
                                  onBlur={(event) =>
                                    void saveAssessmentCell(
                                      student,
                                      selectedMoment,
                                      question,
                                      event.target.value,
                                    )
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                      event.currentTarget.blur()
                                    }
                                  }}
                                  aria-label={`Valor de ${getStringValue(student.name)} na questão ${question.questionNumber}`}
                                />
                              </span>
                            ))}
                            <strong className="assessment-total-cell" role="cell">
                              <span className="assessment-mobile-label" aria-hidden="true">Total:</span>
                              {getStudentMomentTotal(student, selectedMoment)}
                            </strong>
                            <strong
                              role="cell"
                              className="assessment-percentage assessment-percentage-cell"
                              style={getStudentMomentPercentageStyle(student, selectedMoment)}
                            >
                              <span className="assessment-mobile-label" aria-hidden="true">Total (%):</span>
                              {getStudentMomentPercentage(student, selectedMoment)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )
  )
}
