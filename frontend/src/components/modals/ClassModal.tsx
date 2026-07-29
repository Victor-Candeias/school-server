import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import { ClassForm } from '../forms/ClassForm'

type ClassModalProps = {
  model: SchoolApplicationModel
}

export function ClassModal({ model }: ClassModalProps) {
  const {
    setIsCreateClassModalOpen,
    resetClassForm,
    editingClassId,
  } = model

  return (
    <div className="modal-backdrop" role="presentation">
                <section className="modal-card class-modal-card" aria-labelledby="create-class-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={() => {
                      setIsCreateClassModalOpen(false)
                      resetClassForm()
                    }}
                  >
                    ×
                  </button>
                  <h2 id="create-class-title">
                    {editingClassId ? 'Editar turma' : 'Criar nova turma'}
                  </h2>
                  <ClassForm model={model} />
                </section>
              </div>
  )
}
