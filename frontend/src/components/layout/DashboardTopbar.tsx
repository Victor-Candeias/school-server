import { useState } from 'react'

type DashboardSection = 'schools' | 'years' | 'classes' | 'students' | 'settings'

type DashboardTopbarProps = {
  activeDashboard: DashboardSection
  canReturnToSchools: boolean
  canReturnToYears: boolean
  canReturnToClasses: boolean
  userRole: string
  userEmail: string
  darkMode: boolean
  isLoggingOut: boolean
  onSchoolsClick: () => void
  onYearsClick: () => void
  onClassesClick: () => void
  onSettingsClick: () => void
  onThemeToggle: () => void
  onLogout: () => void
}

export function DashboardTopbar({
  activeDashboard,
  canReturnToSchools,
  canReturnToYears,
  canReturnToClasses,
  userRole,
  userEmail,
  darkMode,
  isLoggingOut,
  onSchoolsClick,
  onYearsClick,
  onClassesClick,
  onSettingsClick,
  onThemeToggle,
  onLogout,
}: DashboardTopbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  function runMenuAction(action: () => void) {
    setIsMobileMenuOpen(false)
    action()
  }

  return (
    <header className={`topbar${isMobileMenuOpen ? ' mobile-menu-open' : ''}`}>
      <span className="topbar-brand">
        <span className="topbar-brand-full">School Management</span>
        <span className="topbar-brand-short" aria-hidden="true">School</span>
      </span>
      <div className="topbar-mobile-actions">
        <button
          type="button"
          className="topbar-mobile-theme"
          onClick={onThemeToggle}
          aria-label={darkMode ? 'Mudar para light mode' : 'Mudar para dark mode'}
          aria-pressed={darkMode}
        >
          {darkMode ? '☀ Light' : '☾ Dark'}
        </button>
        <button
          type="button"
          className="topbar-mobile-logout"
          onClick={() => runMenuAction(onLogout)}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'A sair...' : 'Logout'}
        </button>
        <button
          type="button"
          className="topbar-menu-toggle"
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="topbar-mobile-menu"
          aria-label={isMobileMenuOpen ? 'Fechar menu principal' : 'Abrir menu principal'}
        >
          <span className="topbar-menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
      <div id="topbar-mobile-menu" className="topbar-menu">
        <nav className="topbar-nav" aria-label="Navegação principal">
          <button
            type="button"
            className={[
              'topbar-nav-btn',
              activeDashboard === 'schools' ? 'current' : '',
              canReturnToSchools ? 'active' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => runMenuAction(onSchoolsClick)}
            disabled={!canReturnToSchools}
            aria-current={activeDashboard === 'schools' ? 'page' : undefined}
          >
            Escolas
          </button>
          <button
            type="button"
            className={[
              'topbar-nav-btn',
              activeDashboard === 'years' ? 'current' : '',
              canReturnToYears ? 'active' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => runMenuAction(onYearsClick)}
            disabled={!canReturnToYears}
            aria-current={activeDashboard === 'years' ? 'page' : undefined}
          >
            Anos Letivos
          </button>
          <button
            type="button"
            className={[
              'topbar-nav-btn',
              activeDashboard === 'classes' ? 'current' : '',
              canReturnToClasses ? 'active' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => runMenuAction(onClassesClick)}
            disabled={!canReturnToClasses}
            aria-current={activeDashboard === 'classes' ? 'page' : undefined}
          >
            Turmas
          </button>
          <button
            type="button"
            className={`topbar-nav-btn${activeDashboard === 'students' ? ' current' : ''}`}
            disabled
            aria-current={activeDashboard === 'students' ? 'page' : undefined}
          >
            Alunos
          </button>
        </nav>
        <div className="topbar-actions">
          <strong className="topbar-user-role">{userRole}</strong>
          <span className="topbar-user-email">{userEmail}</span>
          <button
            type="button"
            className="topbar-theme-toggle topbar-desktop-action"
            onClick={() => runMenuAction(onThemeToggle)}
            aria-label={darkMode ? 'Mudar para light mode' : 'Mudar para dark mode'}
            aria-pressed={darkMode}
            title={darkMode ? 'Mudar para light mode' : 'Mudar para dark mode'}
          >
            {darkMode ? '☀ Light mode' : '☾ Dark mode'}
          </button>
          <button
            type="button"
            className={`topbar-action-btn topbar-settings${activeDashboard === 'settings' ? ' active' : ''}`}
            onClick={() => runMenuAction(onSettingsClick)}
            aria-current={activeDashboard === 'settings' ? 'page' : undefined}
          >
            <span className="topbar-settings-label-full">Configurações</span>
            <span className="topbar-settings-label-short" aria-hidden="true">Config.</span>
          </button>
          <button
            type="button"
            className="topbar-action-btn topbar-logout topbar-desktop-action"
            onClick={() => runMenuAction(onLogout)}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'A terminar...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  )
}
