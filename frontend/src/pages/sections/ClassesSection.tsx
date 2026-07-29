import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'


type ClassesSectionProps = {
  model: SchoolApplicationModel
}

export function ClassesSection({ model }: ClassesSectionProps) {
  const {
    openCreateClassModal,
    getClassesForAcademicYear,
    selectedAcademicYearDocument,
    getClassTitle,
    getClassStudentCount,
    openStudentsDashboard,
    openEditClassModal,
  } = model

  if (!selectedAcademicYearDocument) return null

  return (
    (
              <section className="schools-grid" aria-label="Turmas">
                <article className="school-card create-school-card">
                  <h2>Criar nova turma</h2>
                  <p>Adicionar uma nova turma a este ano letivo.</p>
                  <button type="button" className="create-action-button" onClick={openCreateClassModal}>
                    Nova turma
                  </button>
                </article>
                {getClassesForAcademicYear(selectedAcademicYearDocument).map((schoolClass, index) => (
                  <article
                    className="school-card class-card"
                    key={String(schoolClass._id ?? schoolClass.name ?? index)}
                  >
                    <h2>{getClassTitle(schoolClass)}</h2>
                    <div className="school-card-meta class-card-meta" aria-label="Número de alunos associados">
                      <span>Alunos</span>
                      <strong>{getClassStudentCount(schoolClass)}</strong>
                    </div>
                    <div className="school-card-actions">
                      <button type="button" onClick={() => openStudentsDashboard(schoolClass)}>
                        Abrir alunos
                      </button>
                      <button
                        type="button"
                        className="transparent-button"
                        onClick={() => openEditClassModal(schoolClass)}
                      >
                        Editar nome
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )
  )
}
