import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'


type SemesterAssessmentsProps = {
  model: SchoolApplicationModel
}

export function SemesterAssessments({ model }: SemesterAssessmentsProps) {
  const {
    selectedAssessmentsSemester,
    setSelectedAssessmentsSemester,
    generateSemesterEvaluationsReport,
    isLoadingClasses,
    saveSemesterEvaluations,
    getAssessmentsSemesterMoments,
    getStudentsForClass,
    selectedClass,
    getDocumentId,
    getStringValue,
    getEvaluationMomentMaxValue,
    getStudentSavedMomentTotal,
  } = model

  if (!selectedClass) return null

  return (
    (
                  <section className="students-panel" aria-label="Avaliações por semestre">
                    <div className="assessment-panel-heading">
                      <div>
                        <h2>Avaliações</h2>
                        <p>Seleciona um semestre para consultar os totais dos momentos de avaliação por aluno.</p>
                      </div>
                      <label>
                        Semestre
                        <select
                          value={selectedAssessmentsSemester}
                          onChange={(event) => setSelectedAssessmentsSemester(event.target.value)}
                        >
                          <option value="">Selecionar semestre</option>
                          <option value="1">1.º semestre</option>
                          <option value="2">2.º semestre</option>
                        </select>
                      </label>
                      <div className="assessment-panel-actions">
                        {selectedAssessmentsSemester && (
                          <button
                            type="button"
                            onClick={() => void generateSemesterEvaluationsReport()}
                            disabled={isLoadingClasses}
                          >
                            Relatório
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void saveSemesterEvaluations()}
                          disabled={!selectedAssessmentsSemester || isLoadingClasses}
                        >
                          Gravar
                        </button>
                      </div>
                    </div>
                    {!selectedAssessmentsSemester ? (
                      <p className="students-empty-state">
                        Escolhe um semestre para ver a tabela de avaliações.
                      </p>
                    ) : getAssessmentsSemesterMoments().length === 0 ? (
                      <p className="students-empty-state">
                        Ainda não existem momentos de avaliação no semestre selecionado.
                      </p>
                    ) : getStudentsForClass(selectedClass).length === 0 ? (
                      <p className="students-empty-state">Ainda não existem alunos nesta turma.</p>
                    ) : (
                      <div className="semester-assessments-table" role="table" aria-label="Avaliações por semestre">
                        <div
                          className="semester-assessments-row semester-assessments-head"
                          role="row"
                          style={{
                            gridTemplateColumns: `minmax(180px, 1.4fr) repeat(${getAssessmentsSemesterMoments().length}, minmax(120px, 1fr))`,
                          }}
                        >
                          <span role="columnheader">Aluno</span>
                          {getAssessmentsSemesterMoments().map((moment) => (
                            <span role="columnheader" key={getDocumentId(moment) ?? getStringValue(moment.name)}>
                              {getStringValue(moment.name)}{' '}
                              <strong className="question-max-value">
                                ({getEvaluationMomentMaxValue(moment)})
                              </strong>
                            </span>
                          ))}
                        </div>
                        {getStudentsForClass(selectedClass).map((student, studentIndex) => (
                          <div
                            className="semester-assessments-row"
                            role="row"
                            key={String(student._id ?? student.id ?? studentIndex)}
                            style={{
                              gridTemplateColumns: `minmax(180px, 1.4fr) repeat(${getAssessmentsSemesterMoments().length}, minmax(120px, 1fr))`,
                            }}
                          >
                            <span role="cell">{getStringValue(student.name)}</span>
                            {getAssessmentsSemesterMoments().map((moment) => (
                              <strong role="cell" key={getDocumentId(moment) ?? getStringValue(moment.name)}>
                                {getStudentSavedMomentTotal(student, moment)}
                              </strong>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )
  )
}
