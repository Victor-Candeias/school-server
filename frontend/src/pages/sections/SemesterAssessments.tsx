import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { SchoolDocument } from '../../api/school'
import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import type { AttitudeTemplate } from '../../types'
import { getDefaultEvaluationMomentTemplateColors } from '../../utils/constants'
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
    attitudeTemplates,
    percentageRanges,
    getRecordValue,
    assessmentCellDrafts,
    getStudentAttitudeValueKey,
    updateStudentAttitudeDraft,
    saveStudentAttitudeCell,
  } = model

  const [visibleGroupMetrics, setVisibleGroupMetrics] = useState<Set<string>>(() => new Set())
  const [hiddenGroupMoments, setHiddenGroupMoments] = useState<Set<string>>(() => new Set())
  const [hiddenAttitudeColumns, setHiddenAttitudeColumns] = useState<Set<string>>(
    () => new Set(attitudeTemplates.map((template) => template.id)),
  )
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
    const normalizedValue = normalizeDecimalInput(value, 2)
    const parsedValue = Number(normalizedValue)

    setAssessmentWeightOverrides((currentOverrides) => ({
      ...currentOverrides,
      [groupType]: normalizedValue === '' || normalizedValue.endsWith('.') || !Number.isFinite(parsedValue)
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
  const visibleAttitudeTemplates = attitudeTemplates.filter(
    (template) => !hiddenAttitudeColumns.has(template.id),
  )
  const totalAttitudeWeightPercentage = attitudeTemplates.reduce(
    (total, template) => total + template.weightPercentage,
    0,
  )
  const hasAttitudeTemplates = attitudeTemplates.length > 0
  const hasVisibleAttitudeColumns = visibleAttitudeTemplates.length > 0
  const formatAttitudeWeightPercentage = (weightPercentage: number) =>
    `${formatAssessmentValue(weightPercentage).replace('.', ',')}%`
  const getAttitudeLabel = (template: AttitudeTemplate) =>
    `${template.alias} ${formatAttitudeWeightPercentage(template.weightPercentage)}`

  useEffect(() => {
    setHiddenAttitudeColumns(new Set(attitudeTemplates.map((template) => template.id)))
  }, [selectedAssessmentsSemester, attitudeTemplates])
  const getStudentSummaryRecord = (student: SchoolDocument) => {
    const summaryStudents = model.semesterAssessmentSummary?.students
    const studentId = getDocumentId(student)

    if (!Array.isArray(summaryStudents) || !studentId) {
      return null
    }

    const matchingSummary = summaryStudents.find((summaryStudent) => {
      const summaryRecord = getRecordValue(summaryStudent)
      return getStringValue(summaryRecord.studentId) === studentId
    })

    return matchingSummary ? getRecordValue(matchingSummary) : null
  }
  const getStudentAttitudeSummary = (student: SchoolDocument, template: AttitudeTemplate) => {
    const studentSummary = getStudentSummaryRecord(student)
    const attitudes = studentSummary?.attitudes

    if (!Array.isArray(attitudes)) {
      return null
    }

    const matchingAttitude = attitudes.find((attitude) => {
      const attitudeRecord = getRecordValue(attitude)
      return (
        getStringValue(attitudeRecord.id) === template.id
        || getStringValue(attitudeRecord.templateId) === template.id
        || getStringValue(attitudeRecord.alias) === template.alias
        || getStringValue(attitudeRecord.text) === template.text
      )
    })

    return matchingAttitude ? getRecordValue(matchingAttitude) : null
  }
  const getNumericValue = (value: unknown) => {
    const numericValue = Number(value)
    return Number.isFinite(numericValue) ? numericValue : null
  }
  const getStudentAttitudeRecordValue = (student: SchoolDocument, template: AttitudeTemplate) => {
    const studentRecord = getRecordValue(student)
    const attitudeCollections = [
      studentRecord.attitudes,
      studentRecord.attitudeValues,
      studentRecord.attitudeAssessments,
    ]

    for (const collection of attitudeCollections) {
      if (Array.isArray(collection)) {
        const matchingAttitude = collection.find((attitude) => {
          const attitudeRecord = getRecordValue(attitude)
          return (
            getStringValue(attitudeRecord.id) === template.id
            || getStringValue(attitudeRecord.templateId) === template.id
            || getStringValue(attitudeRecord.alias) === template.alias
            || getStringValue(attitudeRecord.text) === template.text
          )
        })
        const matchingRecord = matchingAttitude ? getRecordValue(matchingAttitude) : null
        const matchingValue = matchingRecord
          ? getNumericValue(matchingRecord.value ?? matchingRecord.studentTotal ?? matchingRecord.total)
          : null
        if (matchingValue !== null) {
          return matchingValue
        }
      }

      if (collection && typeof collection === 'object' && !Array.isArray(collection)) {
        const collectionRecord = getRecordValue(collection)
        const matchingValue = getNumericValue(
          collectionRecord[template.id]
            ?? collectionRecord[template.alias]
            ?? collectionRecord[template.text],
        )
        if (matchingValue !== null) {
          return matchingValue
        }
      }
    }

    return getNumericValue(
      studentRecord[template.id]
        ?? studentRecord[template.alias]
        ?? studentRecord[template.text],
    ) ?? 0
  }
  const getStudentAttitudeValue = (student: SchoolDocument, template: AttitudeTemplate) => {
    const summaryAttitude = getStudentAttitudeSummary(student, template)
    const summaryValue = summaryAttitude
      ? getNumericValue(summaryAttitude.value ?? summaryAttitude.studentTotal ?? summaryAttitude.total)
      : null

    return summaryValue ?? getStudentAttitudeRecordValue(student, template)
  }
  const getStudentAttitudeInputValue = (student: SchoolDocument, template: AttitudeTemplate) => {
    const studentId = getDocumentId(student)
    if (!studentId) {
      return ''
    }

    const draftKey = getStudentAttitudeValueKey(studentId, template.id)
    return draftKey in assessmentCellDrafts
      ? assessmentCellDrafts[draftKey]
      : formatAssessmentValue(getStudentAttitudeValue(student, template))
  }
  const getStudentAttitudesWeightedValue = (student: SchoolDocument) => {
    const studentSummary = getStudentSummaryRecord(student)
    const summaryValue = studentSummary
      ? getNumericValue(studentSummary.attitudesWeightedValue)
      : null

    if (summaryValue !== null) {
      return summaryValue
    }

    const attitudesTotal = attitudeTemplates.reduce(
      (total, template) => total + getStudentAttitudeValue(student, template),
      0,
    )
    return attitudesTotal * (totalAttitudeWeightPercentage / 100)
  }
  const getAttitudeStyle = (template: AttitudeTemplate): AssessmentGroupStyle => ({
    '--assessment-group-background': template.backgroundColor,
    '--assessment-group-average-background': template.weightedBackgroundColor,
    '--assessment-group-weighted-background': template.weightedBackgroundColor,
    '--assessment-group-text': template.textColor,
  })
  const getAttitudeTotalStyle = (): AssessmentGroupStyle => {
    const firstTemplate = attitudeTemplates[0]
    const defaultColors = getDefaultEvaluationMomentTemplateColors(momentGroups.length)

    return {
      '--assessment-group-background': firstTemplate?.weightedBackgroundColor ?? defaultColors.weightedBackgroundColor,
      '--assessment-group-average-background': firstTemplate?.weightedBackgroundColor ?? defaultColors.weightedBackgroundColor,
      '--assessment-group-weighted-background': firstTemplate?.weightedBackgroundColor ?? defaultColors.weightedBackgroundColor,
      '--assessment-group-text': firstTemplate?.textColor ?? defaultColors.textColor,
    }
  }
  const toggleAllAttitudeColumns = () => {
    setHiddenAttitudeColumns((currentHiddenColumns) => {
      if (currentHiddenColumns.size >= attitudeTemplates.length) {
        return new Set()
      }

      return new Set(attitudeTemplates.map((template) => template.id))
    })
  }
  const toggleAttitudeColumn = (templateId: string) => {
    setHiddenAttitudeColumns((currentHiddenColumns) => {
      const nextHiddenColumns = new Set(currentHiddenColumns)
      if (nextHiddenColumns.has(templateId)) {
        nextHiddenColumns.delete(templateId)
      } else {
        nextHiddenColumns.add(templateId)
      }
      return nextHiddenColumns
    })
  }
  const renderAttitudeVisibilityControls = (className = '') => {
    if (!hasAttitudeTemplates) {
      return null
    }

    return (
      <div
        className={`semester-assessments-visibility-controls ${className}`.trim()}
        aria-label="Visibilidade das atitudes"
      >
        <button type="button" onClick={toggleAllAttitudeColumns}>
          {hasVisibleAttitudeColumns ? 'Ocultar atitudes' : 'Mostrar atitudes'}
        </button>
        {attitudeTemplates.map((template) => (
          <button
            type="button"
            key={template.id}
            aria-pressed={!hiddenAttitudeColumns.has(template.id)}
            onClick={() => toggleAttitudeColumn(template.id)}
          >
            {hiddenAttitudeColumns.has(template.id) ? 'Mostrar' : 'Ocultar'} {template.alias}
          </button>
        ))}
      </div>
    )
  }
  const handleAssessmentSemesterChange = (semester: string) => {
    setAssessmentWeightOverrides({})
    setHiddenGroupMoments(new Set())
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
  const getGroupStyle = (groupType: string, groupIndex: number): AssessmentGroupStyle => {
    const matchingTemplate = evaluationMomentTemplates.find((template) => template.type === groupType)
    const defaultColors = getDefaultEvaluationMomentTemplateColors(groupIndex)

    return {
      '--assessment-group-background': matchingTemplate?.backgroundColor ?? defaultColors.backgroundColor,
      '--assessment-group-average-background':
        matchingTemplate?.averageBackgroundColor ?? defaultColors.averageBackgroundColor,
      '--assessment-group-weighted-background':
        matchingTemplate?.weightedBackgroundColor ?? defaultColors.weightedBackgroundColor,
      '--assessment-group-text': matchingTemplate?.textColor ?? defaultColors.textColor,
    }
  }
  const isGroupMetricsHidden = (groupType: string) => !visibleGroupMetrics.has(groupType)
  const areGroupMomentsHidden = (groupType: string) => hiddenGroupMoments.has(groupType)
  const areGroupMetricsVisible = (groupType: string) =>
    !isGroupMetricsHidden(groupType) || areGroupMomentsHidden(groupType)
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
  const toggleGroupMoments = (groupType: string) => {
    setHiddenGroupMoments((currentHiddenGroups) => {
      const nextHiddenGroups = new Set(currentHiddenGroups)
      if (nextHiddenGroups.has(groupType)) {
        nextHiddenGroups.delete(groupType)
      } else {
        nextHiddenGroups.add(groupType)
      }
      return nextHiddenGroups
    })
  }
  const assessmentColumnCount = 2 + momentGroups.reduce(
    (columnCount, group) => columnCount
      + (areGroupMomentsHidden(group.type) ? 0 : group.moments.length)
      + (areGroupMetricsVisible(group.type) ? 2 : 0),
    0,
  ) + (hasVisibleAttitudeColumns ? visibleAttitudeTemplates.length + 1 : 0)
  const assessmentGridColumns = `minmax(140px, 1.3fr) repeat(${assessmentColumnCount}, minmax(60px, 1fr))`
  const transposedGridColumns = `minmax(100px, 10%) repeat(${Math.max(visibleStudents.length, 1)}, minmax(92px, 1fr))`

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
                      <div className="semester-assessments-transposed-table" role="table" aria-label="Avaliações por semestre em tabela transposta">
                        <div
                          className="semester-assessments-transposed-row semester-assessments-transposed-head"
                          role="row"
                          style={{ gridTemplateColumns: transposedGridColumns }}
                        >
                          <span role="columnheader">Avaliação</span>
                          {visibleStudents.map((student, studentIndex) => (
                            <span
                              role="columnheader"
                              key={String(student._id ?? student.id ?? studentIndex)}
                            >
                              {getStringValue(student.name)}
                            </span>
                          ))}
                        </div>
                        {momentGroups.map((group, groupIndex) => {
                          const groupStyle = getGroupStyle(group.type, groupIndex)
                          const groupClassName = getGroupClassName(groupIndex)
                          const groupMomentsHidden = areGroupMomentsHidden(group.type)

                          return (
                            <div className="semester-assessments-transposed-group" key={group.type}>
                              <div
                                className={`semester-assessments-transposed-row semester-assessments-transposed-group-head ${groupClassName}`}
                                role="row"
                                style={{
                                  ...groupStyle,
                                  gridTemplateColumns: transposedGridColumns,
                                }}
                              >
                                <span role="rowheader">
                                  <button
                                    type="button"
                                    className="semester-assessments-group-label"
                                    aria-expanded={!groupMomentsHidden}
                                    aria-label={`${groupMomentsHidden ? 'Mostrar' : 'Ocultar'} momentos de ${group.type}`}
                                    onClick={() => toggleGroupMoments(group.type)}
                                  >
                                    {group.type}
                                  </button>
                                  <label className="semester-assessments-weight-field">
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={getAssessmentWeightInputValue(group.type, group.weightPercentage)}
                                      onChange={(event) => updateAssessmentWeight(group.type, event.target.value)}
                                      onFocus={(event) => event.currentTarget.select()}
                                      aria-label={`Ponderação de ${group.type}`}
                                    />
                                    <span className="semester-assessments-weight-label">%</span>
                                  </label>
                                </span>
                              </div>
                              {!groupMomentsHidden && group.moments.map((moment) => (
                                <div
                                  className={`semester-assessments-transposed-row semester-assessments-transposed-moment-row ${groupClassName}`}
                                  role="row"
                                  key={getDocumentId(moment) ?? getStringValue(moment.name)}
                                  style={{
                                    ...groupStyle,
                                    gridTemplateColumns: transposedGridColumns,
                                  }}
                                >
                                  <span role="rowheader">
                                    {getStringValue(moment.name)}{' '}
                                    <strong className="question-max-value">
                                      ({getEvaluationMomentMaxValue(moment)})
                                    </strong>
                                  </span>
                                  {visibleStudents.map((student, studentIndex) => (
                                    <strong
                                      role="cell"
                                      key={String(student._id ?? student.id ?? studentIndex)}
                                    >
                                      {getStudentSavedMomentTotal(student, moment)}
                                    </strong>
                                  ))}
                                </div>
                              ))}
                              <div
                                className={`semester-assessments-transposed-row semester-assessments-transposed-average-row ${groupClassName}`}
                                role="row"
                                style={{
                                  ...groupStyle,
                                  gridTemplateColumns: transposedGridColumns,
                                }}
                              >
                                <span role="rowheader">Média</span>
                                {visibleStudents.map((student, studentIndex) => (
                                  <strong
                                    role="cell"
                                    key={String(student._id ?? student.id ?? studentIndex)}
                                  >
                                    {formatAssessmentValue(getStudentAssessmentGroupAverage(student, group))}
                                  </strong>
                                ))}
                              </div>
                              <div
                                className={`semester-assessments-transposed-row semester-assessments-transposed-weighted-row ${groupClassName}`}
                                role="row"
                                style={{
                                  ...groupStyle,
                                  gridTemplateColumns: transposedGridColumns,
                                }}
                              >
                                <span role="rowheader">
                                  M*{formatAssessmentValue(group.weightPercentage)}%
                                </span>
                                {visibleStudents.map((student, studentIndex) => (
                                  <strong
                                    role="cell"
                                    key={String(student._id ?? student.id ?? studentIndex)}
                                  >
                                    {formatAssessmentValue(getStudentAssessmentGroupWeightedValue(student, group))}
                                  </strong>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                        {renderAttitudeVisibilityControls('semester-assessments-transposed-visibility-controls')}
                        {hasVisibleAttitudeColumns && (
                          <div className="semester-assessments-transposed-group">
                            <div
                              className="semester-assessments-transposed-row semester-assessments-transposed-group-head"
                              role="row"
                              style={{
                                ...getAttitudeTotalStyle(),
                                gridTemplateColumns: transposedGridColumns,
                              }}
                            >
                              <span role="rowheader">Atitudes</span>
                            </div>
                            {visibleAttitudeTemplates.map((template) => (
                              <div
                                className="semester-assessments-transposed-row semester-assessments-transposed-moment-row"
                                role="row"
                                key={template.id}
                                style={{
                                  ...getAttitudeStyle(template),
                                  gridTemplateColumns: transposedGridColumns,
                                }}
                              >
                                <span role="rowheader" title={template.text}>
                                  {getAttitudeLabel(template)}
                                </span>
                                {visibleStudents.map((student, studentIndex) => (
                                  <span
                                    className="semester-assessments-attitude-cell"
                                    role="cell"
                                    key={String(student._id ?? student.id ?? studentIndex)}
                                  >
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={getStudentAttitudeInputValue(student, template)}
                                      onChange={(event) =>
                                        updateStudentAttitudeDraft(student, template, event.target.value)
                                      }
                                      onFocus={(event) => event.currentTarget.select()}
                                      onBlur={(event) =>
                                        void saveStudentAttitudeCell(student, template, event.target.value)
                                      }
                                      onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                          event.currentTarget.blur()
                                        }
                                      }}
                                      aria-label={`Valor de ${getStringValue(student.name)} em ${template.alias}`}
                                    />
                                  </span>
                                ))}
                              </div>
                            ))}
                            <div
                              className="semester-assessments-transposed-row semester-assessments-transposed-weighted-row"
                              role="row"
                              style={{
                                ...getAttitudeTotalStyle(),
                                gridTemplateColumns: transposedGridColumns,
                              }}
                            >
                              <span role="rowheader">
                                Total atitudes *{formatAssessmentValue(totalAttitudeWeightPercentage)}%
                              </span>
                              {visibleStudents.map((student, studentIndex) => (
                                <strong
                                  role="cell"
                                  key={String(student._id ?? student.id ?? studentIndex)}
                                >
                                  {formatAssessmentValue(getStudentAttitudesWeightedValue(student))}
                                </strong>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="semester-assessments-transposed-group">
                          <div
                            className="semester-assessments-transposed-row semester-assessments-transposed-final-row"
                            role="row"
                            style={{ gridTemplateColumns: transposedGridColumns }}
                          >
                            <span role="rowheader">Final</span>
                            {visibleStudents.map((student, studentIndex) => (
                              <strong
                                role="cell"
                                key={String(student._id ?? student.id ?? studentIndex)}
                                style={getStudentAssessmentFinalStyle(student)}
                              >
                                {formatAssessmentValue(getStudentAssessmentFinalValue(student))}
                              </strong>
                            ))}
                          </div>
                          <div
                            className="semester-assessments-transposed-row semester-assessments-transposed-final-row"
                            role="row"
                            style={{ gridTemplateColumns: transposedGridColumns }}
                          >
                            <span role="rowheader">Nota</span>
                            {visibleStudents.map((student, studentIndex) => (
                              <strong
                                role="cell"
                                key={String(student._id ?? student.id ?? studentIndex)}
                                style={getStudentAssessmentFinalStyle(student)}
                              >
                                {getStudentAssessmentFinalGrade(student)}
                              </strong>
                            ))}
                          </div>
                        </div>
                      </div>
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
                              const momentsHidden = areGroupMomentsHidden(group.type)
                              const metricsHidden = isGroupMetricsHidden(group.type)
                              const metricsVisible = areGroupMetricsVisible(group.type)
                              const groupClassName = getGroupClassName(groupIndex)
                              const groupStyle = getGroupStyle(group.type, groupIndex)
                              return (
                              <span
                                className={`semester-assessments-type-head semester-assessments-group-cell ${groupClassName}`}
                                role="columnheader"
                                key={group.type}
                                style={{
                                  ...groupStyle,
                                  gridColumn: `span ${(momentsHidden ? 0 : group.moments.length) + (metricsVisible ? 2 : 0)}`,
                                }}
                              >
                                <button
                                  type="button"
                                  className="semester-assessments-group-label"
                                  aria-expanded={!momentsHidden}
                                  aria-label={`${momentsHidden ? 'Mostrar' : 'Ocultar'} momentos de ${group.type}`}
                                  onClick={() => toggleGroupMoments(group.type)}
                                >
                                  {group.type}
                                </button>
                                <span>-</span>
                                <label className="semester-assessments-weight-field">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={getAssessmentWeightInputValue(group.type, group.weightPercentage)}
                                    onChange={(event) => updateAssessmentWeight(group.type, event.target.value)}
                                    onFocus={(event) => event.currentTarget.select()}
                                    aria-label={`Ponderação de ${group.type}`}
                                  />
                                  <span className="semester-assessments-weight-label">%</span>
                                </label>
                                {!momentsHidden && (
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
                                )}
                              </span>
                              )
                            })}
                            {hasVisibleAttitudeColumns && (
                              <span
                                className="semester-assessments-type-head semester-assessments-group-cell semester-assessments-attitudes-head"
                                role="columnheader"
                                style={{
                                  ...getAttitudeTotalStyle(),
                                  gridColumn: `span ${visibleAttitudeTemplates.length + 1}`,
                                }}
                              >
                                Atitudes
                              </span>
                            )}
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
                              ...(areGroupMomentsHidden(group.type) ? [] : group.moments.map((moment) => (
                                <span
                                  className={`semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                  role="columnheader"
                                  key={getDocumentId(moment) ?? getStringValue(moment.name)}
                                  style={getGroupStyle(group.type, groupIndex)}
                                >
                                  <span className="semester-assessments-moment-title">
                                    {getStringValue(moment.name)}{' '}
                                    <strong className="question-max-value">
                                      ({getEvaluationMomentMaxValue(moment)})
                                    </strong>
                                  </span>
                                </span>
                              ))),
                              ...(areGroupMetricsVisible(group.type) ? [
                              <span
                                className={`semester-assessments-average-head semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                role="columnheader"
                                key={`${group.type}-average`}
                                style={getGroupStyle(group.type, groupIndex)}
                              >
                                Média
                              </span>,
                              <span
                                className={`semester-assessments-weighted-head semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                role="columnheader"
                                key={`${group.type}-weighted`}
                                title={`Média × ${formatAssessmentValue(group.weightPercentage)}%`}
                                style={getGroupStyle(group.type, groupIndex)}
                              >
                                M*{formatAssessmentValue(group.weightPercentage)}%
                              </span>,
                              ] : []),
                            ])}
                            {visibleAttitudeTemplates.map((template) => (
                              <span
                                className="semester-assessments-group-cell semester-assessments-attitude-head"
                                role="columnheader"
                                key={template.id}
                                title={template.text}
                                style={getAttitudeStyle(template)}
                              >
                                <span>{getAttitudeLabel(template)}</span>
                                <button
                                  className="semester-assessments-group-toggle"
                                  type="button"
                                  aria-label={`Ocultar atitude ${template.alias}`}
                                  title={`Ocultar ${template.alias}`}
                                  onClick={() => toggleAttitudeColumn(template.id)}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {hasVisibleAttitudeColumns && (
                              <span
                                className="semester-assessments-weighted-head semester-assessments-group-cell"
                                role="columnheader"
                                title={`Soma das atitudes × ${formatAssessmentValue(totalAttitudeWeightPercentage)}%`}
                                style={getAttitudeTotalStyle()}
                              >
                                {formatAssessmentValue(totalAttitudeWeightPercentage)}%
                              </span>
                            )}
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
                              ...(areGroupMomentsHidden(group.type) ? [] : group.moments.map((moment) => (
                                <strong
                                  className={`semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                  role="cell"
                                  key={getDocumentId(moment) ?? getStringValue(moment.name)}
                                  style={getGroupStyle(group.type, groupIndex)}
                                >
                                  {getStudentSavedMomentTotal(student, moment)}
                                </strong>
                              ))),
                              ...(areGroupMetricsVisible(group.type) ? [
                              <strong
                                className={`semester-assessments-average-cell semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                role="cell"
                                key={`${group.type}-average`}
                                style={getGroupStyle(group.type, groupIndex)}
                              >
                                {formatAssessmentValue(getStudentAssessmentGroupAverage(student, group))}
                              </strong>,
                              <strong
                                className={`semester-assessments-weighted-cell semester-assessments-group-cell ${getGroupClassName(groupIndex)}`}
                                role="cell"
                                key={`${group.type}-weighted`}
                                style={getGroupStyle(group.type, groupIndex)}
                              >
                                {formatAssessmentValue(getStudentAssessmentGroupWeightedValue(student, group))}
                              </strong>,
                              ] : []),
                            ])}
                            {visibleAttitudeTemplates.map((template) => (
                              <span
                                className="semester-assessments-group-cell semester-assessments-attitude-cell"
                                role="cell"
                                key={template.id}
                                style={getAttitudeStyle(template)}
                              >
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={getStudentAttitudeInputValue(student, template)}
                                  onChange={(event) =>
                                    updateStudentAttitudeDraft(student, template, event.target.value)
                                  }
                                  onFocus={(event) => event.currentTarget.select()}
                                  onBlur={(event) =>
                                    void saveStudentAttitudeCell(student, template, event.target.value)
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                      event.currentTarget.blur()
                                    }
                                  }}
                                  aria-label={`Valor de ${getStringValue(student.name)} em ${template.alias}`}
                                />
                              </span>
                            ))}
                            {hasVisibleAttitudeColumns && (
                              <strong
                                className="semester-assessments-weighted-cell semester-assessments-group-cell"
                                role="cell"
                                style={getAttitudeTotalStyle()}
                              >
                                {formatAssessmentValue(getStudentAttitudesWeightedValue(student))}
                              </strong>
                            )}
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
                      {renderAttitudeVisibilityControls('semester-assessments-mobile-visibility-controls')}
                      <div className="semester-assessments-mobile-list" aria-label="Avaliações por semestre em cartões">
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
                              const momentsHidden = areGroupMomentsHidden(group.type)
                              const groupClassName = getGroupClassName(groupIndex)
                              const groupStyle = getGroupStyle(group.type, groupIndex)
                              return (
                                <section
                                  className={`semester-assessments-mobile-group ${groupClassName}`}
                                  key={group.type}
                                  aria-label={group.type}
                                  style={groupStyle}
                                >
                                  <div className="semester-assessments-mobile-group-heading">
                                    <button
                                      type="button"
                                      className="semester-assessments-mobile-group-label"
                                      aria-expanded={!momentsHidden}
                                      aria-label={`${momentsHidden ? 'Mostrar' : 'Ocultar'} momentos de ${group.type}`}
                                      onClick={() => toggleGroupMoments(group.type)}
                                    >
                                      {group.type}
                                    </button>
                                    <label className="semester-assessments-mobile-weight-field">
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        value={getAssessmentWeightInputValue(group.type, group.weightPercentage)}
                                        onChange={(event) => updateAssessmentWeight(group.type, event.target.value)}
                                        onFocus={(event) => event.currentTarget.select()}
                                        aria-label={`Ponderação de ${group.type}`}
                                      />
                                      <span>%</span>
                                    </label>
                                    {!momentsHidden && (
                                      <button
                                        className="semester-assessments-mobile-group-toggle"
                                        type="button"
                                        aria-expanded={!metricsHidden}
                                        aria-label={`${metricsHidden ? 'Mostrar' : 'Ocultar'} média e ponderação de ${group.type}`}
                                        onClick={() => toggleGroupMetrics(group.type)}
                                      >
                                        {metricsHidden ? '+' : '−'}
                                      </button>
                                    )}
                                  </div>
                                  {!momentsHidden && (
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
                                  )}
                                  {(!metricsHidden || momentsHidden) && (
                                    <div className="semester-assessments-mobile-metrics">
                                      <p>
                                        <span>Média:</span>
                                        <strong>{formatAssessmentValue(getStudentAssessmentGroupAverage(student, group))}</strong>
                                      </p>
                                      <p>
                                        <span>M*{formatAssessmentValue(group.weightPercentage)}%:</span>
                                        <strong>{formatAssessmentValue(getStudentAssessmentGroupWeightedValue(student, group))}</strong>
                                      </p>
                                    </div>
                                  )}
                                </section>
                              )
                            })}
                            {hasVisibleAttitudeColumns && (
                              <section
                                className="semester-assessments-mobile-group semester-assessments-mobile-attitudes"
                                aria-label="Atitudes"
                                style={getAttitudeTotalStyle()}
                              >
                                <div className="semester-assessments-mobile-group-heading">
                                  <span>Atitudes</span>
                                  <strong>{formatAssessmentValue(totalAttitudeWeightPercentage)}%</strong>
                                </div>
                                <div className="semester-assessments-mobile-moments">
                                  {visibleAttitudeTemplates.map((template) => (
                                    <p key={template.id}>
                                      <span>{getAttitudeLabel(template)}:</span>
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        value={getStudentAttitudeInputValue(student, template)}
                                        onChange={(event) =>
                                          updateStudentAttitudeDraft(student, template, event.target.value)
                                        }
                                        onFocus={(event) => event.currentTarget.select()}
                                        onBlur={(event) =>
                                          void saveStudentAttitudeCell(student, template, event.target.value)
                                        }
                                        onKeyDown={(event) => {
                                          if (event.key === 'Enter') {
                                            event.currentTarget.blur()
                                          }
                                        }}
                                        aria-label={`Valor de ${getStringValue(student.name)} em ${template.alias}`}
                                      />
                                    </p>
                                  ))}
                                </div>
                                <div className="semester-assessments-mobile-metrics">
                                  <p>
                                    <span>Total atitudes:</span>
                                    <strong>{formatAssessmentValue(getStudentAttitudesWeightedValue(student))}</strong>
                                  </p>
                                </div>
                              </section>
                            )}
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
                      {hasVisibleAttitudeColumns && (
                        <div className="semester-assessments-attitudes-legend" aria-label="Legenda das atitudes">
                          {visibleAttitudeTemplates.map((template) => (
                            <p key={template.id}>
                              <strong>{template.alias}:</strong>
                              <span>{template.text}</span>
                            </p>
                          ))}
                        </div>
                      )}
                      </>
                    )}
                  </section>
                )
  )
}

type AssessmentGroupStyle = CSSProperties & {
  '--assessment-group-background': string
  '--assessment-group-average-background': string
  '--assessment-group-weighted-background': string
  '--assessment-group-text': string
}
