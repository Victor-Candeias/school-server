import type { PercentageRange } from '../api/school'
import type { PasswordStrength } from '../types'
import { DEFAULT_PERCENTAGE_RANGES } from './constants'

export function getPasswordStrength(value: string): PasswordStrength {
  if (!value) {
    return { label: 'Introduz uma password', level: 'empty', score: 0 }
  }

  const checks = [
    value.length >= 8,
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ]
  const score = checks.filter(Boolean).length

  if (score >= 5) {
    return { label: 'Password forte', level: 'strong', score }
  }

  if (score >= 3) {
    return { label: 'Password média', level: 'medium', score }
  }

  return { label: 'Password fraca', level: 'weak', score }
}

export function normalizePercentageRanges(value: unknown): PercentageRange[] {
  if (!Array.isArray(value)) {
    return DEFAULT_PERCENTAGE_RANGES
  }

  const normalizedRanges = value
    .map((range) => {
      if (!range || typeof range !== 'object') {
        return null
      }

      const rangeRecord = range as Record<string, unknown>
      const min = Number(rangeRecord.min)
      const max = Number(rangeRecord.max)
      const nota = Number(rangeRecord.nota)
      const backgroundColor = rangeRecord.backgroundColor
      const textColor = rangeRecord.textColor

      if (
        !Number.isFinite(min) ||
        !Number.isFinite(max) ||
        typeof backgroundColor !== 'string' ||
        typeof textColor !== 'string'
      ) {
        return null
      }

      return {
        id: String(rangeRecord.id ?? `${min}-${max}`),
        min,
        max,
        nota: Number.isFinite(nota) ? nota : 0,
        backgroundColor,
        textColor,
      }
    })
    .filter((range): range is PercentageRange => Boolean(range))

  return normalizedRanges.length > 0 ? normalizedRanges : DEFAULT_PERCENTAGE_RANGES
}

export function normalizePositiveInteger(value: unknown, fallback: number) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue > 0 ? Math.trunc(numericValue) : fallback
}

export function normalizeNonNegativeInteger(value: unknown, fallback: number) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue >= 0 ? Math.trunc(numericValue) : fallback
}

export function normalizeDecimalInput(value: string, maxDecimalPlaces?: number) {
  const normalizedSeparatorValue = value.replace(',', '.')
  const [integerPart = '', ...decimalParts] = normalizedSeparatorValue
    .replace(/[^\d.]/g, '')
    .split('.')
  const normalizedIntegerPart = integerPart.replace(/^0+(?=\d)/, '')

  if (decimalParts.length === 0) {
    return normalizedIntegerPart
  }

  const decimalPart = decimalParts.join('')
  const limitedDecimalPart = maxDecimalPlaces === undefined
    ? decimalPart
    : decimalPart.slice(0, maxDecimalPlaces)

  return `${normalizedIntegerPart || '0'}.${limitedDecimalPart}`
}

export function normalizeIntegerInput(value: string) {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
}
