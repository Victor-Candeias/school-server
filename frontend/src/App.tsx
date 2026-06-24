import { useState } from 'react'
import { authApi } from './api/auth'
import type { LoginResponse } from './api/auth'
import type { FormEvent } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<LoginResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const loggedUser = await authApi.login({ email, password })
      setUser(loggedUser)
      setMessage(loggedUser.message)
    } catch (loginError) {
      setUser(null)
      setError(loginError instanceof Error ? loginError.message : 'Erro ao iniciar sessão.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const logoutResponse = await authApi.logout()
      setUser(null)
      setPassword('')
      setMessage(logoutResponse.message)
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Erro ao terminar sessão.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <span className="eyebrow">School Server</span>
        <h1>Frontend React para gestão escolar</h1>
        <p>
          Base inicial preparada para autenticação, dashboard e integração com
          os serviços <strong>auth</strong> e <strong>school</strong>.
        </p>
      </section>

      <section className="auth-panel" aria-labelledby="auth-title">
        <div>
          <span className="eyebrow">Autenticação</span>
          <h2 id="auth-title">{user ? 'Sessão ativa' : 'Iniciar sessão'}</h2>
          <p>
            Usa um utilizador registado na API para validar a integração real com o
            backend.
          </p>
        </div>

        {user ? (
          <div className="session-card">
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{user.email ?? email}</dd>
              </div>
              <div>
                <dt>Perfil</dt>
                <dd>{user.role}</dd>
              </div>
            </dl>
            <button type="button" onClick={handleLogout} disabled={isLoading}>
              {isLoading ? 'A terminar...' : 'Logout'}
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleLogin}>
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
          </form>
        )}

        {message && <p className="feedback success">{message}</p>}
        {error && <p className="feedback error">{error}</p>}
      </section>

      <section className="cards" aria-label="Módulos principais">
        <article>
          <h2>Autenticação</h2>
          <p>Login, registo, logout e sessão via cookie HTTP-only.</p>
        </article>
        <article>
          <h2>Gestão escolar</h2>
          <p>Escolas, anos letivos, turmas, alunos e configurações.</p>
        </article>
        <article>
          <h2>Camada API</h2>
          <p>Clientes TypeScript em <code>src/api</code> para consumir o backend.</p>
        </article>
      </section>
    </main>
  )
}

export default App
