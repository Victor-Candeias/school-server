import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'

type ClassFormProps = {
  model: SchoolApplicationModel
}

export function ClassForm({ model }: ClassFormProps) {
  const {
    handleSaveClass,
    newClass,
    updateNewClassField,
    editingClassId,
    openStudentModal,
    removeStudentFromClassForm,
    isLoadingClasses,
  } = model

  return (
    <form onSubmit={handleSaveClass}>
                    <div className="form-row">
                      <label>
                        Ano
                        <input
                          type="number"
                          value={newClass.classYear}
                          onChange={(event) => updateNewClassField('classYear', event.target.value)}
                          placeholder="Ex: 7"
                          min={1}
                          max={12}
                          autoFocus
                          required
                        />
                      </label>
                      <label>
                        Letra da turma
                        <input
                          type="text"
                          value={newClass.classLetter}
                          onChange={(event) => updateNewClassField('classLetter', event.target.value.toUpperCase())}
                          placeholder="Ex: A"
                          maxLength={3}
                          required
                        />
                      </label>
                      <label>
                        Diretora de turma
                        <input
                          type="text"
                          value={newClass.directorName}
                          onChange={(event) => updateNewClassField('directorName', event.target.value)}
                          placeholder="Nome completo"
                          required
                        />
                      </label>
                    </div>

                    {!editingClassId && (
                    <section className="students-form-section" aria-label="Alunos da turma">
                      <div className="students-form-header">
                        <div>
                          <h3>Alunos</h3>
                          <p>Adiciona os alunos que devem ficar associados à turma.</p>
                        </div>
                        <button type="button" className="secondary-button" onClick={openStudentModal}>
                          Adicionar aluno
                        </button>
                      </div>

                      {newClass.students.length === 0 ? (
                        <p className="students-empty-state">Ainda não adicionaste alunos a esta turma.</p>
                      ) : (
                        <div className="students-form-list">
                          {newClass.students.map((student, index) => (
                            <article className="student-form-card" key={student.id}>
                              <div className="student-form-title">
                                <strong>{student.name}</strong>
                                <button
                                  type="button"
                                  className="transparent-button"
                                  onClick={() => removeStudentFromClassForm(index)}
                                >
                                  Remover
                                </button>
                              </div>
                              <dl className="student-summary">
                                <div>
                                  <dt>ID</dt>
                                  <dd>{student.id}</dd>
                                </div>
                                <div>
                                  <dt>Número</dt>
                                  <dd>{student.schoolNumber}</dd>
                                </div>
                                <div>
                                  <dt>Email escolar</dt>
                                  <dd>{student.schoolEmail}</dd>
                                </div>
                                <div>
                                  <dt>EE</dt>
                                  <dd>{student.guardianName}</dd>
                                </div>
                              </dl>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                    )}

                    <button type="submit" disabled={isLoadingClasses}>
                      {isLoadingClasses
                        ? 'A guardar...'
                        : editingClassId ? 'Guardar alterações' : 'Gravar turma'}
                    </button>
                  </form>
  )
}
