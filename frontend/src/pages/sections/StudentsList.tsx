import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'


type StudentsListProps = {
  model: SchoolApplicationModel
}

export function StudentsList({ model }: StudentsListProps) {
  const {
    generateClassStudentsReport,
    getStudentsForClass,
    selectedClass,
    isLoadingClasses,
    openNewStudentFromDashboard,
    openEditStudentModal,
    generateStudentDetailReport,
    getDocumentId,
    setStudentActionMenuId,
    studentActionMenuId,
    deleteStudent,
    deactivateStudent,
  } = model

  if (!selectedClass) return null

  return (
    (
                  <section className="students-panel" aria-label="Lista de alunos da turma">
                    <div className="students-panel-heading">
                      <h2>Alunos da turma</h2>
                      <div className="students-panel-heading-actions">
                        <button
                          type="button"
                          onClick={generateClassStudentsReport}
                          disabled={getStudentsForClass(selectedClass).length === 0 || isLoadingClasses}
                        >
                          Relatório
                        </button>
                        <button
                          type="button"
                          className="create-action-button"
                          onClick={openNewStudentFromDashboard}
                        >
                          Novo aluno
                        </button>
                      </div>
                    </div>
                    {getStudentsForClass(selectedClass).length === 0 ? (
                      <p className="students-empty-state">Ainda não existem alunos nesta turma.</p>
                    ) : (
                      <div className="students-table" role="table" aria-label="Alunos">
                        <div className="students-table-row students-table-head" role="row">
                          <span role="columnheader">ID</span>
                          <span role="columnheader">Nome</span>
                          <span role="columnheader">N.º escola</span>
                          <span role="columnheader">Ações</span>
                        </div>
                        {getStudentsForClass(selectedClass).map((student, index) => (
                          <div className="students-table-row" role="row" key={String(student._id ?? student.id ?? index)}>
                            <span className="student-id-cell" role="cell">
                              <span className="student-cell-label" aria-hidden="true">ID:</span>
                              {String(student.id ?? '')}
                            </span>
                            <span className="student-name-cell" role="cell">
                              <span className="student-cell-label" aria-hidden="true">Nome:</span>
                              {String(student.name ?? '')}
                            </span>
                            <span className="student-school-number-cell" role="cell">
                              <span className="student-cell-label" aria-hidden="true">N.º Escola:</span>
                              {String(student.schoolNumber ?? '')}
                            </span>
                            <span className="student-row-actions" role="cell">
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Editar aluno"
                                onClick={() => openEditStudentModal(student)}
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Gerar relatório do aluno"
                                onClick={() => generateStudentDetailReport(student)}
                              >
                                📄
                              </button>
                              <span className="student-more-actions">
                                <button
                                  type="button"
                                  className="icon-button"
                                  aria-label="Apagar ou desativar aluno"
                                  onClick={() => {
                                    const studentId = getDocumentId(student)
                                    setStudentActionMenuId((currentId) =>
                                      currentId === studentId ? null : studentId,
                                    )
                                  }}
                                >
                                  ⋯
                                </button>
                                {studentActionMenuId === getDocumentId(student) && (
                                  <span className="student-action-menu">
                                    <button type="button" onClick={() => deleteStudent(student)}>
                                      Apagar aluno
                                    </button>
                                    <button type="button" onClick={() => deactivateStudent(student)}>
                                      Desativar aluno
                                    </button>
                                  </span>
                                )}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )
  )
}
