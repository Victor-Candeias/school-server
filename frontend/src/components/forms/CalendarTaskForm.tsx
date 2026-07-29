import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'

type CalendarTaskFormProps = {
  model: SchoolApplicationModel
}

export function CalendarTaskForm({ model }: CalendarTaskFormProps) {
  const {
    handleSaveStudentCalendarTask,
    getStudentCalendarDayLabel,
    selectedStudentCalendarDay,
    newStudentCalendarTask,
    updateStudentCalendarTaskField,
    isLoadingClasses,
  } = model

  if (!selectedStudentCalendarDay) return null

  return (
    <form onSubmit={handleSaveStudentCalendarTask}>
                      <label>
                        Dia
                        <input
                          type="text"
                          value={getStudentCalendarDayLabel(selectedStudentCalendarDay.date)}
                          readOnly
                        />
                      </label>
                      <label>
                        Título
                        <input
                          type="text"
                          value={newStudentCalendarTask.title}
                          onChange={(event) => updateStudentCalendarTaskField('title', event.target.value)}
                          placeholder="Ex: Entrega de trabalho"
                          autoFocus
                          required
                        />
                      </label>
                      <label>
                        Descrição
                        <textarea
                          value={newStudentCalendarTask.description}
                          onChange={(event) => updateStudentCalendarTaskField('description', event.target.value)}
                          placeholder="Detalhes da tarefa"
                          required
                        />
                      </label>
                      <div className="form-row">
                        <label>
                          Hora de início
                          <input
                            type="time"
                            value={newStudentCalendarTask.startTime}
                            onChange={(event) => updateStudentCalendarTaskField('startTime', event.target.value)}
                            required
                          />
                        </label>
                        <label>
                          Hora de fim
                          <input
                            type="time"
                            value={newStudentCalendarTask.endTime}
                            onChange={(event) => updateStudentCalendarTaskField('endTime', event.target.value)}
                            required
                          />
                        </label>
                      </div>
                      <button type="submit" disabled={isLoadingClasses}>
                        {isLoadingClasses ? 'A guardar...' : 'Gravar'}
                      </button>
                    </form>
  )
}
