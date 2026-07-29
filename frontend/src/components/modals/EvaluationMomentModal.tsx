import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import { EvaluationMomentForm } from '../forms/EvaluationMomentForm'

type EvaluationMomentModalProps = {
  model: SchoolApplicationModel
}

export function EvaluationMomentModal({ model }: EvaluationMomentModalProps) {
  const {
    closeEvaluationMomentModal,
    editingEvaluationMomentId,
    classesError,
  } = model

  return (
    <div className="modal-backdrop" role="presentation">
                <section className="modal-card small-modal-card" aria-labelledby="create-evaluation-moment-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={closeEvaluationMomentModal}
                  >
                    ×
                  </button>
                  <h2 id="create-evaluation-moment-title">
                    {editingEvaluationMomentId
                      ? 'Editar Momento de Avaliação'
                      : 'Inserir Momento de Avaliação'}
                  </h2>
                  {classesError && <p className="modal-feedback error">{classesError}</p>}
                  <EvaluationMomentForm model={model} />
                </section>
              </div>
  )
}
