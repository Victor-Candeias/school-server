import type { StudentCalendarDay } from '../types'
import { CALENDAR_WEEKDAYS, CALENDAR_WORK_WEEKDAY_COUNT } from './constants'

export function getCalendarDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function getCalendarDateTime(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function isSameCalendarDay(leftDate: Date, rightDate: Date) {
  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  )
}

export function getMondayFirstWeekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7
}

export function isCalendarWeekend(date: Date) {
  return getMondayFirstWeekdayIndex(date) >= CALENDAR_WORK_WEEKDAY_COUNT
}

export function getDefaultStudentCalendarWeekMode() {
  return isCalendarWeekend(new Date()) ? 'full' : 'work'
}

export function getFirstVisibleMonthDay(year: number, month: number, showFullWeek: boolean) {
  const date = new Date(year, month, 1)

  while (!showFullWeek && getMondayFirstWeekdayIndex(date) >= CALENDAR_WORK_WEEKDAY_COUNT) {
    date.setDate(date.getDate() + 1)
  }

  return date
}

export function getLastVisibleMonthDay(year: number, month: number, showFullWeek: boolean) {
  const date = new Date(year, month + 1, 0)

  while (!showFullWeek && getMondayFirstWeekdayIndex(date) >= CALENDAR_WORK_WEEKDAY_COUNT) {
    date.setDate(date.getDate() - 1)
  }

  return date
}

export function getStudentCalendarDays(calendarDate: Date, showFullWeek: boolean): StudentCalendarDay[] {
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const visibleWeekdayCount = showFullWeek ? CALENDAR_WEEKDAYS.length : CALENDAR_WORK_WEEKDAY_COUNT
  const firstVisibleMonthDay = getFirstVisibleMonthDay(year, month, showFullWeek)
  const lastVisibleMonthDay = getLastVisibleMonthDay(year, month, showFullWeek)
  const startOffset = getMondayFirstWeekdayIndex(firstVisibleMonthDay)
  const endOffset = visibleWeekdayCount - 1 - getMondayFirstWeekdayIndex(lastVisibleMonthDay)
  const firstGridDay = new Date(year, month, firstVisibleMonthDay.getDate() - startOffset)
  const lastGridDay = new Date(year, month, lastVisibleMonthDay.getDate() + endOffset)
  const today = new Date()
  const calendarDays: StudentCalendarDay[] = []

  for (
    let weekStart = new Date(firstGridDay);
    weekStart <= lastGridDay;
    weekStart.setDate(weekStart.getDate() + 7)
  ) {
    for (let weekdayIndex = 0; weekdayIndex < visibleWeekdayCount; weekdayIndex += 1) {
      const date = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate() + weekdayIndex,
      )

      calendarDays.push({
        date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isWeekend: isCalendarWeekend(date),
        isToday: isSameCalendarDay(date, today),
        key: getCalendarDateKey(date),
      })
    }
  }

  return calendarDays
}

export function getStudentCalendarMonthLabel(calendarDate: Date) {
  return new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(calendarDate)
}

export function getStudentCalendarDayLabel(calendarDate: Date) {
  return new Intl.DateTimeFormat('pt-PT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(calendarDate)
}

export function getCalendarTimeMinutes(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value)
  if (!match) {
    return null
  }

  return Number(match[1]) * 60 + Number(match[2])
}

export function doCalendarTimesOverlap(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
) {
  const firstStartMinutes = getCalendarTimeMinutes(firstStart)
  const firstEndMinutes = getCalendarTimeMinutes(firstEnd)
  const secondStartMinutes = getCalendarTimeMinutes(secondStart)
  const secondEndMinutes = getCalendarTimeMinutes(secondEnd)

  if (
    firstStartMinutes === null ||
    firstEndMinutes === null ||
    secondStartMinutes === null ||
    secondEndMinutes === null
  ) {
    return false
  }

  return firstStartMinutes < secondEndMinutes && secondStartMinutes < firstEndMinutes
}

export function formatCalendarTimeFromMinutes(value: number) {
  const clampedValue = Math.min(Math.max(value, 0), 23 * 60 + 59)
  const hours = Math.floor(clampedValue / 60)
  const minutes = clampedValue % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}
