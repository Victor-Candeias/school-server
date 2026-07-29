import { authApi } from '../api/auth'
import type { FormEvent } from 'react'
import { DEFAULT_REGISTER_ROLE } from '../utils/constants'
import { saveNavigationState } from '../utils/navigationPersistence'
import type { ApplicationActions, ApplicationRuntime } from './applicationRuntime'

export function useAuth(
  runtime: ApplicationRuntime,
): Pick<ApplicationActions, 'getLoggedUserId' | 'handleLogin' | 'handleRegister' | 'switchAuthMode' | 'handleLogout' | 'persistCurrentNavigation'> {
function getLoggedUserId() {
    if (!runtime.user?.userId) {
      throw new Error('Não foi possível identificar o utilizador autenticado.')
    }

    return runtime.user.userId
  }

async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    runtime.setIsLoading(true)
    runtime.setError(null)
    runtime.setMessage(null)

    try {
      const loggedUser = await authApi.login({ email: runtime.email, password: runtime.password })
      runtime.setUser(loggedUser)
      runtime.setSelectedSchool(null)
      runtime.setAcademicYears([])
      runtime.setAllAcademicYears([])
      runtime.setAllClasses([])
      runtime.setAllStudents([])
      runtime.setStudentCalendarTasks([])
      runtime.setSelectedAcademicYearDocument(null)
      runtime.setSelectedClass(null)
      runtime.setActiveDashboard('schools')
      runtime.setMessage(loggedUser.message)
    } catch (loginError) {
      runtime.setUser(null)
      runtime.setError(loginError instanceof Error ? loginError.message : 'Erro ao iniciar sessão.')
    } finally {
      runtime.setIsLoading(false)
    }
  }

async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    runtime.setError(null)
    runtime.setMessage(null)

    if (runtime.password !== runtime.confirmPassword) {
      runtime.setError('As passwords não coincidem.')
      return
    }

    runtime.setIsLoading(true)

    try {
      const registerResponse = await authApi.register({
        name: runtime.name,
        email: runtime.email,
        password: runtime.password,
        role: DEFAULT_REGISTER_ROLE,
      })
      runtime.setMessage(registerResponse.message)
      runtime.setAuthMode('login')
      runtime.setName('')
      runtime.setPassword('')
      runtime.setConfirmPassword('')
    } catch (registerError) {
      runtime.setError(registerError instanceof Error ? registerError.message : 'Erro ao criar utilizador.')
    } finally {
      runtime.setIsLoading(false)
    }
  }

function switchAuthMode(nextMode: 'login' | 'register') {
    runtime.setAuthMode(nextMode)
    runtime.setError(null)
    runtime.setMessage(null)
    runtime.setPassword('')
    runtime.setConfirmPassword('')
  }

async function handleLogout() {
    persistCurrentNavigation()
    runtime.setIsLoading(true)
    runtime.setError(null)
    runtime.setMessage(null)

    try {
      const logoutResponse = await authApi.logout()
      runtime.setUser(null)
      runtime.setPassword('')
      runtime.setSelectedSchool(null)
      runtime.setAcademicYears([])
      runtime.setAllAcademicYears([])
      runtime.setAllClasses([])
      runtime.setAllStudents([])
      runtime.setStudentCalendarTasks([])
      runtime.setSelectedAcademicYearDocument(null)
      runtime.setSelectedClass(null)
      runtime.setActiveDashboard('schools')
      runtime.setMessage(logoutResponse.message)
    } catch (logoutError) {
      runtime.setError(logoutError instanceof Error ? logoutError.message : 'Erro ao terminar sessão.')
    } finally {
      runtime.setIsLoading(false)
    }
  }

function persistCurrentNavigation() {
    if (!runtime.user?.userId) {
      return
    }

    saveNavigationState(runtime.user.userId, {
      activeDashboard: runtime.activeDashboard,
      activeStudentsMenuOption: runtime.activeStudentsMenuOption,
      schoolId: runtime.selectedSchool ? runtime.getDocumentId(runtime.selectedSchool) : null,
      academicYearId: runtime.selectedAcademicYearDocument
        ? runtime.getDocumentId(runtime.selectedAcademicYearDocument)
        : null,
      classId: runtime.selectedClass ? runtime.getDocumentId(runtime.selectedClass) : null,
    })
  }

  return {
    getLoggedUserId,
    handleLogin,
    handleRegister,
    switchAuthMode,
    handleLogout,
    persistCurrentNavigation,
  }
}
