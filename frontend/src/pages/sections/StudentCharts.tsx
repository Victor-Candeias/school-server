import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import { AreaChart } from '../../components/charts/AreaChart'
import { BarChart } from '../../components/charts/BarChart'
import { LineChart } from '../../components/charts/LineChart'
import { RadarChart } from '../../components/charts/RadarChart'

type StudentChartsProps = {
  model: SchoolApplicationModel
}

export function StudentCharts({ model }: StudentChartsProps) {
  const {
    getStudentsForClass,
    selectedClass,
    getEvaluationMomentsForClass,
    chartStudentId,
    chartMomentId,
    getChartData,
    getAllStudentsForMomentData,
    CHART_PALETTE,
    nextChartType,
    getChartTypeLabel,
    chartType,
    exportChartToPdf,
    setChartStudentId,
    getStringValue,
    setChartMomentId,
    getEvaluationMomentMaxValue,
  } = model

  if (!selectedClass) return null

  return (
    (
                  (() => {
                    const ALL_STUDENTS_VALUE = '__all__'
                    const students = getStudentsForClass(selectedClass)
                    const allMoments = selectedClass ? getEvaluationMomentsForClass(selectedClass) : []
                    const isAllStudents = chartStudentId === ALL_STUDENTS_VALUE
                    const chartStudent = isAllStudents
                      ? null
                      : (students.find((s) => String(s._id ?? s.id) === chartStudentId) ?? students[0] ?? null)
                    const selectedMoment = isAllStudents
                      ? (allMoments.find((m) => String(m._id ?? m.id) === chartMomentId) ?? allMoments[0] ?? null)
                      : null
                    const singleData = chartStudent ? getChartData(chartStudent) : []
                    const allMomentData = isAllStudents && selectedMoment
                      ? getAllStudentsForMomentData(students, selectedMoment)
                      : []
                    const data = isAllStudents ? allMomentData : singleData
                    const hasData = data.length > 0
                    const CHART_COLOR = CHART_PALETTE[0]
                    const CHART_COLOR_2 = CHART_PALETTE[1]
                    const currentValue = chartStudentId || (students[0] ? String(students[0]._id ?? students[0].id) : '')
                    return (
                      <section className="students-panel charts-panel print-section" aria-label="Gráficos de avaliação">
                        <div className="students-panel-heading">
                          <h2>Gráficos</h2>
                          <div className="students-panel-heading-actions">
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={nextChartType}
                              title="Mudar tipo de gráfico"
                            >
                              {getChartTypeLabel(chartType)}
                            </button>
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={exportChartToPdf}
                              disabled={!hasData}
                              title="Exportar para PDF"
                            >
                              📄 Exportar PDF
                            </button>
                          </div>
                        </div>
                        <div className="chart-filters">
                          <label className="chart-student-select-label">
                            Aluno
                            <select
                              value={currentValue || ALL_STUDENTS_VALUE}
                              onChange={(e) => setChartStudentId(e.target.value)}
                            >
                              {students.length === 0 ? (
                                <option value="">Sem alunos</option>
                              ) : (
                                <>
                                  <option value={ALL_STUDENTS_VALUE}>Todos os alunos</option>
                                  {students.map((s, i) => (
                                    <option
                                      key={String(s._id ?? s.id ?? i)}
                                      value={String(s._id ?? s.id ?? i)}
                                    >
                                      {getStringValue(s.name)}
                                    </option>
                                  ))}
                                </>
                              )}
                            </select>
                          </label>
                          {isAllStudents && (
                            <label className="chart-student-select-label">
                              Momento de avaliação
                              <select
                                value={chartMomentId || String(allMoments[0]?._id ?? allMoments[0]?.id ?? '')}
                                onChange={(e) => setChartMomentId(e.target.value)}
                              >
                                {allMoments.length === 0 ? (
                                  <option value="">Sem momentos</option>
                                ) : (
                                  allMoments.map((m, i) => (
                                    <option
                                      key={String(m._id ?? m.id ?? i)}
                                      value={String(m._id ?? m.id ?? i)}
                                    >
                                      {getStringValue(m.name)}
                                    </option>
                                  ))
                                )}
                              </select>
                            </label>
                          )}
                        </div>
                        {!hasData ? (
                          <p className="students-empty-state">
                            {students.length === 0
                              ? 'Ainda não existem alunos nesta turma.'
                              : allMoments.length === 0
                                ? 'Ainda não existem momentos de avaliação nesta turma.'
                                : 'Seleciona um momento de avaliação.'}
                          </p>
                        ) : (
                          <div className="chart-container">
                            {chartStudent && (
                              <p className="chart-student-name">{getStringValue(chartStudent.name)}</p>
                            )}
                            {isAllStudents && selectedMoment && (
                              <p className="chart-student-name">
                                {getStringValue(selectedMoment.name)}
                                {' — '}máximo: {getEvaluationMomentMaxValue(selectedMoment)}
                              </p>
                            )}
                            {chartType === 'bar' ? (
                              <BarChart data={data}
                                isAllStudents={isAllStudents}
                                palette={CHART_PALETTE}
                                primaryColor={CHART_COLOR}
                                secondaryColor={CHART_COLOR_2} />
                            ) : chartType === 'line' ? (
                              <LineChart data={data}
                                isAllStudents={isAllStudents}
                                palette={CHART_PALETTE}
                                primaryColor={CHART_COLOR}
                                secondaryColor={CHART_COLOR_2} />
                            ) : chartType === 'area' ? (
                              <AreaChart data={data}
                                isAllStudents={isAllStudents}
                                palette={CHART_PALETTE}
                                primaryColor={CHART_COLOR}
                                secondaryColor={CHART_COLOR_2} />
                            ) : (
                              <RadarChart data={data}
                                isAllStudents={isAllStudents}
                                palette={CHART_PALETTE}
                                primaryColor={CHART_COLOR}
                                secondaryColor={CHART_COLOR_2} />
                            )}
                          </div>
                        )}
                      </section>
                    )
                  })()
                )
  )
}
