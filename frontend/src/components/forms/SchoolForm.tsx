import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'

type SchoolFormProps = {
  model: SchoolApplicationModel
}

export function SchoolForm({ model }: SchoolFormProps) {
  const {
    handleSaveSchool,
    newSchool,
    updateNewSchoolField,
    updatePostalCode,
    isLoadingSchools,
    editingSchoolId,
  } = model

  return (
    <form onSubmit={handleSaveSchool}>
                    <label>
                      ID da Escola
                      <input
                        type="text"
                        value={newSchool.schoolId}
                        onChange={(event) => updateNewSchoolField('schoolId', event.target.value)}
                        placeholder="Ex: ESC-001"
                        minLength={1}
                        autoFocus
                        required
                      />
                    </label>
                    <label>
                      Nome da escola
                      <input
                        type="text"
                        value={newSchool.name}
                        onChange={(event) => updateNewSchoolField('name', event.target.value)}
                        placeholder="Ex: Escola Secundária Central"
                        minLength={2}
                        required
                      />
                    </label>
                    <label>
                      Agrupamento
                      <input
                        type="text"
                        value={newSchool.group}
                        onChange={(event) => updateNewSchoolField('group', event.target.value)}
                        placeholder="Opcional"
                      />
                    </label>
                    <label>
                      Morada
                      <input
                        type="text"
                        value={newSchool.address}
                        onChange={(event) => updateNewSchoolField('address', event.target.value)}
                        placeholder="Rua, número e complemento"
                        required
                      />
                    </label>
                    <div className="form-row">
                      <label>
                        Código postal
                        <input
                          type="text"
                          inputMode="numeric"
                          value={newSchool.postalCode}
                          onChange={(event) => updatePostalCode(event.target.value)}
                          placeholder="0000-000"
                          maxLength={8}
                          required
                        />
                      </label>
                      <label>
                        Localidade
                        <input
                          type="text"
                          value={newSchool.locality}
                          onChange={(event) => updateNewSchoolField('locality', event.target.value)}
                          placeholder="Localidade"
                          required
                        />
                      </label>
                    </div>
                    <div className="form-row student-main-row">
                      <label>
                        Telefone 1
                        <input
                          type="tel"
                          value={newSchool.phone1}
                          onChange={(event) => updateNewSchoolField('phone1', event.target.value)}
                          placeholder="Obrigatório"
                          required
                        />
                      </label>
                      <label>
                        Telefone 2
                        <input
                          type="tel"
                          value={newSchool.phone2}
                          onChange={(event) => updateNewSchoolField('phone2', event.target.value)}
                          placeholder="Opcional"
                        />
                      </label>
                      <label>
                        Telefone 3
                        <input
                          type="tel"
                          value={newSchool.phone3}
                          onChange={(event) => updateNewSchoolField('phone3', event.target.value)}
                          placeholder="Opcional"
                        />
                      </label>
                    </div>
                    <label>
                      Nome da diretora
                      <input
                        type="text"
                        value={newSchool.directorName}
                        onChange={(event) => updateNewSchoolField('directorName', event.target.value)}
                        placeholder="Nome completo"
                        required
                      />
                    </label>
                    <label>
                      Contactos da diretora
                      <input
                        type="text"
                        value={newSchool.directorContacts}
                        onChange={(event) => updateNewSchoolField('directorContacts', event.target.value)}
                        placeholder="Opcional: telefone, email ou extensão"
                      />
                    </label>
                    <button type="submit" disabled={isLoadingSchools}>
                      {isLoadingSchools
                        ? 'A guardar...'
                        : editingSchoolId ? 'Guardar alterações' : 'Criar escola'}
                    </button>
                  </form>
  )
}
