import { useEffect, useState } from 'react'
import { authApi } from './api/auth'
import { schoolApi } from './api/school'
import type { LoginResponse } from './api/auth'
import type { SchoolDocument } from './api/school'
import type { FormEvent } from 'react'
import './App.css'

const DEFAULT_INACTIVITY_LOGOUT_MINUTES = 15
const DEFAULT_REGISTER_ROLE = 'user'
const INACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const

type SchoolForm = {
  name: string
  group: string
  address: string
  postalCode: string
  locality: string
  phone1: string
  phone2: string
  phone3: string
  directorName: string
  directorContacts: string
}

type DashboardSection = 'schools' | 'years' | 'classes' | 'students' | 'settings'

type AcademicYearOption = {
  value: string
  label: string
  startYear: number
  endYear: number
}

const EMPTY_SCHOOL_FORM: SchoolForm = {
  name: '',
  group: '',
  address: '',
  postalCode: '',
  locality: '',
  phone1: '',
  phone2: '',
  phone3: '',
  directorName: '',
  directorContacts: '',
}

type PasswordStrength = {
  label: string
  level: 'empty' | 'weak' | 'medium' | 'strong'
  score: number
}

function getPasswordStrength(value: string): PasswordStrength {
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

function getAcademicYearOptions(): AcademicYearOption[] {
  const currentYear = new Date().getFullYear()

  return Array.from({ length: 6 }, (_, index) => {
    const startYear = currentYear - index
    const endYear = startYear + 1
    const label = `${startYear}/${endYear}`

    return {
      value: label,
      label,
      startYear,
      endYear,
    }
  })
}

function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [user, setUser] = useState<LoginResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [schools, setSchools] = useState<SchoolDocument[]>([])
  const [schoolsError, setSchoolsError] = useState<string | null>(null)
  const [isLoadingSchools, setIsLoadingSchools] = useState(false)
  const [academicYears, setAcademicYears] = useState<SchoolDocument[]>([])
  const [allAcademicYears, setAllAcademicYears] = useState<SchoolDocument[]>([])
  const [allClasses, setAllClasses] = useState<SchoolDocument[]>([])
  const [yearsError, setYearsError] = useState<string | null>(null)
  const [isLoadingYears, setIsLoadingYears] = useState(false)
  const [isCreateYearModalOpen, setIsCreateYearModalOpen] = useState(false)
  const [editingYearId, setEditingYearId] = useState<string | null>(null)
  const [selectedAcademicYearDocument, setSelectedAcademicYearDocument] =
    useState<SchoolDocument | null>(null)
  const academicYearOptions = getAcademicYearOptions()
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(academicYearOptions[0].value)
  const [newSchool, setNewSchool] = useState<SchoolForm>(EMPTY_SCHOOL_FORM)
  const [isCreateSchoolModalOpen, setIsCreateSchoolModalOpen] = useState(false)
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<SchoolDocument | null>(null)
  const [activeDashboard, setActiveDashboard] = useState<DashboardSection>('schools')
  const [inactiveLogoutMinutes, setInactiveLogoutMinutes] = useState(
    DEFAULT_INACTIVITY_LOGOUT_MINUTES,
  )
  const passwordStrength = getPasswordStrength(password)

  useEffect(() => {
    if (!user) {
      setSchools([])
      setAcademicYears([])
      setAllAcademicYears([])
      setAllClasses([])
      return
    }

    void loadSchools()
    void loadAllAcademicYears()
    void loadAllClasses()
    void loadAppSettings()
  }, [user])

  useEffect(() => {
    if (activeDashboard !== 'years' || !selectedSchool) {
      setAcademicYears([])
      return
    }

    void loadAcademicYears(selectedSchool)
  }, [activeDashboard, selectedSchool])

  useEffect(() => {
    if (!user) {
      return
    }

    let timeoutId = window.setTimeout(logoutByInactivity, inactiveLogoutMinutes * 60 * 1000)

    function resetTimer() {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(logoutByInactivity, inactiveLogoutMinutes * 60 * 1000)
    }

    async function logoutByInactivity() {
      try {
        await authApi.logout()
      } finally {
        setUser(null)
        setPassword('')
        setConfirmPassword('')
        setSelectedSchool(null)
        setAcademicYears([])
        setAllAcademicYears([])
        setAllClasses([])
        setSelectedAcademicYearDocument(null)
        setActiveDashboard('schools')
        setMessage('Sessão terminada por inatividade.')
      }
    }

    INACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true })
    })

    return () => {
      window.clearTimeout(timeoutId)
      INACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer)
      })
    }
  }, [inactiveLogoutMinutes, user])

  async function loadSchools() {
    setIsLoadingSchools(true)
    setSchoolsError(null)

    try {
      const existingSchools = await schoolApi.findSchools()
      setSchools(existingSchools)
    } catch (schoolError) {
      const errorMessage =
        schoolError instanceof Error ? schoolError.message : 'Erro ao carregar escolas.'

      setSchools([])
      setSchoolsError(errorMessage.includes('HTTP 400') ? null : errorMessage)
    } finally {
      setIsLoadingSchools(false)
    }
  }

  async function loadAppSettings() {
    try {
      const settings = await schoolApi.getAppSettings()
      setInactiveLogoutMinutes(settings.inactiveLogoutMinutes)
    } catch (settingsError) {
      setError(
        settingsError instanceof Error
          ? settingsError.message
          : 'Erro ao carregar configurações da aplicação.',
      )
    }
  }

  async function loadAcademicYears(school: SchoolDocument) {
    const schoolId = getSchoolId(school)
    if (!schoolId) {
      setYearsError('Não foi possível identificar a escola selecionada.')
      setAcademicYears([])
      return
    }

    setIsLoadingYears(true)
    setYearsError(null)

    try {
      const existingYears = await schoolApi.findYears({ schoolId })
      setAcademicYears(existingYears)
    } catch (yearError) {
      const errorMessage =
        yearError instanceof Error ? yearError.message : 'Erro ao carregar anos letivos.'

      setAcademicYears([])
      setYearsError(errorMessage.includes('HTTP 400') ? null : errorMessage)
    } finally {
      setIsLoadingYears(false)
    }
  }

  async function loadAllAcademicYears() {
    try {
      const existingYears = await schoolApi.findYears()
      setAllAcademicYears(existingYears)
    } catch (yearError) {
      const errorMessage =
        yearError instanceof Error ? yearError.message : 'Erro ao carregar anos letivos.'

      setAllAcademicYears([])
      if (!errorMessage.includes('HTTP 400')) {
        setYearsError(errorMessage)
      }
    }
  }

  async function loadAllClasses() {
    try {
      const existingClasses = await schoolApi.findClasses()
      setAllClasses(existingClasses)
    } catch (classError) {
      const errorMessage =
        classError instanceof Error ? classError.message : 'Erro ao carregar turmas.'

      setAllClasses([])
      if (!errorMessage.includes('HTTP 400')) {
        setYearsError(errorMessage)
      }
    }
  }

  async function handleCreateAcademicYear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedSchool) {
      setYearsError('Seleciona uma escola antes de criar o ano letivo.')
      return
    }

    const schoolId = getSchoolId(selectedSchool)
    const option = academicYearOptions.find((year) => year.value === selectedAcademicYear)

    if (!schoolId || !option) {
      setYearsError('Não foi possível criar o ano letivo.')
      return
    }

    setIsLoadingYears(true)
    setYearsError(null)

    try {
      const yearPayload = {
        schoolId,
        schoolName: getSchoolTitle(selectedSchool),
        name: option.label,
        startYear: option.startYear,
        endYear: option.endYear,
      }

      if (editingYearId) {
        const currentYear = academicYears.find((year) => getDocumentId(year) === editingYearId)
        if (currentYear && !hasAcademicYearChanged(currentYear, yearPayload)) {
          setEditingYearId(null)
          setIsCreateYearModalOpen(false)
          return
        }

        await schoolApi.updateYear(editingYearId, yearPayload)
        setSelectedAcademicYearDocument((currentYear) =>
          currentYear && getDocumentId(currentYear) === editingYearId
            ? { ...currentYear, ...yearPayload }
            : currentYear,
        )
      } else {
        await schoolApi.addYear(yearPayload)
      }

      setEditingYearId(null)
      setIsCreateYearModalOpen(false)
      await loadAcademicYears(selectedSchool)
      await loadAllAcademicYears()
    } catch (yearError) {
      setYearsError(yearError instanceof Error ? yearError.message : 'Erro ao criar ano letivo.')
    } finally {
      setIsLoadingYears(false)
    }
  }

  async function handleSaveSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoadingSchools(true)
    setSchoolsError(null)

    try {
      const schoolPayload = getSchoolPayload()

      if (editingSchoolId) {
        await schoolApi.updateSchool(editingSchoolId, schoolPayload)
        setSelectedSchool((currentSchool) =>
          currentSchool && getSchoolId(currentSchool) === editingSchoolId
            ? { ...currentSchool, ...schoolPayload }
            : currentSchool,
        )
      } else {
        await schoolApi.addSchool(schoolPayload)
      }

      resetSchoolForm()
      setIsCreateSchoolModalOpen(false)
      await loadSchools()
    } catch (schoolError) {
      setSchoolsError(
        schoolError instanceof Error ? schoolError.message : 'Erro ao criar escola.',
      )
    } finally {
      setIsLoadingSchools(false)
    }
  }

  function getSchoolPayload() {
    const phones = [newSchool.phone1, newSchool.phone2, newSchool.phone3]
      .map((phone) => phone.trim())
      .filter(Boolean)

    return {
      name: newSchool.name.trim(),
      group: newSchool.group.trim() || undefined,
      address: {
        street: newSchool.address.trim(),
        postalCode: newSchool.postalCode.trim(),
        locality: newSchool.locality.trim(),
      },
      phones,
      director: {
        name: newSchool.directorName.trim(),
        contacts: newSchool.directorContacts.trim() || undefined,
      },
    }
  }

  function updateNewSchoolField(field: keyof SchoolForm, value: string) {
    setNewSchool((currentSchool) => ({
      ...currentSchool,
      [field]: value,
    }))
  }

  function resetSchoolForm() {
    setNewSchool(EMPTY_SCHOOL_FORM)
    setEditingSchoolId(null)
  }

  function openCreateSchoolModal() {
    resetSchoolForm()
    setIsCreateSchoolModalOpen(true)
  }

  function openEditSchoolModal(school: SchoolDocument) {
    const schoolId = getSchoolId(school)
    if (!schoolId) {
      setSchoolsError('Não foi possível identificar a escola para edição.')
      return
    }

    setEditingSchoolId(schoolId)
    setNewSchool(getSchoolFormFromDocument(school))
    setIsCreateSchoolModalOpen(true)
  }

  function openSchoolsDashboard() {
    setSelectedSchool(null)
    setSelectedAcademicYearDocument(null)
    setActiveDashboard('schools')
  }

  function openYearsDashboard(school: SchoolDocument) {
    setSelectedSchool(school)
    setSelectedAcademicYearDocument(null)
    setActiveDashboard('years')
  }

  function openCreateYearModal() {
    setEditingYearId(null)
    setSelectedAcademicYear(academicYearOptions[0].value)
    setIsCreateYearModalOpen(true)
  }

  function openEditYearModal(year: SchoolDocument) {
    const yearId = getDocumentId(year)
    if (!yearId) {
      setYearsError('Não foi possível identificar o ano letivo para edição.')
      return
    }

    setEditingYearId(yearId)
    setSelectedAcademicYear(getAcademicYearTitle(year))
    setIsCreateYearModalOpen(true)
  }

  function openClassesDashboard(year: SchoolDocument) {
    setSelectedAcademicYearDocument(year)
    setActiveDashboard('classes')
  }

  function openSettingsDashboard() {
    setActiveDashboard('settings')
  }

  function getDashboardTitle() {
    if (activeDashboard === 'years' && selectedSchool) {
      return getSchoolTitle(selectedSchool)
    }

    if (activeDashboard === 'settings') {
      return 'Configurações'
    }

    if (activeDashboard === 'classes' && selectedAcademicYearDocument) {
      return getAcademicYearTitle(selectedAcademicYearDocument)
    }

    return 'Escolas'
  }

  function getDashboardDescription() {
    if (activeDashboard === 'years' && selectedSchool) {
      return 'Gere os anos letivos desta escola.'
    }

    if (activeDashboard === 'settings') {
      return 'Configurações gerais da aplicação.'
    }

    if (activeDashboard === 'classes' && selectedAcademicYearDocument) {
      return 'Gere as turmas deste ano letivo.'
    }

    return 'Cria novas escolas e consulta as escolas existentes.'
  }

  function getSchoolTitle(school: SchoolDocument) {
    const title = school.name ?? school.title ?? school.school ?? school._id
    return typeof title === 'string' ? title : 'Escola sem nome'
  }

  function getAcademicYearTitle(year: SchoolDocument) {
    const title = year.name ?? year.label ?? year.year
    return typeof title === 'string' ? title : 'Ano letivo sem nome'
  }

  function getSchoolAcademicYearCount(school: SchoolDocument) {
    const schoolId = getSchoolId(school)
    if (!schoolId) {
      return 0
    }

    return allAcademicYears.filter((year) => year.schoolId === schoolId).length
  }

  function getAcademicYearClassCount(year: SchoolDocument) {
    const yearId = typeof year._id === 'string' ? year._id : ''
    const yearTitle = getAcademicYearTitle(year)

    return allClasses.filter((schoolClass) => {
      const classYearId = schoolClass.yearId ?? schoolClass.academicYearId
      const classYearTitle = schoolClass.year ?? schoolClass.academicYear ?? schoolClass.academicYearName

      return classYearId === yearId || classYearTitle === yearTitle
    }).length
  }

  function hasAcademicYearChanged(year: SchoolDocument, payload: SchoolDocument) {
    return (
      year.name !== payload.name ||
      year.startYear !== payload.startYear ||
      year.endYear !== payload.endYear ||
      year.schoolId !== payload.schoolId ||
      year.schoolName !== payload.schoolName
    )
  }

  function getSchoolId(school: SchoolDocument) {
    return getDocumentId(school)
  }

  function getDocumentId(document: SchoolDocument) {
    return typeof document._id === 'string' ? document._id : null
  }

  function getStringValue(value: unknown) {
    return typeof value === 'string' ? value : ''
  }

  function getRecordValue(value: unknown) {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {}
  }

  function getSchoolFormFromDocument(school: SchoolDocument): SchoolForm {
    const address = getRecordValue(school.address)
    const director = getRecordValue(school.director)
    const phones = Array.isArray(school.phones) ? school.phones.map(getStringValue) : []

    return {
      name: getStringValue(school.name),
      group: getStringValue(school.group),
      address: getStringValue(address.street),
      postalCode: getStringValue(address.postalCode),
      locality: getStringValue(address.locality),
      phone1: phones[0] ?? '',
      phone2: phones[1] ?? '',
      phone3: phones[2] ?? '',
      directorName: getStringValue(director.name),
      directorContacts: getStringValue(director.contacts),
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const loggedUser = await authApi.login({ email, password })
      setUser(loggedUser)
      setSelectedSchool(null)
      setAcademicYears([])
      setAllAcademicYears([])
      setAllClasses([])
      setSelectedAcademicYearDocument(null)
      setActiveDashboard('schools')
      setMessage(loggedUser.message)
    } catch (loginError) {
      setUser(null)
      setError(loginError instanceof Error ? loginError.message : 'Erro ao iniciar sessão.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (password !== confirmPassword) {
      setError('As passwords não coincidem.')
      return
    }

    setIsLoading(true)

    try {
      const registerResponse = await authApi.register({
        name,
        email,
        password,
        role: DEFAULT_REGISTER_ROLE,
      })
      setMessage(registerResponse.message)
      setAuthMode('login')
      setName('')
      setPassword('')
      setConfirmPassword('')
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Erro ao criar utilizador.')
    } finally {
      setIsLoading(false)
    }
  }

  function switchAuthMode(nextMode: 'login' | 'register') {
    setAuthMode(nextMode)
    setError(null)
    setMessage(null)
    setPassword('')
    setConfirmPassword('')
  }

  async function handleLogout() {
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const logoutResponse = await authApi.logout()
      setUser(null)
      setPassword('')
      setSelectedSchool(null)
      setAcademicYears([])
      setAllAcademicYears([])
      setAllClasses([])
      setSelectedAcademicYearDocument(null)
      setActiveDashboard('schools')
      setMessage(logoutResponse.message)
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Erro ao terminar sessão.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className={user ? 'app-shell dashboard-page' : 'app-shell'}>
      {user ? (
        <section className="dashboard-shell" aria-labelledby="dashboard-title">
          <section className="dashboard-content">
            <header className="dashboard-header">
              <div>
                <p className="app-title">School Management</p>
                <h1 id="dashboard-title">{getDashboardTitle()}</h1>
                <p>{getDashboardDescription()}</p>
              </div>
              <div className="user-summary">
                <span>{user.email ?? email}</span>
                <strong>{user.role}</strong>
                {activeDashboard === 'classes' && (
                  <button type="button" className="secondary-button" onClick={() => setActiveDashboard('years')}>
                    Voltar aos anos letivos
                  </button>
                )}
                {activeDashboard === 'years' && (
                  <button type="button" className="secondary-button" onClick={openSchoolsDashboard}>
                    Voltar às escolas
                  </button>
                )}
                <button type="button" className="secondary-button" onClick={openSettingsDashboard}>
                  Configurações
                </button>
                <button type="button" onClick={handleLogout} disabled={isLoading}>
                  {isLoading ? 'A terminar...' : 'Logout'}
                </button>
              </div>
            </header>

            {activeDashboard === 'schools' ? (
            <section className="schools-grid" aria-label="Escolas">
              <article className="school-card create-school-card">
                <h2>Criar nova escola</h2>
                <p>Adicionar uma nova escola à plataforma.</p>
                <button type="button" onClick={openCreateSchoolModal}>
                  Nova escola
                </button>
              </article>

              {schools.map((school, index) => (
                <article
                  className="school-card existing-school-card"
                  key={String(school._id ?? school.name ?? index)}
                >
                  <h2>{getSchoolTitle(school)}</h2>
                  <div className="school-card-meta" aria-label="Número de anos letivos">
                    <span>Anos letivos</span>
                    <strong>{getSchoolAcademicYearCount(school)}</strong>
                  </div>
                  <div className="school-card-actions">
                    <button type="button" onClick={() => openYearsDashboard(school)}>
                      Abrir
                    </button>
                    <button
                      type="button"
                      className="transparent-button"
                      onClick={() => openEditSchoolModal(school)}
                    >
                      Editar informação
                    </button>
                  </div>
                </article>
              ))}

            </section>
            ) : activeDashboard === 'years' && selectedSchool ? (
              <section className="schools-grid" aria-label="Anos letivos">
                <article className="school-card create-school-card">
                  <h2>Criar novo ano letivo</h2>
                  <p>Adicionar um novo ano letivo a esta escola.</p>
                  <button type="button" onClick={openCreateYearModal}>
                    Novo ano letivo
                  </button>
                </article>
                {academicYears.map((year, index) => (
                  <article
                    className="school-card year-card"
                    key={String(year._id ?? year.name ?? index)}
                  >
                    <h2>{getAcademicYearTitle(year)}</h2>
                    <div className="school-card-meta year-card-meta" aria-label="Número de turmas associadas">
                      <span>Turmas</span>
                      <strong>{getAcademicYearClassCount(year)}</strong>
                    </div>
                    <div className="school-card-actions">
                      <button type="button" onClick={() => openClassesDashboard(year)}>
                        Abrir
                      </button>
                      <button
                        type="button"
                        className="transparent-button"
                        onClick={() => openEditYearModal(year)}
                      >
                        Editar informação
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            ) : activeDashboard === 'classes' && selectedAcademicYearDocument ? (
              <section className="schools-grid" aria-label="Turmas">
                <article className="school-card create-school-card">
                  <h2>Criar nova turma</h2>
                  <p>Adicionar uma nova turma a este ano letivo.</p>
                  <button type="button">
                    Nova turma
                  </button>
                </article>
              </section>
            ) : (
              <section className="dashboard-empty-state">
                <h2>Área em construção</h2>
                <p>Seleciona Escolas para voltar ao dashboard das escolas.</p>
              </section>
            )}

            {schoolsError && <p className="dashboard-feedback">{schoolsError}</p>}
            {yearsError && <p className="dashboard-feedback">{yearsError}</p>}
            {isLoadingYears && <p className="dashboard-feedback info">A carregar anos letivos...</p>}

            {isCreateSchoolModalOpen && (
              <div className="modal-backdrop" role="presentation">
                <section className="modal-card" aria-labelledby="create-school-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={() => {
                      setIsCreateSchoolModalOpen(false)
                      resetSchoolForm()
                    }}
                  >
                    ×
                  </button>
                  <h2 id="create-school-title">
                    {editingSchoolId ? 'Editar escola' : 'Criar nova escola'}
                  </h2>
                  <form onSubmit={handleSaveSchool}>
                    <label>
                      Nome da escola
                      <input
                        type="text"
                        value={newSchool.name}
                        onChange={(event) => updateNewSchoolField('name', event.target.value)}
                        placeholder="Ex: Escola Secundária Central"
                        minLength={2}
                        autoFocus
                        required
                      />
                    </label>
                    <label>
                      Agrupamento
                      <input
                        type="text"
                        value={newSchool.group}
                        onChange={(event) => updateNewSchoolField('group', event.target.value)}
                        placeholder="Opcional"
                      />
                    </label>
                    <label>
                      Morada
                      <input
                        type="text"
                        value={newSchool.address}
                        onChange={(event) => updateNewSchoolField('address', event.target.value)}
                        placeholder="Rua, número e complemento"
                        required
                      />
                    </label>
                    <div className="form-row">
                      <label>
                        Código postal
                        <input
                          type="text"
                          value={newSchool.postalCode}
                          onChange={(event) => updateNewSchoolField('postalCode', event.target.value)}
                          placeholder="0000-000"
                          required
                        />
                      </label>
                      <label>
                        Localidade
                        <input
                          type="text"
                          value={newSchool.locality}
                          onChange={(event) => updateNewSchoolField('locality', event.target.value)}
                          placeholder="Localidade"
                          required
                        />
                      </label>
                    </div>
                    <div className="form-row three-columns">
                      <label>
                        Telefone 1
                        <input
                          type="tel"
                          value={newSchool.phone1}
                          onChange={(event) => updateNewSchoolField('phone1', event.target.value)}
                          placeholder="Obrigatório"
                          required
                        />
                      </label>
                      <label>
                        Telefone 2
                        <input
                          type="tel"
                          value={newSchool.phone2}
                          onChange={(event) => updateNewSchoolField('phone2', event.target.value)}
                          placeholder="Opcional"
                        />
                      </label>
                      <label>
                        Telefone 3
                        <input
                          type="tel"
                          value={newSchool.phone3}
                          onChange={(event) => updateNewSchoolField('phone3', event.target.value)}
                          placeholder="Opcional"
                        />
                      </label>
                    </div>
                    <label>
                      Nome da diretora
                      <input
                        type="text"
                        value={newSchool.directorName}
                        onChange={(event) => updateNewSchoolField('directorName', event.target.value)}
                        placeholder="Nome completo"
                        required
                      />
                    </label>
                    <label>
                      Contactos da diretora
                      <input
                        type="text"
                        value={newSchool.directorContacts}
                        onChange={(event) => updateNewSchoolField('directorContacts', event.target.value)}
                        placeholder="Opcional: telefone, email ou extensão"
                      />
                    </label>
                    <button type="submit" disabled={isLoadingSchools}>
                      {isLoadingSchools
                        ? 'A guardar...'
                        : editingSchoolId ? 'Guardar alterações' : 'Criar escola'}
                    </button>
                  </form>
                </section>
              </div>
            )}

            {isCreateYearModalOpen && (
              <div className="modal-backdrop" role="presentation">
                <section className="modal-card small-modal-card" aria-labelledby="create-year-title" role="dialog" aria-modal="true">
                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Fechar"
                    onClick={() => {
                      setIsCreateYearModalOpen(false)
                      setEditingYearId(null)
                    }}
                  >
                    ×
                  </button>
                  <h2 id="create-year-title">
                    {editingYearId ? 'Editar ano letivo' : 'Criar novo ano letivo'}
                  </h2>
                  <form onSubmit={handleCreateAcademicYear}>
                    <label>
                      Ano letivo
                      <select
                        value={selectedAcademicYear}
                        onChange={(event) => setSelectedAcademicYear(event.target.value)}
                        autoFocus
                        required
                      >
                        {academicYearOptions.map((year) => (
                          <option key={year.value} value={year.value}>
                            {year.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="submit" disabled={isLoadingYears}>
                      {isLoadingYears
                        ? 'A guardar...'
                        : editingYearId ? 'Guardar alterações' : 'Criar ano letivo'}
                    </button>
                  </form>
                </section>
              </div>
            )}
          </section>
        </section>
      ) : (
        <section className="login-card" aria-labelledby="auth-title">
          {authMode === 'login' ? (
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-heading">
              <p className="app-title">School Management</p>
              <h1 id="auth-title">Entrar na plataforma</h1>
            </div>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="utilizador@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="A tua password"
                required
              />
            </label>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'A entrar...' : 'Entrar'}
            </button>
            <p className="auth-switch">
              Ainda não tens conta?{' '}
              <button type="button" onClick={() => switchAuthMode('register')}>
                Criar novo utilizador
              </button>
            </p>
          </form>
        ) : (
          <form className="login-form register-form" onSubmit={handleRegister}>
            <div className="login-heading">
              <p className="app-title">School Management</p>
              <h1 id="auth-title">Criar utilizador</h1>
            </div>

            <label>
              Nome
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome do utilizador"
                minLength={3}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="utilizador@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 8 caracteres e 1 símbolo"
                minLength={8}
                required
              />
              <span className={`password-strength ${passwordStrength.level}`}>
                <span className="password-strength-track" aria-hidden="true">
                  <span style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                </span>
                {passwordStrength.label}
              </span>
            </label>
            <label>
              Confirmar password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repete a password"
                minLength={8}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <span className="password-match-error">As passwords não coincidem.</span>
              )}
            </label>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'A criar...' : 'Criar utilizador'}
            </button>
            <p className="auth-switch">
              Já tens conta?{' '}
              <button type="button" onClick={() => switchAuthMode('login')}>
                Entrar
              </button>
            </p>
          </form>
          )}

          {message && <p className="feedback success">{message}</p>}
          {error && <p className="feedback error">{error}</p>}
        </section>
      )}
    </main>
  )
}

export default App
