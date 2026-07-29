import { useAuthContext } from '../hooks/useAuthContext'

export function AuthPage() {
  const {
    mode,
    name,
    email,
    password,
    confirmPassword,
    passwordStrength,
    message,
    error,
    isLoading,
    onNameChange,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onLogin,
    onRegister,
    onModeChange,
  } = useAuthContext()
  return (
    <section
      className={`login-card${mode === 'register' ? ' register-card' : ''}`}
      aria-labelledby="auth-title"
    >
      {mode === 'login' ? (
        <form className="login-form" onSubmit={onLogin}>
          <div className="login-heading">
            <span className="auth-eyebrow">School Management</span>
            <h1 id="auth-title">Bem-vindo</h1>
            <p>Inicia sessão para aceder à tua área de gestão.</p>
          </div>

          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="utilizador@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="A tua password"
              required
            />
          </label>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'A entrar...' : 'Entrar'}
          </button>
          <p className="auth-switch">
            Ainda não tens conta?{' '}
            <button type="button" onClick={() => onModeChange('register')}>
              Criar novo utilizador
            </button>
          </p>
        </form>
      ) : (
        <form className="login-form register-form" onSubmit={onRegister}>
          <div className="login-heading">
            <span className="auth-eyebrow">School Management</span>
            <h1 id="auth-title">Criar novo utilizador</h1>
            <p>Preenche os dados para criar a tua conta.</p>
          </div>

          <label>
            Nome
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Nome do utilizador"
              minLength={3}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="utilizador@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
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
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
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
            <button type="button" onClick={() => onModeChange('login')}>
              Entrar
            </button>
          </p>
        </form>
      )}

      {message && <p className="feedback success">{message}</p>}
      {error && <p className="feedback error">{error}</p>}
    </section>
  )
}
