import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'


type SchoolsSectionProps = {
  model: SchoolApplicationModel
}

export function SchoolsSection({ model }: SchoolsSectionProps) {
  const {
    openCreateSchoolModal,
    schools,
    getSchoolTitle,
    getSchoolAcademicYearCount,
    openYearsDashboard,
    openEditSchoolModal,
  } = model

  return (
    (
            <section className="schools-grid" aria-label="Escolas">
              <article className="school-card create-school-card">
                <h2>Criar nova escola</h2>
                <p>Adicionar uma nova escola à plataforma.</p>
                <button type="button" className="create-action-button" onClick={openCreateSchoolModal}>
                  Nova escola
                </button>
              </article>

              {schools.map((school, index) => (
                <article
                  className="school-card existing-school-card"
                  key={String(school._id ?? school.name ?? index)}
                >
                  <h2>{getSchoolTitle(school)}</h2>
                  <div className="school-card-meta" aria-label="Número de anos letivos">
                    <span>Anos letivos</span>
                    <strong>{getSchoolAcademicYearCount(school)}</strong>
                  </div>
                  <div className="school-card-actions">
                    <button type="button" onClick={() => openYearsDashboard(school)}>
                      Abrir
                    </button>
                    <button
                      type="button"
                      className="transparent-button"
                      onClick={() => openEditSchoolModal(school)}
                    >
                      Editar informação
                    </button>
                  </div>
                </article>
              ))}

            </section>
            )
  )
}
