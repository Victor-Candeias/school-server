import { lazy, Suspense } from 'react'
import type { SchoolApplicationModel } from '../../hooks/useSchoolApplication'
import { SectionLoader } from '../../components/feedback/SectionLoader'

const StudentCalendar = lazy(() =>
  import('./StudentCalendar').then((module) => ({ default: module.StudentCalendar })),
)
const EvaluationMoments = lazy(() =>
  import('./EvaluationMoments').then((module) => ({ default: module.EvaluationMoments })),
)
const StudentAssessment = lazy(() =>
  import('./StudentAssessment').then((module) => ({ default: module.StudentAssessment })),
)
const SemesterAssessments = lazy(() =>
  import('./SemesterAssessments').then((module) => ({ default: module.SemesterAssessments })),
)
const StudentCharts = lazy(() =>
  import('./StudentCharts').then((module) => ({ default: module.StudentCharts })),
)
const StudentsList = lazy(() =>
  import('./StudentsList').then((module) => ({ default: module.StudentsList })),
)

type StudentsSectionProps = {
  model: SchoolApplicationModel
}

export function StudentsSection({ model }: StudentsSectionProps) {
  const {
    STUDENTS_MENU_OPTIONS,
    activeStudentsMenuOption,
    handleStudentsMenuOptionChange,
  } = model

  return (
    (
              <section className="students-dashboard" aria-label="Dashboard dos alunos">
                <nav className="students-sidebar" aria-label="Menu de alunos">
                  <span className="students-sidebar-title">Menu da turma</span>
                  {STUDENTS_MENU_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={activeStudentsMenuOption === option.id ? 'active' : ''}
                      onClick={() => handleStudentsMenuOptionChange(option.id)}
                      aria-current={activeStudentsMenuOption === option.id ? 'page' : undefined}
                    >
                      {option.label}
                    </button>
                  ))}
                </nav>
                <Suspense fallback={<SectionLoader label="A carregar área de alunos..." />}>
                  {activeStudentsMenuOption === 0 ? <StudentCalendar model={model} /> : activeStudentsMenuOption === 2 ? <EvaluationMoments model={model} /> : activeStudentsMenuOption === 3 ? <StudentAssessment model={model} /> : activeStudentsMenuOption === 4 ? <SemesterAssessments model={model} /> : activeStudentsMenuOption === 5 ? <StudentCharts model={model} /> : <StudentsList model={model} />}
                </Suspense>
              </section>
            )
  )
}
