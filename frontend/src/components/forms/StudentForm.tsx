import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'

type StudentFormProps = {
  model: SchoolApplicationModel
}

export function StudentForm({ model }: StudentFormProps) {
  const {
    handleSaveStudent,
    newStudent,
    updateNewStudentField,
    isLoadingClasses,
    editingStudentId,
  } = model

  return (
    <form onSubmit={handleSaveStudent}>
                    <div className="form-row three-columns">
                      <label>
                        ID único
                        <input type="number" value={newStudent.id} readOnly />
                      </label>
                      <label>
                        Nome do aluno
                        <input
                          type="text"
                          value={newStudent.name}
                          onChange={(event) => updateNewStudentField('name', event.target.value)}
                          placeholder="Nome completo"
                          autoFocus
                          required
                        />
                      </label>
                      <label>
                        Número na escola
                        <input
                          type="text"
                          value={newStudent.schoolNumber}
                          onChange={(event) => updateNewStudentField('schoolNumber', event.target.value)}
                          placeholder="Ex: 12345"
                          required
                        />
                      </label>
                    </div>
                    <label>
                      Email escolar
                      <input
                        type="email"
                        value={newStudent.schoolEmail}
                        onChange={(event) => updateNewStudentField('schoolEmail', event.target.value)}
                        placeholder="aluno@escola.pt"
                        required
                      />
                    </label>
                    <div className="form-row three-columns">
                      <label>
                        Encarregado de educação
                        <input
                          type="text"
                          value={newStudent.guardianName}
                          onChange={(event) => updateNewStudentField('guardianName', event.target.value)}
                          placeholder="Nome completo"
                          required
                        />
                      </label>
                      <label>
                        Contacto do EE
                        <input
                          type="tel"
                          value={newStudent.guardianPhone}
                          onChange={(event) => updateNewStudentField('guardianPhone', event.target.value)}
                          placeholder="Telefone"
                          required
                        />
                      </label>
                      <label>
                        Email do EE
                        <input
                          type="email"
                          value={newStudent.guardianEmail}
                          onChange={(event) => updateNewStudentField('guardianEmail', event.target.value)}
                          placeholder="encarregado@example.com"
                          required
                        />
                      </label>
                    </div>
                    <button type="submit" disabled={isLoadingClasses}>
                      {isLoadingClasses
                        ? 'A guardar...'
                        : editingStudentId ? 'Guardar alterações' : 'Gravar aluno'}
                    </button>
                  </form>
  )
}
