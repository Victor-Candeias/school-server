import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import type { AcademicPeriodType } from '../../types'

type AcademicYearFormProps = {
  model: SchoolApplicationModel
}

export function AcademicYearForm({ model }: AcademicYearFormProps) {
  const {
    handleCreateAcademicYear,
    selectedAcademicYear,
    setSelectedAcademicYear,
    academicYearOptions,
    yearPeriodType,
    setYearPeriodType,
    isLoadingYears,
    editingYearId,
  } = model

  return (
    <form onSubmit={handleCreateAcademicYear}>
                    <label>
                      Ano letivo
                      <select
                        value={selectedAcademicYear}
                        onChange={(event) => setSelectedAcademicYear(event.target.value)}
                        autoFocus
                        required
                      >
                        {academicYearOptions.map((year) => (
                          <option key={year.value} value={year.value}>
                            {year.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Organização do ano letivo
                      <select
                        value={yearPeriodType}
                        onChange={(e) => setYearPeriodType(e.target.value as AcademicPeriodType)}
                        required
                      >
                        <option value="semestres">Semestres</option>
                        <option value="trimestres">Trimestres</option>
                      </select>
                    </label>
                    <button type="submit" disabled={isLoadingYears}>
                      {isLoadingYears
                        ? 'A guardar...'
                        : editingYearId ? 'Guardar alterações' : 'Criar ano letivo'}
                    </button>
                  </form>
  )
}
