import { useEffect, useState } from 'react'

function useIframeStatus(url) {
  const [frameKey, setFrameKey] = useState(0)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [lastLoadedAt, setLastLoadedAt] = useState(new Date().toISOString())

  useEffect(() => {
    setStatus('loading')
    setError('')

    const timer = window.setTimeout(() => {
      setStatus((current) => {
        if (current === 'ready') {
          return current
        }

        setError('El origen remoto tardó demasiado en responder.')
        return 'error'
      })
    }, 15000)

    return () => window.clearTimeout(timer)
  }, [url, frameKey])

  return {
    error,
    frameKey: `${url}-${frameKey}`,
    lastLoadedAt,
    onError: () => {
      setStatus('error')
      setError('No se pudo completar la carga del iframe.')
    },
    onLoad: () => {
      setStatus('ready')
      setError('')
      setLastLoadedAt(new Date().toISOString())
    },
    reconnect: () => {
      setFrameKey((current) => current + 1)
    },
    status,
  }
}

export { useIframeStatus }
