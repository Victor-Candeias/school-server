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
    getAssessmentsSemesterMomentGroups,
    getStudentsForClass,
    selectedClass,
    getDocumentId,
    getStringValue,
    getEvaluationMomentMaxValue,
    getStudentSavedMomentTotal,
    getStudentAssessmentGroupAverage,
    getStudentAssessmentGroupWeightedValue,
    getStudentAssessmentFinalValue,
    formatAssessmentValue,
  } = model

  if (!selectedClass) return null

  const momentGroups = getAssessmentsSemesterMomentGroups()
  const assessmentColumnCount = 1 + momentGroups.reduce(
    (columnCount, group) => columnCount + group.moments.length + 2,
    0,
  )
  const assessmentGridColumns = `minmax(180px, 1.4fr) repeat(${assessmentColumnCount}, minmax(120px, 1fr))`

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
                        <div className="semester-assessments-header" role="rowgroup">
                          <div
                            className="semester-assessments-row semester-assessments-group-head"
                            role="row"
                            style={{ gridTemplateColumns: assessmentGridColumns }}
                          >
                            <span className="semester-assessments-student-head" role="columnheader">
                              Aluno
                            </span>
                            {momentGroups.map((group) => (
                              <span
                                className="semester-assessments-type-head"
                                role="columnheader"
                                key={group.type}
                                style={{ gridColumn: `span ${group.moments.length + 2}` }}
                              >
                                {group.type}
                              </span>
                            ))}
                            <span
                              className="semester-assessments-final-head"
                              role="columnheader"
                            >
                              Final
                            </span>
                          </div>
                          <div
                            className="semester-assessments-row semester-assessments-subhead"
                            role="row"
                            style={{ gridTemplateColumns: assessmentGridColumns }}
                          >
                            <span aria-hidden="true" />
                            {momentGroups.flatMap((group) => [
                              ...group.moments.map((moment) => (
                                <span role="columnheader" key={getDocumentId(moment) ?? getStringValue(moment.name)}>
                                  {getStringValue(moment.name)}{' '}
                                  <strong className="question-max-value">
                                    ({getEvaluationMomentMaxValue(moment)})
                                  </strong>
                                </span>
                              )),
                              <span
                                className="semester-assessments-average-head"
                                role="columnheader"
                                key={`${group.type}-average`}
                              >
                                Média
                              </span>,
                              <span
                                className="semester-assessments-weighted-head"
                                role="columnheader"
                                key={`${group.type}-weighted`}
                                title={`Média × ${formatAssessmentValue(group.weightPercentage)}%`}
                              >
                                M*{formatAssessmentValue(group.weightPercentage)}%
                              </span>,
                            ])}
                            <span
                              className="semester-assessments-final-subhead"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                        {getStudentsForClass(selectedClass).map((student, studentIndex) => (
                          <div
                            className="semester-assessments-row"
                            role="row"
                            key={String(student._id ?? student.id ?? studentIndex)}
                            style={{ gridTemplateColumns: assessmentGridColumns }}
                          >
                            <span role="cell">{getStringValue(student.name)}</span>
                            {momentGroups.flatMap((group) => [
                              ...group.moments.map((moment) => (
                                <strong role="cell" key={getDocumentId(moment) ?? getStringValue(moment.name)}>
                                  {getStudentSavedMomentTotal(student, moment)}
                                </strong>
                              )),
                              <strong
                                className="semester-assessments-average-cell"
                                role="cell"
                                key={`${group.type}-average`}
                              >
                                {formatAssessmentValue(getStudentAssessmentGroupAverage(student, group))}
                              </strong>,
                              <strong
                                className="semester-assessments-weighted-cell"
                                role="cell"
                                key={`${group.type}-weighted`}
                              >
                                {formatAssessmentValue(getStudentAssessmentGroupWeightedValue(student, group))}
                              </strong>,
                            ])}
                            <strong
                              className="semester-assessments-final-cell"
                              role="cell"
                            >
                              {formatAssessmentValue(getStudentAssessmentFinalValue(student, momentGroups))}
                            </strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )
  )
}
