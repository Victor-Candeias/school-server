import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'


type StudentCalendarProps = {
  model: SchoolApplicationModel
}

export function StudentCalendar({ model }: StudentCalendarProps) {
  const {
    getStudentCalendarMonthLabel,
    studentCalendarDate,
    isStudentCalendarFullWeek,
    toggleStudentCalendarWeekMode,
    moveStudentCalendarMonth,
    resetStudentCalendarMonth,
    visibleStudentCalendarWeekdays,
    CALENDAR_WORK_WEEKDAY_COUNT,
    studentCalendarDays,
    getStudentCalendarTasksForDate,
    getStudentCalendarDayLabel,
    openStudentCalendarTaskModal,
    getCalendarDateTime,
    getStudentCalendarTaskTitle,
  } = model

  return (
    (
                  <section className="students-panel" aria-label="Calendário mensal">
                    <div className="student-calendar-heading">
                      <div>
                        <h2>Calendário</h2>
                        <p>{getStudentCalendarMonthLabel(studentCalendarDate)}</p>
                      </div>
                      <div className="student-calendar-actions" aria-label="Navegação do calendário">
                        <button
                          type="button"
                          className="student-calendar-week-toggle"
                          aria-pressed={isStudentCalendarFullWeek}
                          aria-label={
                            isStudentCalendarFullWeek
                              ? 'Mostrar apenas dias úteis'
                              : 'Mostrar semana toda'
                          }
                          onClick={toggleStudentCalendarWeekMode}
                        >
                          {isStudentCalendarFullWeek ? 'Semana toda' : 'Semana de trabalho'}
                        </button>
                        <button
                          type="button"
                          aria-label="Mês anterior"
                          onClick={() => moveStudentCalendarMonth(-1)}
                        >
                          ‹
                        </button>
                        <button type="button" onClick={resetStudentCalendarMonth}>
                          Hoje
                        </button>
                        <button
                          type="button"
                          aria-label="Mês seguinte"
                          onClick={() => moveStudentCalendarMonth(1)}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                    <div
                      className={[
                        'student-calendar',
                        isStudentCalendarFullWeek ? 'full-week' : 'work-week',
                      ].join(' ')}
                      role="table"
                      aria-label={
                        isStudentCalendarFullWeek
                          ? 'Calendário mensal com semana toda'
                          : 'Calendário mensal com semana de trabalho'
                      }
                    >
                      <div className="student-calendar-weekdays" role="row">
                        {visibleStudentCalendarWeekdays.map((weekday, weekdayIndex) => (
                          <span
                            key={weekday}
                            className={weekdayIndex >= CALENDAR_WORK_WEEKDAY_COUNT ? 'weekend' : ''}
                            role="columnheader"
                          >
                            {weekday}
                          </span>
                        ))}
                      </div>
                      <div className="student-calendar-grid">
                        {studentCalendarDays.map((calendarDay) => {
                          const calendarTasks = getStudentCalendarTasksForDate(calendarDay.date)

                          return (
                            <button
                              key={calendarDay.key}
                              type="button"
                              className={[
                                'student-calendar-day',
                                calendarDay.isCurrentMonth ? '' : 'outside-month',
                                calendarDay.isWeekend ? 'weekend' : '',
                                calendarDay.isToday ? 'today' : '',
                                calendarTasks.length > 0 ? 'has-tasks' : '',
                              ].filter(Boolean).join(' ')}
                              aria-label={[
                                `Abrir tarefas de ${getStudentCalendarDayLabel(calendarDay.date)}`,
                                calendarTasks.length === 0
                                  ? 'sem tarefas'
                                  : `${calendarTasks.length} ${calendarTasks.length === 1 ? 'tarefa' : 'tarefas'}`,
                              ].join(', ')}
                              onClick={() => openStudentCalendarTaskModal(calendarDay)}
                            >
                              <time
                                className="student-calendar-day-number"
                                dateTime={getCalendarDateTime(calendarDay.date)}
                              >
                                {calendarDay.day}
                              </time>
                              {calendarTasks.length > 0 && (
                                <>
                                  <span className="student-calendar-task-count" aria-hidden="true">
                                    {calendarTasks.length}
                                  </span>
                                  <span className="student-calendar-task-list">
                                    {calendarTasks.map((task, taskIndex) => (
                                      <span
                                        className="student-calendar-task-title"
                                        key={String(task._id ?? `${calendarDay.key}-${taskIndex}`)}
                                      >
                                        {getStudentCalendarTaskTitle(task)}
                                      </span>
                                    ))}
                                  </span>
                                </>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </section>
                )
  )
}
