import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import { EvaluationQuestionForm } from '../forms/EvaluationQuestionForm'

type EvaluationQuestionModalProps = {
  model: SchoolApplicationModel
}

export function EvaluationQuestionModal({ model }: EvaluationQuestionModalProps) {
  const {
    closeEvaluationQuestionModal,
  } = model

  return (
    <div className="modal-backdrop student-modal-backdrop" role="presentation">
                <section className="modal-card small-modal-card" aria-labelledby="create-evaluation-question-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={closeEvaluationQuestionModal}
                  >
                    ×
                  </button>
                  <h2 id="create-evaluation-question-title">Inserir questão</h2>
                  <EvaluationQuestionForm model={model} />
                </section>
              </div>
  )
}
