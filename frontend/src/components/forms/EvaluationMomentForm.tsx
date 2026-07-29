import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'

type EvaluationMomentFormProps = {
  model: SchoolApplicationModel
}

export function EvaluationMomentForm({ model }: EvaluationMomentFormProps) {
  const {
    handleSaveEvaluationMoment,
    newEvaluationMoment,
    updateEvaluationMomentField,
    getEvaluationQuestionsTotal,
    removeEvaluationQuestion,
    openEvaluationQuestionModal,
    isLoadingClasses,
    editingEvaluationMomentId,
    evaluationMomentTemplates,
  } = model

  const hasEvaluationMomentTemplates = evaluationMomentTemplates.length > 0

  return (
    <form onSubmit={handleSaveEvaluationMoment}>
                    <label>
                      Nome do momento de avaliação
                      <input
                        type="text"
                        value={newEvaluationMoment.name}
                        onChange={(event) => updateEvaluationMomentField('name', event.target.value)}
                        placeholder="Ex: Teste 1"
                        autoFocus
                        required
                      />
                    </label>
                    <div className="form-row three-columns">
                      <label>
                        Template
                        <select
                          value={newEvaluationMoment.templateId}
                          onChange={(event) =>
                            updateEvaluationMomentField('templateId', event.target.value)
                          }
                          disabled={!hasEvaluationMomentTemplates}
                          required
                        >
                          <option value="">
                            {hasEvaluationMomentTemplates
                              ? 'Seleciona um template'
                              : 'Sem templates configurados'}
                          </option>
                          {evaluationMomentTemplates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.type} ({template.weightPercentage}%)
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Semestre
                        <select
                          value={newEvaluationMoment.semester}
                          onChange={(event) =>
                            updateEvaluationMomentField(
                              'semester',
                              event.target.value === '2' ? '2' : '1',
                            )
                          }
                          required
                        >
                          <option value="1">1.º semestre</option>
                          <option value="2">2.º semestre</option>
                        </select>
                      </label>
                      <label>
                        Valor total das questões
                        <select
                          value={newEvaluationMoment.totalValue}
                          onChange={(event) =>
                            updateEvaluationMomentField(
                              'totalValue',
                              event.target.value === '100' ? 100 : 20,
                            )
                          }
                          required
                        >
                          <option value={20}>20</option>
                          <option value={100}>100</option>
                        </select>
                      </label>
                    </div>
                    {newEvaluationMoment.questions.length > 0 && (
                      <section className="evaluation-questions-section" aria-label="Lista de questões">
                        <div className="evaluation-questions-header">
                          <h3>Questões</h3>
                          <span>
                            Total das questões: {getEvaluationQuestionsTotal()} /{' '}
                            {newEvaluationMoment.totalValue}
                          </span>
                        </div>
                        <div className="evaluation-questions-table" role="table" aria-label="Questões">
                          <div className="evaluation-questions-row evaluation-questions-table-head" role="row">
                            <span role="columnheader">N.º questão</span>
                            <span role="columnheader">Valor</span>
                            <span role="columnheader">Ações</span>
                          </div>
                          {newEvaluationMoment.questions.map((question, index) => (
                            <div className="evaluation-questions-row" role="row" key={index}>
                              <span role="cell">{question.questionNumber}</span>
                              <span role="cell">{question.value}</span>
                              <span role="cell">
                                <button
                                  type="button"
                                  className="transparent-button"
                                  onClick={() => removeEvaluationQuestion(index)}
                                >
                                  Remover
                                </button>
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={openEvaluationQuestionModal}
                    >
                      Inserir lista de questões
                    </button>
                    <button
                      type="submit"
                      disabled={isLoadingClasses || !hasEvaluationMomentTemplates}
                    >
                      {isLoadingClasses
                        ? 'A guardar...'
                        : editingEvaluationMomentId
                          ? 'Guardar alterações'
                          : 'Gravar momento de avaliação'}
                    </button>
                  </form>
  )
}
