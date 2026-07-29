import type { AcademicYearOption } from '../types'

export function getAcademicYearOptions(): AcademicYearOption[] {
  const currentYear = new Date().getFullYear()

  return Array.from({ length: 6 }, (_, index) => {
    const startYear = currentYear - index
    const endYear = startYear + 1
    const label = `${startYear}/${endYear}`

    return {
      value: label,
      label,
      startYear,
      endYear,
    }
  })
}

export function formatPostalCode(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 7)

  if (digits.length <= 4) {
    return digits
  }

  return `${digits.slice(0, 4)}-${digits.slice(4)}`
}
