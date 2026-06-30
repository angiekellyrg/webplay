import { useState } from 'react'

const LOGIN_API = 'https://vrtt7h3co2.execute-api.us-east-2.amazonaws.com/login'

function LoginPage({ onLogin }) {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(LOGIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena: password }),
      })
      if (res.ok) {
        const data = await res.json()
        onLogin(data.usuario)
      } else {
        setError('Usuario o contraseña incorrectos.')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
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
            <label htmlFor="lp-user">Correo</label>
            <input
              id="lp-user"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Ingresa tu correo"
              autoComplete="email"
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
            disabled={loading || !correo || !password}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
