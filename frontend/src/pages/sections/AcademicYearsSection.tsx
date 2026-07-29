import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'


type AcademicYearsSectionProps = {
  model: SchoolApplicationModel
}

export function AcademicYearsSection({ model }: AcademicYearsSectionProps) {
  const {
    openCreateYearModal,
    academicYears,
    getAcademicYearTitle,
    getAcademicYearClassCount,
    openClassesDashboard,
    openEditYearModal,
    deleteYear,
  } = model

  return (
    (
              <section className="schools-grid" aria-label="Anos letivos">
                <article className="school-card create-school-card">
                  <h2>Criar novo ano letivo</h2>
                  <p>Adicionar um novo ano letivo a esta escola.</p>
                  <button type="button" className="create-action-button" onClick={openCreateYearModal}>
                    Novo ano letivo
                  </button>
                </article>
                {academicYears.map((year, index) => (
                  <article
                    className="school-card year-card"
                    key={String(year._id ?? year.name ?? index)}
                  >
                    <h2>{getAcademicYearTitle(year)}</h2>
                    <div className="school-card-meta year-card-meta" aria-label="Número de turmas associadas">
                      <span>Turmas</span>
                      <strong>{getAcademicYearClassCount(year)}</strong>
                    </div>
                    <div className="school-card-actions">
                      <button type="button" onClick={() => openClassesDashboard(year)}>
                        Abrir
                      </button>
                      <button
                        type="button"
                        className="transparent-button"
                        onClick={() => openEditYearModal(year)}
                      >
                        Editar informação
                      </button>
                      <button
                        type="button"
                        className="transparent-button"
                        onClick={() => deleteYear(year)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )
  )
}
