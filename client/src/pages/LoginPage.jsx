import { useState } from 'react'

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    if (username === 'admin' && password === 'i20lon7LG67L') {
      onLogin(username)
    } else {
      setError('Usuario o contraseña incorrectos.')
    }
    setLoading(false)
  }

  return (
    <div className="bp-login-page">
      <div className="bp-login-card">
        <div className="bp-login-brand">
          <div className="bp-login-logo-mark">B</div>
          <h1>Beting Pro</h1>
          <p>Panel de Administración</p>
        </div>
        <form onSubmit={handleSubmit} className="bp-login-form">
          <div className="bp-login-field">
            <label htmlFor="lp-user">Usuario</label>
            <input
              id="lp-user"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
              required
            />
          </div>
          <div className="bp-login-field">
            <label htmlFor="lp-pass">Contraseña</label>
            <input
              id="lp-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="bp-login-error">{error}</p>}
          <button
            type="submit"
            className="bp-login-btn"
            disabled={loading || !username || !password}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
