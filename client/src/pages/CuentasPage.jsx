import { useEffect, useRef, useState } from 'react'

import { API_BASE_URL, api } from '../services/api'

function IcoEye({ closed = false }) {
  return closed ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IcoCopy() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

const WEBHOOK_URL = `${API_BASE_URL}/api/hgcash/webhook`

function CuentasPage() {
  const [tab, setTab] = useState('hgcash')
  const [apiToken, setApiToken] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [environment, setEnvironment] = useState('production')
  const [autoVerify, setAutoVerify] = useState(true)
  const [showToken, setShowToken] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [tokenSet, setTokenSet] = useState(false)
  const [secretSet, setSecretSet] = useState(false)
  const [account, setAccount] = useState(null)
  const [connected, setConnected] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const copyTimeout = useRef(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.getHgcashConfig().then((data) => {
      setTokenSet(data.apiTokenSet)
      setSecretSet(data.webhookSecretSet)
      setEnvironment(data.environment)
      setAutoVerify(data.autoVerifyDeposits)
    }).catch(() => {})
  }, [])

  const handleTest = async () => {
    setError('')
    setSuccessMsg('')
    setTestLoading(true)
    try {
      const result = await api.testHgcashConnection()
      setAccount(result.account)
      setConnected(true)
    } catch (err) {
      setError(err.message)
      setConnected(false)
      setAccount(null)
    } finally {
      setTestLoading(false)
    }
  }

  const handleSave = async () => {
    setError('')
    setSuccessMsg('')
    setSaveLoading(true)
    try {
      await api.saveHgcashConfig({
        apiToken: apiToken || undefined,
        autoVerifyDeposits: autoVerify,
        environment,
        webhookSecret: webhookSecret || undefined,
      })
      setSuccessMsg('Configuración guardada correctamente.')
      if (apiToken) setTokenSet(true)
      if (webhookSecret) setSecretSet(true)
      setApiToken('')
      setWebhookSecret('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(WEBHOOK_URL).catch(() => {})
    setCopied(true)
    clearTimeout(copyTimeout.current)
    copyTimeout.current = setTimeout(() => setCopied(false), 2000)
  }

  const balance = account?.balance != null
    ? `$${Number(account.balance).toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS`
    : account?.saldo ?? '—'

  return (
    <div className="bp-cuentas">
      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="bp-stat-grid">
        <div className="bp-stat-card">
          <span className="bp-stat-label">HG.Cash</span>
          <span className={`bp-stat-value bp-hgcash-status ${connected ? 'connected' : ''}`}>
            {connected ? 'Conectada' : 'Desconectada'}
          </span>
        </div>
        <div className="bp-stat-card">
          <span className="bp-stat-label">Saldo</span>
          <span className="bp-stat-value">{connected ? balance : '—'}</span>
        </div>
        <div className="bp-stat-card">
          <span className="bp-stat-label">Cuentas Manuales</span>
          <span className="bp-stat-value">0</span>
        </div>
        <div className="bp-stat-card">
          <span className="bp-stat-label">Activas</span>
          <span className="bp-stat-value">0</span>
        </div>
      </div>

      {/* ── Sub-tabs ──────────────────────────────────────── */}
      <div className="bp-cuentas-body">
        <div className="bp-cuentas-tabs">
          <button
            className={`bp-cuentas-tab${tab === 'manual' ? ' active' : ''}`}
            onClick={() => setTab('manual')}
          >
            <span className={`bp-tab-dot${tab === 'manual' ? ' active' : ''}`} />
            MANUAL
          </button>
          <button
            className={`bp-cuentas-tab bp-cuentas-tab-gold${tab === 'hgcash' ? ' active' : ''}`}
            onClick={() => setTab('hgcash')}
          >
            HG CASH
          </button>
        </div>

        {tab === 'manual' && (
          <div className="bp-cuentas-panel">
            <p className="bp-cuentas-empty">No hay cuentas manuales configuradas.</p>
          </div>
        )}

        {tab === 'hgcash' && (
          <div className="bp-cuentas-panel">
            {/* API TOKEN */}
            <div className="bp-cuentas-field-row">
              <div className="bp-cuentas-field">
                <label className="bp-field-label">API TOKEN</label>
                <div className="bp-secret-input">
                  <input
                    type={showToken ? 'text' : 'password'}
                    className="bp-text-input"
                    placeholder={tokenSet ? 'Ingrese nuevo token para reemplazar' : 'Tu API token de HG.Cash'}
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="bp-eye-btn"
                    onClick={() => setShowToken((v) => !v)}
                    title={showToken ? 'Ocultar' : 'Mostrar'}
                  >
                    <IcoEye closed={showToken} />
                  </button>
                </div>
              </div>

              {/* WEBHOOK SECRET */}
              <div className="bp-cuentas-field">
                <label className="bp-field-label">WEBHOOK SECRET</label>
                <div className="bp-secret-input">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    className="bp-text-input"
                    placeholder={secretSet ? 'Ingrese nuevo secret para reemplazar' : 'Tu webhook secret de HG.Cash'}
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="bp-eye-btn"
                    onClick={() => setShowSecret((v) => !v)}
                    title={showSecret ? 'Ocultar' : 'Mostrar'}
                  >
                    <IcoEye closed={showSecret} />
                  </button>
                </div>
              </div>
            </div>

            {/* ENTORNO */}
            <div className="bp-cuentas-field-row bp-cuentas-field-row-split">
              <div className="bp-cuentas-field bp-cuentas-field-wide">
                <label className="bp-field-label">ENTORNO</label>
                <select
                  className="bp-select"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                >
                  <option value="production">Produccion (hg.cash)</option>
                  <option value="sandbox">Sandbox (sandbox.hg.cash)</option>
                </select>
              </div>
              <div className="bp-cuentas-field-action">
                <button
                  type="button"
                  className="bp-btn-outline"
                  onClick={handleTest}
                  disabled={testLoading}
                >
                  {testLoading ? <span className="bp-spinner" /> : 'Probar Conexion'}
                </button>
              </div>
            </div>

            {/* Account info when connected */}
            {connected && account && (
              <div className="bp-account-info">
                <div className="bp-account-grid">
                  <div className="bp-account-card">
                    <span className="bp-account-card-label">CUENTA</span>
                    <span className="bp-account-card-value">{account.name ?? account.cuenta ?? '—'}</span>
                  </div>
                  <div className="bp-account-card">
                    <span className="bp-account-card-label">SALDO</span>
                    <span className="bp-account-card-value">{balance}</span>
                  </div>
                  <div className="bp-account-card">
                    <span className="bp-account-card-label">CVU</span>
                    <span className="bp-account-card-value bp-account-mono">{account.cvu ?? '—'}</span>
                  </div>
                  <div className="bp-account-card">
                    <span className="bp-account-card-label">ALIAS</span>
                    <span className="bp-account-card-value bp-account-mono">{account.alias ?? '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Webhook URL */}
            <div className="bp-webhook-box">
              <span className="bp-webhook-label">URL del Webhook (configurar en HG.Cash):</span>
              <div className="bp-webhook-url-row">
                <span className="bp-webhook-url">{WEBHOOK_URL}</span>
                <button
                  type="button"
                  className="bp-copy-btn"
                  onClick={handleCopy}
                  title="Copiar URL"
                >
                  <IcoCopy />
                  {copied ? 'Copiado' : ''}
                </button>
              </div>
            </div>

            {/* Auto-verify + Save */}
            <div className="bp-cuentas-footer">
              <label className="bp-checkbox-label">
                <input
                  type="checkbox"
                  checked={autoVerify}
                  onChange={(e) => setAutoVerify(e.target.checked)}
                />
                <span className="bp-checkbox-custom" />
                Auto-verificacion de depositos habilitada
              </label>

              <button
                type="button"
                className="bp-btn-gold"
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? <span className="bp-spinner" /> : 'Guardar Config'}
              </button>
            </div>

            {error && <p className="bp-cuentas-error">{error}</p>}
            {successMsg && <p className="bp-cuentas-success">{successMsg}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default CuentasPage
