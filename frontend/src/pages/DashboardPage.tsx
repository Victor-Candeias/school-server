import { lazy, Suspense } from 'react'
import { AuthPage } from './AuthPage'
import { SchoolsSection } from './sections/SchoolsSection'
import { DashboardTopbar } from '../components/layout/DashboardTopbar'
import { SectionLoader } from '../components/feedback/SectionLoader'
import type { SchoolApplicationModel } from '../hooks/useSchoolApplication'

const SettingsSection = lazy(() =>
  import('./sections/SettingsSection').then((module) => ({ default: module.SettingsSection })),
)
const AcademicYearsSection = lazy(() =>
  import('./sections/AcademicYearsSection').then((module) => ({ default: module.AcademicYearsSection })),
)
const ClassesSection = lazy(() =>
  import('./sections/ClassesSection').then((module) => ({ default: module.ClassesSection })),
)
const StudentsSection = lazy(() =>
  import('./sections/StudentsSection').then((module) => ({ default: module.StudentsSection })),
)

const SchoolModal = lazy(() =>
  import('../components/modals/SchoolModal').then((module) => ({ default: module.SchoolModal })),
)
const AcademicYearModal = lazy(() =>
  import('../components/modals/AcademicYearModal').then((module) => ({ default: module.AcademicYearModal })),
)
const ClassModal = lazy(() =>
  import('../components/modals/ClassModal').then((module) => ({ default: module.ClassModal })),
)
const StudentModal = lazy(() =>
  import('../components/modals/StudentModal').then((module) => ({ default: module.StudentModal })),
)
const EvaluationMomentModal = lazy(() =>
  import('../components/modals/EvaluationMomentModal').then((module) => ({ default: module.EvaluationMomentModal })),
)
const EvaluationQuestionModal = lazy(() =>
  import('../components/modals/EvaluationQuestionModal').then((module) => ({ default: module.EvaluationQuestionModal })),
)
const CalendarTaskModal = lazy(() =>
  import('../components/modals/CalendarTaskModal').then((module) => ({ default: module.CalendarTaskModal })),
)
const SettingsConfirmationModal = lazy(() =>
  import('../components/modals/SettingsConfirmationModal').then((module) => ({ default: module.SettingsConfirmationModal })),
)

type DashboardPageProps = {
  model: SchoolApplicationModel
}

export function DashboardPage({ model }: DashboardPageProps) {
  const {
    user,
    darkMode,
    setDarkMode,
    activeDashboard,
    canReturnToSchools,
    canReturnToYears,
    canReturnToClasses,
    email,
    isLoading,
    returnToSchoolsDashboard,
    returnToYearsDashboard,
    returnToClassesDashboard,
    openSettingsDashboardWithAssessmentGuard,
    handleLogout,
    getDashboardTitle,
    getDashboardDescription,
    selectedSchool,
    selectedAcademicYearDocument,
    selectedClass,
    schoolsError,
    setSchoolsError,
    isCreateSchoolModalOpen,
    yearsError,
    setYearsError,
    isCreateYearModalOpen,
    classesError,
    setClassesError,
    isStudentModalOpen,
    isEvaluationMomentModalOpen,
    isCalendarTaskModalOpen,
    isSettingsConfirmationOpen,
    message,
    isLoadingYears,
    isLoadingClasses,
    isCreateClassModalOpen,
    isEvaluationQuestionModalOpen,
    selectedStudentCalendarDay,
  } = model
  const dashboardError = schoolsError ?? yearsError ?? classesError

  function clearDashboardError() {
    setSchoolsError(null)
    setYearsError(null)
    setClassesError(null)
  }

  return (
    <main className={user ? 'app-shell dashboard-page' : 'app-shell auth-page'}>
      {user ? (
        <section className="dashboard-shell" aria-labelledby="dashboard-title">
          <DashboardTopbar
            activeDashboard={activeDashboard}
            canReturnToSchools={canReturnToSchools}
            canReturnToYears={canReturnToYears}
            canReturnToClasses={canReturnToClasses}
            userRole={user.role}
            userEmail={user.email ?? email}
            darkMode={darkMode}
            isLoggingOut={isLoading}
            onSchoolsClick={returnToSchoolsDashboard}
            onYearsClick={returnToYearsDashboard}
            onClassesClick={returnToClassesDashboard}
            onSettingsClick={openSettingsDashboardWithAssessmentGuard}
            onThemeToggle={() => setDarkMode((currentMode) => !currentMode)}
            onLogout={handleLogout}
          />
          <section className="dashboard-content">
            <header className="dashboard-header">
              {activeDashboard !== 'settings' && <h1 id="dashboard-title">{getDashboardTitle()}</h1>}
              {getDashboardDescription() && <p>{getDashboardDescription()}</p>}
            </header>

            <Suspense fallback={<SectionLoader label="A carregar secção..." />}>
              {activeDashboard === 'settings' ? <SettingsSection /> : activeDashboard === 'schools' ? <SchoolsSection model={model} /> : activeDashboard === 'years' && selectedSchool ? <AcademicYearsSection model={model} /> : activeDashboard === 'years' ? (
                <section className="dashboard-empty-state">
                  <h2>Seleciona uma escola</h2>
                  <p>Vai a <strong>Escolas</strong> e abre uma escola para ver os seus anos letivos.</p>
                </section>
              ) : activeDashboard === 'classes' && selectedAcademicYearDocument ? <ClassesSection model={model} /> : activeDashboard === 'classes' ? (
                <section className="dashboard-empty-state">
                  <h2>Seleciona um ano letivo</h2>
                  <p>Vai a <strong>Anos Letivos</strong> e abre um ano letivo para ver as suas turmas.</p>
                </section>
              ) : activeDashboard === 'students' && selectedClass ? <StudentsSection model={model} /> : activeDashboard === 'students' ? (
                <section className="dashboard-empty-state">
                  <h2>Seleciona uma turma</h2>
                  <p>Vai a <strong>Turmas</strong> e abre uma turma para ver os seus alunos.</p>
                </section>
              ) : (
                <section className="dashboard-empty-state">
                  <h2>Área em construção</h2>
                  <p>Seleciona Escolas para voltar ao dashboard das escolas.</p>
                </section>
              )}
            </Suspense>

            {message && <p className="dashboard-feedback success">{message}</p>}
            {isLoadingYears && <p className="dashboard-feedback info">A carregar anos letivos...</p>}
            {isLoadingClasses && <p className="dashboard-feedback info">A guardar turma...</p>}

            {dashboardError && (
              <div className="modal-backdrop dashboard-error-backdrop" role="presentation">
                <section
                  className="modal-card small-modal-card dashboard-error-card"
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="dashboard-error-title"
                  aria-describedby="dashboard-error-description"
                >
                  <h2 id="dashboard-error-title">Erro ao gravar dados</h2>
                  <p id="dashboard-error-description">{dashboardError}</p>
                  <button type="button" onClick={clearDashboardError}>OK</button>
                </section>
              </div>
            )}

            <Suspense fallback={<SectionLoader label="A carregar formulário..." />}>
              {isCreateSchoolModalOpen && (
                <SchoolModal model={model} />
              )}

              {isCreateYearModalOpen && (
                <AcademicYearModal model={model} />
              )}

              {isCreateClassModalOpen && (
                <ClassModal model={model} />
              )}

              {isEvaluationMomentModalOpen && (
                <EvaluationMomentModal model={model} />
              )}

              {isEvaluationQuestionModalOpen && (
                <EvaluationQuestionModal model={model} />
              )}

              {isCalendarTaskModalOpen && selectedStudentCalendarDay && (
                <CalendarTaskModal model={model} />
              )}

              {isStudentModalOpen && (
                <StudentModal model={model} />
              )}

              {isSettingsConfirmationOpen && (
                <SettingsConfirmationModal model={model} />
              )}
            </Suspense>
          </section>
        </section>
      ) : (
        <AuthPage />
      )}
    </main>
  )
}
