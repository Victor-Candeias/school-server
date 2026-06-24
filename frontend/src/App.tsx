import './App.css'

function App() {
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
