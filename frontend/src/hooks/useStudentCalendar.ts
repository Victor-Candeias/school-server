import { schoolApi } from '../api/school'
import type { FormEvent } from 'react'
import type { SchoolDocument } from '../api/school'
import type { StudentCalendarDay } from '../types'
import type { StudentCalendarTaskForm } from '../types'
import { EMPTY_STUDENT_CALENDAR_TASK_FORM } from '../utils/constants'
import { doCalendarTimesOverlap } from '../utils/calendar'
import { formatCalendarTimeFromMinutes } from '../utils/calendar'
import { getCalendarDateTime } from '../utils/calendar'
import { getCalendarTimeMinutes } from '../utils/calendar'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'

export function useStudentCalendar(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'loadStudentCalendarTasks' | 'getStudentCalendarTaskDate' | 'getStudentCalendarTaskStartTime' | 'getStudentCalendarTaskEndTime' | 'getStudentCalendarTaskTitle' | 'sortStudentCalendarTasks' | 'getStudentCalendarTasksForDate' | 'getNextStudentCalendarTaskForm' | 'hasCalendarTaskTimeConflict' | 'openStudentCalendarTaskModal' | 'closeStudentCalendarTaskModal' | 'openNewStudentCalendarTaskForm' | 'updateStudentCalendarTaskField' | 'handleSaveStudentCalendarTask' | 'moveStudentCalendarMonth' | 'resetStudentCalendarMonth' | 'toggleStudentCalendarWeekMode'> {
async function loadStudentCalendarTasks(schoolClass = runtime.selectedClass) {
    if (!runtime.selectedSchool || !runtime.selectedAcademicYearDocument || !schoolClass) {
      runtime.setStudentCalendarTasks([])
      return
    }

    const schoolId = runtime.getSchoolId(runtime.selectedSchool)
    const yearId = runtime.getDocumentId(runtime.selectedAcademicYearDocument)
    const classId = runtime.getDocumentId(schoolClass)

    if (!schoolId || !yearId || !classId) {
      runtime.setStudentCalendarTasks([])
      runtime.setClassesError('Não foi possível identificar a turma para carregar o calendário.')
      return
    }

    try {
      const existingTasks = await schoolApi.findStudentCalendarTasks({
        userId: runtime.getLoggedUserId(),
        schoolId,
        yearId,
        classId,
      })
      runtime.setStudentCalendarTasks(sortStudentCalendarTasks(existingTasks))
    } catch (calendarError) {
      const errorMessage =
        calendarError instanceof Error ? calendarError.message : 'Erro ao carregar tarefas do calendário.'

      runtime.setStudentCalendarTasks([])
      if (!errorMessage.includes('HTTP 400')) {
        runtime.setClassesError(errorMessage)
      }
    }
  }

function getStudentCalendarTaskDate(task: SchoolDocument) {
    return runtime.getStringValue(task.date)
  }

function getStudentCalendarTaskStartTime(task: SchoolDocument) {
    return runtime.getStringValue(task.startTime)
  }

function getStudentCalendarTaskEndTime(task: SchoolDocument) {
    return runtime.getStringValue(task.endTime)
  }

function getStudentCalendarTaskTitle(task: SchoolDocument) {
    return runtime.getStringValue(task.title) || 'Tarefa sem título'
  }

function sortStudentCalendarTasks(tasks: SchoolDocument[]) {
    return [...tasks].sort((leftTask, rightTask) => {
      const leftDate = getStudentCalendarTaskDate(leftTask)
      const rightDate = getStudentCalendarTaskDate(rightTask)

      if (leftDate !== rightDate) {
        return leftDate.localeCompare(rightDate)
      }

      return getStudentCalendarTaskStartTime(leftTask).localeCompare(
        getStudentCalendarTaskStartTime(rightTask),
      )
    })
  }

function getStudentCalendarTasksForDate(date: Date) {
    const dateKey = getCalendarDateTime(date)

    return runtime.studentCalendarTasks.filter((task) => getStudentCalendarTaskDate(task) === dateKey)
  }

function getNextStudentCalendarTaskForm(tasks: SchoolDocument[]): StudentCalendarTaskForm {
    const sortedIntervals = tasks
      .map((task) => {
        const startMinutes = getCalendarTimeMinutes(getStudentCalendarTaskStartTime(task))
        const endMinutes = getCalendarTimeMinutes(getStudentCalendarTaskEndTime(task))

        return startMinutes === null || endMinutes === null ? null : { startMinutes, endMinutes }
      })
      .filter((interval): interval is { startMinutes: number; endMinutes: number } => (
        interval !== null
      ))
      .sort((leftInterval, rightInterval) => leftInterval.startMinutes - rightInterval.startMinutes)
    let nextStart = 8 * 60

    for (const interval of sortedIntervals) {
      if (nextStart + 60 <= interval.startMinutes) {
        break
      }

      nextStart = Math.max(nextStart, interval.endMinutes)
    }

    if (nextStart + 60 > 23 * 60 + 59) {
      nextStart = 8 * 60
    }

    return {
      ...EMPTY_STUDENT_CALENDAR_TASK_FORM,
      startTime: formatCalendarTimeFromMinutes(nextStart),
      endTime: formatCalendarTimeFromMinutes(nextStart + 60),
    }
  }

function hasCalendarTaskTimeConflict(
    tasks: SchoolDocument[],
    startTime: string,
    endTime: string,
  ) {
    return tasks.some((task) =>
      doCalendarTimesOverlap(
        startTime,
        endTime,
        getStudentCalendarTaskStartTime(task),
        getStudentCalendarTaskEndTime(task),
      ),
    )
  }

function openStudentCalendarTaskModal(calendarDay: StudentCalendarDay) {
    const tasks = getStudentCalendarTasksForDate(calendarDay.date)

    runtime.setSelectedStudentCalendarDay(calendarDay)
    runtime.setNewStudentCalendarTask(getNextStudentCalendarTaskForm(tasks))
    runtime.setIsCreatingCalendarTask(tasks.length === 0)
    runtime.setClassesError(null)
    runtime.setIsCalendarTaskModalOpen(true)
  }

function closeStudentCalendarTaskModal() {
    runtime.setIsCalendarTaskModalOpen(false)
    runtime.setIsCreatingCalendarTask(false)
    runtime.setSelectedStudentCalendarDay(null)
    runtime.setNewStudentCalendarTask(EMPTY_STUDENT_CALENDAR_TASK_FORM)
    runtime.setClassesError(null)
  }

function openNewStudentCalendarTaskForm() {
    runtime.setNewStudentCalendarTask(getNextStudentCalendarTaskForm(runtime.selectedStudentCalendarTasks))
    runtime.setIsCreatingCalendarTask(true)
    runtime.setClassesError(null)
  }

function updateStudentCalendarTaskField(field: keyof StudentCalendarTaskForm, value: string) {
    runtime.setNewStudentCalendarTask((currentTask) => ({
      ...currentTask,
      [field]: value,
    }))
  }

async function handleSaveStudentCalendarTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!runtime.selectedSchool || !runtime.selectedAcademicYearDocument || !runtime.selectedClass || !runtime.selectedStudentCalendarDay) {
      runtime.setClassesError('Seleciona escola, ano letivo, turma e dia antes de gravar a tarefa.')
      return
    }

    const schoolId = runtime.getSchoolId(runtime.selectedSchool)
    const yearId = runtime.getDocumentId(runtime.selectedAcademicYearDocument)
    const classId = runtime.getDocumentId(runtime.selectedClass)

    if (!schoolId || !yearId || !classId) {
      runtime.setClassesError('Não foi possível identificar todos os dados para gravar a tarefa.')
      return
    }

    const title = runtime.newStudentCalendarTask.title.trim()
    const description = runtime.newStudentCalendarTask.description.trim()
    const startTime = runtime.newStudentCalendarTask.startTime
    const endTime = runtime.newStudentCalendarTask.endTime
    const startMinutes = getCalendarTimeMinutes(startTime)
    const endMinutes = getCalendarTimeMinutes(endTime)

    if (!title || !description) {
      runtime.setClassesError('Preenche o título e a descrição da tarefa.')
      return
    }

    if (startMinutes === null || endMinutes === null) {
      runtime.setClassesError('As horas devem estar no formato HH:MM.')
      return
    }

    if (startMinutes >= endMinutes) {
      runtime.setClassesError('A hora de fim deve ser posterior à hora de início.')
      return
    }

    if (hasCalendarTaskTimeConflict(runtime.selectedStudentCalendarTasks, startTime, endTime)) {
      runtime.setClassesError('Já existe uma tarefa nesse horário.')
      return
    }

    const payload: SchoolDocument = {
      userId: runtime.getLoggedUserId(),
      schoolId,
      schoolName: runtime.getSchoolTitle(runtime.selectedSchool),
      yearId,
      academicYearId: yearId,
      academicYearName: runtime.getAcademicYearTitle(runtime.selectedAcademicYearDocument),
      classId,
      className: runtime.getClassTitle(runtime.selectedClass),
      date: getCalendarDateTime(runtime.selectedStudentCalendarDay.date),
      title,
      description,
      startTime,
      endTime,
    }

    runtime.setIsLoadingClasses(true)
    runtime.setClassesError(null)

    try {
      const savedTask = await schoolApi.addStudentCalendarTask(payload)
      const task = {
        ...payload,
        _id: savedTask.id,
      }

      runtime.setStudentCalendarTasks((currentTasks) => sortStudentCalendarTasks([...currentTasks, task]))
      runtime.setIsCreatingCalendarTask(false)
      runtime.setNewStudentCalendarTask(EMPTY_STUDENT_CALENDAR_TASK_FORM)
      runtime.setMessage('Tarefa gravada.')
    } catch (calendarTaskError) {
      runtime.setClassesError(
        calendarTaskError instanceof Error
          ? calendarTaskError.message
          : 'Erro ao gravar tarefa no calendário.',
      )
    } finally {
      runtime.setIsLoadingClasses(false)
    }
  }

function moveStudentCalendarMonth(monthOffset: number) {
    runtime.setStudentCalendarDate((currentDate) => (
      new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1)
    ))
  }

function resetStudentCalendarMonth() {
    runtime.setStudentCalendarDate(new Date())
  }

function toggleStudentCalendarWeekMode() {
    runtime.setStudentCalendarWeekMode((currentMode) => (currentMode === 'work' ? 'full' : 'work'))
  }

  return {
    loadStudentCalendarTasks,
    getStudentCalendarTaskDate,
    getStudentCalendarTaskStartTime,
    getStudentCalendarTaskEndTime,
    getStudentCalendarTaskTitle,
    sortStudentCalendarTasks,
    getStudentCalendarTasksForDate,
    getNextStudentCalendarTaskForm,
    hasCalendarTaskTimeConflict,
    openStudentCalendarTaskModal,
    closeStudentCalendarTaskModal,
    openNewStudentCalendarTaskForm,
    updateStudentCalendarTaskField,
    handleSaveStudentCalendarTask,
    moveStudentCalendarMonth,
    resetStudentCalendarMonth,
    toggleStudentCalendarWeekMode,
  }
}
