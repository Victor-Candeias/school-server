import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import { SchoolForm } from '../forms/SchoolForm'

type SchoolModalProps = {
  model: SchoolApplicationModel
}

export function SchoolModal({ model }: SchoolModalProps) {
  const {
    setIsCreateSchoolModalOpen,
    resetSchoolForm,
    editingSchoolId,
  } = model

  return (
    <div className="modal-backdrop" role="presentation">
                <section className="modal-card" aria-labelledby="create-school-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={() => {
                      setIsCreateSchoolModalOpen(false)
                      resetSchoolForm()
                    }}
                  >
                    ×
                  </button>
                  <h2 id="create-school-title">
                    {editingSchoolId ? 'Editar escola' : 'Criar nova escola'}
                  </h2>
                  <SchoolForm model={model} />
                </section>
              </div>
  )
}
