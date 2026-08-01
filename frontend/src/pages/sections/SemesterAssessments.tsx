import { useState } from 'react'
import type { SchoolDocument } from '../../api/school'
import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import { normalizeDecimalInput } from '../../utils/validation'


type SemesterAssessmentsProps = {
  model: SchoolApplicationModel
}

const ALL_STUDENTS_VALUE = '__all__'

export function SemesterAssessments({ model }: SemesterAssessmentsProps) {
  const {
    selectedAssessmentsSemester,
    handleSelectAssessmentsSemester,
    generateSemesterEvaluationsReport,
    isLoadingClasses,
    getAssessmentsSemesterMoments,
    getAssessmentsSemesterMomentGroups,
    getStudentsForClass,
    selectedClass,
    getDocumentId,
    getStringValue,
    getEvaluationMomentMaxValue,
    getStudentSavedMomentTotal,
    getStudentAssessmentGroupAverage,
    formatAssessmentValue,
    evaluationMomentTemplates,
    percentageRanges,
  } = model

  const [visibleGroupMetrics, setVisibleGroupMetrics] = useState<Set<string>>(() => new Set())
  const [selectedAssessmentStudentId, setSelectedAssessmentStudentId] = useState(ALL_STUDENTS_VALUE)
  const [assessmentWeightOverrides, setAssessmentWeightOverrides] = useState<Record<string, string>>({})

  const initialMomentGroups = getAssessmentsSemesterMomentGroups()
  const initialWeightsByType = Object.fromEntries(
    initialMomentGroups.map((group) => {
      const configuredWeight = evaluationMomentTemplates.find((template) => template.type === group.type)?.weightPercentage
      return [
        group.type,
        Number.isFinite(configuredWeight) ? configuredWeight : group.weightPercentage,
      ]
    }),
  )
  const momentGroups = initialMomentGroups.map((group) => ({
    ...group,
    weightPercentage: getAssessmentWeightValue(
      assessmentWeightOverrides[group.type],
      initialWeightsByType[group.type] ?? group.weightPercentage,
    ),
  }))
  const hasAssessmentWeightOverrides = Object.keys(assessmentWeightOverrides).length > 0
  const updateAssessmentWeight = (groupType: string, value: string) => {
    const normalizedValue = normalizeDecimalInput(value)
    const parsedValue = Number(normalizedValue)

    setAssessmentWeightOverrides((currentOverrides) => ({
      ...currentOverrides,
      [groupType]: normalizedValue === '' || !Number.isFinite(parsedValue)
        ? normalizedValue
        : String(Math.min(100, Math.max(0, parsedValue))),
    }))
  }
  function getAssessmentWeightValue(value: string | undefined, fallback: number) {
    if (value === undefined) {
      return fallback
    }

    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : 0
  }
  const getAssessmentWeightInputValue = (groupType: string, weightPercentage: number) =>
    assessmentWeightOverrides[groupType] ?? formatAssessmentValue(weightPercentage)
  const resetAssessmentWeights = () => setAssessmentWeightOverrides({})
  const getStudentAssessmentGroupWeightedValue = (student: SchoolDocument, group: (typeof momentGroups)[number]) =>
    getStudentAssessmentGroupAverage(student, group) * (group.weightPercentage / 100)
  const getStudentAssessmentFinalValue = (student: SchoolDocument) =>
    momentGroups.reduce(
      (finalValue, group) => finalValue + getStudentAssessmentGroupWeightedValue(student, group),
      0,
    )
  const getStudentAssessmentFinalMaxValue = () =>
    momentGroups.reduce((finalMaxValue, group) => {
      if (group.moments.length === 0) {
        return finalMaxValue
      }

      const groupMaxAverage = group.moments.reduce(
        (total, moment) => total + getEvaluationMomentMaxValue(moment),
        0,
      ) / group.moments.length
      return finalMaxValue + (groupMaxAverage * (group.weightPercentage / 100))
    }, 0)
  const getStudentAssessmentFinalPercentage = (student: SchoolDocument) => {
    const finalMaxValue = getStudentAssessmentFinalMaxValue()
    const finalValue = getStudentAssessmentFinalValue(student)
    return finalMaxValue ? (finalValue / finalMaxValue) * 100 : finalValue
  }
  const getStudentAssessmentFinalRange = (student: SchoolDocument) => {
    const finalPercentage = getStudentAssessmentFinalPercentage(student)
    return percentageRanges.find((range) => finalPercentage >= range.min && finalPercentage <= range.max)
      ?? percentageRanges[percentageRanges.length - 1]
  }
  const getStudentAssessmentFinalGrade = (student: SchoolDocument) =>
    getStudentAssessmentFinalRange(student)?.nota ?? 0
  const getStudentAssessmentFinalStyle = (student: SchoolDocument) => {
    const finalRange = getStudentAssessmentFinalRange(student)
    return {
      backgroundColor: finalRange?.backgroundColor ?? '#ffffff',
      color: finalRange?.textColor ?? '#0f172a',
    }
  }
  const handleAssessmentSemesterChange = (semester: string) => {
    setAssessmentWeightOverrides({})
    setSelectedAssessmentStudentId(ALL_STUDENTS_VALUE)
    void handleSelectAssessmentsSemester(semester)
  }

  if (!selectedClass) return null

  const students = getStudentsForClass(selectedClass)
  const hasSelectedStudent = students.some((student) => getDocumentId(student) === selectedAssessmentStudentId)
  const activeAssessmentStudentId = hasSelectedStudent ? selectedAssessmentStudentId : ALL_STUDENTS_VALUE
  const visibleStudents = activeAssessmentStudentId === ALL_STUDENTS_VALUE
    ? students
    : students.filter((student) => getDocumentId(student) === activeAssessmentStudentId)
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
                          onChange={(event) => handleAssessmentSemesterChange(event.target.value)}
                        >
                          <option value="">Selecionar semestre</option>
                          <option value="1">1.º semestre</option>
                          <option value="2">2.º semestre</option>
                        </select>
                      </label>
                      {selectedAssessmentsSemester && (
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
                      <div className="assessment-panel-actions">
                        {selectedAssessmentsSemester && (
                          <button
                            type="button"
                            className="assessment-action-button"
                            onClick={() => void generateSemesterEvaluationsReport()}
                            disabled={isLoadingClasses}
                          >
                            Relatório
                          </button>
                        )}
                        {selectedAssessmentsSemester && momentGroups.length > 0 && (
                          <button
                            type="button"
                            className="assessment-action-button assessment-reset-button"
                            onClick={resetAssessmentWeights}
                            disabled={!hasAssessmentWeightOverrides}
                          >
                            Repor
                          </button>
                        )}
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
                    ) : students.length === 0 ? (
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
                                <span className="semester-assessments-weight-display">
                                  {formatAssessmentValue(group.weightPercentage)}%
                                </span>
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
                            <span className="semester-assessments-empty-subhead" aria-hidden="true" />
                            {momentGroups.flatMap((group, groupIndex) => [
                              ...group.moments.map((moment) => (
                                <span
                                  className={`semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                  role="columnheader"
                                  key={getDocumentId(moment) ?? getStringValue(moment.name)}
                                >
                                  <span className="semester-assessments-moment-title">
                                    {getStringValue(moment.name)}{' '}
                                    <strong className="question-max-value">
                                      ({getEvaluationMomentMaxValue(moment)})
                                    </strong>
                                  </span>
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
                                M*
                                <label className="semester-assessments-weight-field">
                                  <span className="semester-assessments-weight-label">%</span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={getAssessmentWeightInputValue(group.type, group.weightPercentage)}
                                    onChange={(event) => updateAssessmentWeight(group.type, event.target.value)}
                                    onFocus={(event) => event.currentTarget.select()}
                                    aria-label={`Ponderação de ${group.type}`}
                                  />
                                </label>
                              </span>,
                              ]),
                            ])}
                            <span
                              className="semester-assessments-empty-subhead"
                              aria-hidden="true"
                            />
                            <span className="semester-assessments-empty-subhead" aria-hidden="true" />
                          </div>
                        </div>
                        {visibleStudents.map((student, studentIndex) => {
                          const finalValue = getStudentAssessmentFinalValue(student)
                          const finalStyle = getStudentAssessmentFinalStyle(student)

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
                              {getStudentAssessmentFinalGrade(student)}
                            </strong>
                          </div>
                          )
                        })}
                      </div>
                      <div className="semester-assessments-mobile-list" aria-label="Avaliações por semestre em mobile">
                        {visibleStudents.map((student, studentIndex) => {
                          const finalValue = getStudentAssessmentFinalValue(student)
                          const finalStyle = getStudentAssessmentFinalStyle(student)

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
                                    <span className="semester-assessments-mobile-weight-display">
                                      {formatAssessmentValue(group.weightPercentage)}%
                                    </span>
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
                                        <label className="semester-assessments-mobile-weight-field">
                                          <span>Ponderação:</span>
                                          <span>
                                            <input
                                              type="text"
                                              inputMode="decimal"
                                              value={getAssessmentWeightInputValue(group.type, group.weightPercentage)}
                                              onChange={(event) => updateAssessmentWeight(group.type, event.target.value)}
                                              onFocus={(event) => event.currentTarget.select()}
                                              aria-label={`Ponderação de ${group.type}`}
                                            />
                                            %
                                          </span>
                                        </label>
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
                                <strong>{getStudentAssessmentFinalGrade(student)}</strong>
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
