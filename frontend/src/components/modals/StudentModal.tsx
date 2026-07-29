import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import { StudentForm } from '../forms/StudentForm'

type StudentModalProps = {
  model: SchoolApplicationModel
}

export function StudentModal({ model }: StudentModalProps) {
  const {
    closeStudentModal,
    editingStudentId,
    classesError,
  } = model

  return (
    <div className="modal-backdrop student-modal-backdrop" role="presentation">
                <section className="modal-card student-modal-card" aria-labelledby="create-student-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={closeStudentModal}
                  >
                    ×
                  </button>
                  <h2 id="create-student-title">
                    {editingStudentId ? 'Editar aluno' : 'Adicionar aluno'}
                  </h2>
                  {classesError && <p className="modal-feedback error">{classesError}</p>}
                  <StudentForm model={model} />
                </section>
              </div>
  )
}
