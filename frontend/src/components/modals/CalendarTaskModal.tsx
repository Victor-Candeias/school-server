import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import { CalendarTaskForm } from '../forms/CalendarTaskForm'

type CalendarTaskModalProps = {
  model: SchoolApplicationModel
}

export function CalendarTaskModal({ model }: CalendarTaskModalProps) {
  const {
    closeStudentCalendarTaskModal,
    classesError,
    selectedStudentCalendarTasks,
    getStudentCalendarDayLabel,
    selectedStudentCalendarDay,
    getStudentCalendarTaskTitle,
    getStudentCalendarTaskStartTime,
    getStudentCalendarTaskEndTime,
    getStringValue,
    isCreatingCalendarTask,
    openNewStudentCalendarTaskForm,
  } = model

  if (!selectedStudentCalendarDay) return null

  return (
    <div className="modal-backdrop student-modal-backdrop" role="presentation">
                <section className="modal-card calendar-task-modal-card" aria-labelledby="calendar-task-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={closeStudentCalendarTaskModal}
                  >
                    ×
                  </button>
                  <h2 id="calendar-task-title">Tarefas do calendário</h2>
                  {classesError && <p className="modal-feedback error">{classesError}</p>}
                  {selectedStudentCalendarTasks.length > 0 && (
                    <section className="calendar-task-summary" aria-label="Tarefas existentes">
                      <h3>{getStudentCalendarDayLabel(selectedStudentCalendarDay.date)}</h3>
                      <div className="calendar-task-summary-list">
                        {selectedStudentCalendarTasks.map((task, taskIndex) => (
                          <article
                            className="calendar-task-summary-card"
                            key={String(task._id ?? `task-${taskIndex}`)}
                          >
                            <strong>{getStudentCalendarTaskTitle(task)}</strong>
                            <span>
                              {getStudentCalendarTaskStartTime(task)} - {getStudentCalendarTaskEndTime(task)}
                            </span>
                            <p>{getStringValue(task.description)}</p>
                          </article>
                        ))}
                      </div>
                      {!isCreatingCalendarTask && (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={openNewStudentCalendarTaskForm}
                        >
                          Nova tarefa
                        </button>
                      )}
                    </section>
                  )}
                  {isCreatingCalendarTask && (
                    <CalendarTaskForm model={model} />
                  )}
                </section>
              </div>
  )
}
