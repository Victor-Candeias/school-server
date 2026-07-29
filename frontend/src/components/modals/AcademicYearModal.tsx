import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import { AcademicYearForm } from '../forms/AcademicYearForm'

type AcademicYearModalProps = {
  model: SchoolApplicationModel
}

export function AcademicYearModal({ model }: AcademicYearModalProps) {
  const {
    setIsCreateYearModalOpen,
    setEditingYearId,
    editingYearId,
  } = model

  return (
    <div className="modal-backdrop" role="presentation">
                <section className="modal-card small-modal-card" aria-labelledby="create-year-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={() => {
                      setIsCreateYearModalOpen(false)
                      setEditingYearId(null)
                    }}
                  >
                    ×
                  </button>
                  <h2 id="create-year-title">
                    {editingYearId ? 'Editar ano letivo' : 'Criar novo ano letivo'}
                  </h2>
                  <AcademicYearForm model={model} />
                </section>
              </div>
  )
}
