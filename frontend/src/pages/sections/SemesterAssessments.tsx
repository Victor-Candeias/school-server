import { useState } from 'react'
import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'


type SemesterAssessmentsProps = {
  model: SchoolApplicationModel
}

export function SemesterAssessments({ model }: SemesterAssessmentsProps) {
  const {
    selectedAssessmentsSemester,
    handleSelectAssessmentsSemester,
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
    getStudentAssessmentFinalGrade,
    getStudentAssessmentFinalStyle,
    formatAssessmentValue,
  } = model

  const [visibleGroupMetrics, setVisibleGroupMetrics] = useState<Set<string>>(() => new Set())

  if (!selectedClass) return null

  const momentGroups = getAssessmentsSemesterMomentGroups()
  const getGroupClassName = (groupIndex: number) =>
    `semester-assessments-group-${groupIndex % 4}`
  const isGroupMetricsHidden = (groupType: string) => !visibleGroupMetrics.has(groupType)
  const toggleGroupMetrics = (groupType: string) => {
    setVisibleGroupMetrics((currentVisibleGroups) => {
      const nextVisibleGroups = new Set(currentVisibleGroups)
      if (nextVisibleGroups.has(groupType)) {
        nextVisibleGroups.delete(groupType)
      } else {
        nextVisibleGroups.add(groupType)
      }
      return nextVisibleGroups
    })
  }
  const assessmentColumnCount = 2 + momentGroups.reduce(
    (columnCount, group) => columnCount
      + group.moments.length
      + (isGroupMetricsHidden(group.type) ? 0 : 2),
    0,
  )
  const assessmentGridColumns = `minmax(140px, 1.3fr) repeat(${assessmentColumnCount}, minmax(60px, 1fr))`

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
                          onChange={(event) => void handleSelectAssessmentsSemester(event.target.value)}
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
                      <>
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
                            {momentGroups.map((group, groupIndex) => {
                              const metricsHidden = isGroupMetricsHidden(group.type)
                              const groupClassName = getGroupClassName(groupIndex)
                              return (
                              <span
                                className={`semester-assessments-type-head semester-assessments-group-cell ${groupClassName}`}
                                role="columnheader"
                                key={group.type}
                                style={{
                                  gridColumn: `span ${group.moments.length + (metricsHidden ? 0 : 2)}`,
                                }}
                              >
                                {group.type}
                                <button
                                  className="semester-assessments-group-toggle"
                                  type="button"
                                  aria-label={`${metricsHidden ? 'Mostrar' : 'Ocultar'} média e ponderação de ${group.type}`}
                                  aria-pressed={!metricsHidden}
                                  title={`${metricsHidden ? 'Mostrar' : 'Ocultar'} média e ponderação`}
                                  onClick={() => toggleGroupMetrics(group.type)}
                                >
                                  {metricsHidden ? '+' : '−'}
                                </button>
                              </span>
                              )
                            })}
                            <span
                              className="semester-assessments-final-head"
                              role="columnheader"
                            >
                              Final
                            </span>
                            <span className="semester-assessments-grade-head" role="columnheader">
                              Nota
                            </span>
                          </div>
                          <div
                            className="semester-assessments-row semester-assessments-subhead"
                            role="row"
                            style={{ gridTemplateColumns: assessmentGridColumns }}
                          >
                            <span aria-hidden="true" />
                            {momentGroups.flatMap((group, groupIndex) => [
                              ...group.moments.map((moment) => (
                                <span
                                  className={`semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                  role="columnheader"
                                  key={getDocumentId(moment) ?? getStringValue(moment.name)}
                                >
                                  {getStringValue(moment.name)}{' '}
                                  <strong className="question-max-value">
                                    ({getEvaluationMomentMaxValue(moment)})
                                  </strong>
                                </span>
                              )),
                              ...(isGroupMetricsHidden(group.type) ? [] : [
                              <span
                                className={`semester-assessments-average-head semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                role="columnheader"
                                key={`${group.type}-average`}
                              >
                                Média
                              </span>,
                              <span
                                className={`semester-assessments-weighted-head semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                role="columnheader"
                                key={`${group.type}-weighted`}
                                title={`Média × ${formatAssessmentValue(group.weightPercentage)}%`}
                              >
                                M*{formatAssessmentValue(group.weightPercentage)}%
                              </span>,
                              ]),
                            ])}
                            <span
                              className="semester-assessments-final-subhead"
                              aria-hidden="true"
                            />
                            <span className="semester-assessments-final-subhead" aria-hidden="true" />
                          </div>
                        </div>
                        {getStudentsForClass(selectedClass).map((student, studentIndex) => {
                          const finalValue = getStudentAssessmentFinalValue(student, momentGroups)
                          const finalStyle = getStudentAssessmentFinalStyle(student, momentGroups)

                          return (
                          <div
                            className="semester-assessments-row"
                            role="row"
                            key={String(student._id ?? student.id ?? studentIndex)}
                            style={{ gridTemplateColumns: assessmentGridColumns }}
                          >
                            <span role="cell">{getStringValue(student.name)}</span>
                            {momentGroups.flatMap((group, groupIndex) => [
                              ...group.moments.map((moment) => (
                                <strong
                                  className={`semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                  role="cell"
                                  key={getDocumentId(moment) ?? getStringValue(moment.name)}
                                >
                                  {getStudentSavedMomentTotal(student, moment)}
                                </strong>
                              )),
                              ...(isGroupMetricsHidden(group.type) ? [] : [
                              <strong
                                className={`semester-assessments-average-cell semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                role="cell"
                                key={`${group.type}-average`}
                              >
                                {formatAssessmentValue(getStudentAssessmentGroupAverage(student, group))}
                              </strong>,
                              <strong
                                className={`semester-assessments-weighted-cell semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                role="cell"
                                key={`${group.type}-weighted`}
                              >
                                {formatAssessmentValue(getStudentAssessmentGroupWeightedValue(student, group))}
                              </strong>,
                              ]),
                            ])}
                            <strong
                              className="semester-assessments-final-cell"
                              role="cell"
                              style={finalStyle}
                            >
                              {formatAssessmentValue(finalValue)}
                            </strong>
                            <strong
                              className="semester-assessments-grade-cell"
                              role="cell"
                              style={finalStyle}
                            >
                              {getStudentAssessmentFinalGrade(student, momentGroups)}
                            </strong>
                          </div>
                          )
                        })}
                      </div>
                      <div className="semester-assessments-mobile-list" aria-label="Avaliações por semestre em mobile">
                        {getStudentsForClass(selectedClass).map((student, studentIndex) => {
                          const finalValue = getStudentAssessmentFinalValue(student, momentGroups)
                          const finalStyle = getStudentAssessmentFinalStyle(student, momentGroups)

                          return (
                          <article
                            className="semester-assessments-mobile-card"
                            key={String(student._id ?? student.id ?? studentIndex)}
                          >
                            <h3>
                              Aluno:
                              <span>{getStringValue(student.name)}</span>
                            </h3>
                            {momentGroups.map((group, groupIndex) => {
                              const metricsHidden = isGroupMetricsHidden(group.type)
                              const groupClassName = getGroupClassName(groupIndex)
                              return (
                                <section
                                  className={`semester-assessments-mobile-group ${groupClassName}`}
                                  key={group.type}
                                  aria-label={group.type}
                                >
                                  <button
                                    className="semester-assessments-mobile-group-heading"
                                    type="button"
                                    aria-expanded={!metricsHidden}
                                    aria-label={`${metricsHidden ? 'Mostrar' : 'Ocultar'} média e ponderação de ${group.type}`}
                                    onClick={() => toggleGroupMetrics(group.type)}
                                  >
                                    <span>{group.type}</span>
                                    <span aria-hidden="true">{metricsHidden ? '+' : '−'}</span>
                                  </button>
                                  <div className="semester-assessments-mobile-moments">
                                    {group.moments.map((moment) => (
                                      <p key={getDocumentId(moment) ?? getStringValue(moment.name)}>
                                        <span>
                                          {getStringValue(moment.name)} - Valor:
                                        </span>
                                        <strong>{getStudentSavedMomentTotal(student, moment)}</strong>
                                      </p>
                                    ))}
                                  </div>
                                  {!metricsHidden && (
                                    <div className="semester-assessments-mobile-metrics">
                                      <p>
                                        <span>Média:</span>
                                        <strong>{formatAssessmentValue(getStudentAssessmentGroupAverage(student, group))}</strong>
                                      </p>
                                      <p>
                                        <span>Ponderação:</span>
                                        <strong>{formatAssessmentValue(getStudentAssessmentGroupWeightedValue(student, group))}</strong>
                                      </p>
                                    </div>
                                  )}
                                </section>
                              )
                            })}
                            <div className="semester-assessments-mobile-final">
                              <p style={finalStyle}>
                                <span>Final:</span>
                                <strong>{formatAssessmentValue(finalValue)}</strong>
                              </p>
                              <p style={finalStyle}>
                                <span>Nota:</span>
                                <strong>{getStudentAssessmentFinalGrade(student, momentGroups)}</strong>
                              </p>
                            </div>
                          </article>
                          )
                        })}
                      </div>
                      </>
                    )}
                  </section>
                )
  )
}
