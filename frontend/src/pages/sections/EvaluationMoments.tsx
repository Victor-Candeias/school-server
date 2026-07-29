import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'


type EvaluationMomentsProps = {
  model: SchoolApplicationModel
}

export function EvaluationMoments({ model }: EvaluationMomentsProps) {
  const {
    openNewEvaluationMomentModal,
    getEvaluationMomentsForClass,
    selectedClass,
    getStringValue,
    getEvaluationMomentTypeLabel,
    getEvaluationMomentQuestionCount,
    openEditEvaluationMomentModal,
    generateAssessmentReport,
    isLoadingClasses,
    deleteEvaluationMoment,
  } = model

  if (!selectedClass) return null

  return (
    (
                  <section className="students-panel" aria-label="Momentos de avaliação">
                    <div className="students-panel-heading">
                      <h2>Momento de Avaliação</h2>
                      <button
                        type="button"
                        onClick={openNewEvaluationMomentModal}
                      >
                        Inserir Momento de Avaliação
                      </button>
                    </div>
                    {getEvaluationMomentsForClass(selectedClass).length === 0 ? (
                      <p className="students-empty-state">Ainda não existem momentos de avaliação nesta turma.</p>
                    ) : (
                      <div className="evaluation-moments-table" role="table" aria-label="Momentos de avaliação">
                        <div className="evaluation-moments-row evaluation-moments-table-head" role="row">
                          <span role="columnheader">Nome</span>
                          <span role="columnheader">Tipo</span>
                          <span role="columnheader">Valor total</span>
                          <span role="columnheader">Questões</span>
                          <span role="columnheader">Ações</span>
                        </div>
                        {getEvaluationMomentsForClass(selectedClass).map((moment, index) => (
                          <div
                            className="evaluation-moments-row"
                            role="row"
                            key={String(moment._id ?? moment.name ?? index)}
                          >
                            <span className="evaluation-moment-name-cell" role="cell">
                              <span className="evaluation-moment-cell-label" aria-hidden="true">Nome:</span>
                              {getStringValue(moment.name)}
                            </span>
                            <span className="evaluation-moment-type-cell" role="cell">
                              <span className="evaluation-moment-cell-label" aria-hidden="true">Tipo:</span>
                              {getEvaluationMomentTypeLabel(moment)}
                            </span>
                            <span className="evaluation-moment-value-cell" role="cell">
                              <span className="evaluation-moment-cell-label" aria-hidden="true">Valor Total:</span>
                              {String(moment.totalValue ?? '')}
                            </span>
                            <span className="evaluation-moment-questions-cell" role="cell">
                              <span className="evaluation-moment-cell-label" aria-hidden="true">N.º de Questões:</span>
                              {getEvaluationMomentQuestionCount(moment)}
                            </span>
                            <span className="student-row-actions evaluation-moment-actions" role="cell">
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Editar momento de avaliação"
                                onClick={() => openEditEvaluationMomentModal(moment)}
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Gerar relatório do momento de avaliação"
                                onClick={() => generateAssessmentReport(moment)}
                                disabled={isLoadingClasses}
                              >
                                📄
                              </button>
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Apagar momento de avaliação"
                                onClick={() => deleteEvaluationMoment(moment)}
                              >
                                🗑
                              </button>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )
  )
}
