const ENVIRONMENTS = {
  production: 'https://hg.cash',
  sandbox: 'https://sandbox.hg.cash',
}

const getBaseUrl = (environment) => ENVIRONMENTS[environment] ?? ENVIRONMENTS.production

const hgcashRequest = async (apiToken, environment, path, options = {}) => {
  const baseUrl = getBaseUrl(environment)
  const url = `${baseUrl}/api/v1${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + apiToken,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    const message = payload?.message || payload?.error || `HTTP ${response.status}`
    throw new Error(message)
  }

  return payload
}

const getAccount = (apiToken, environment) => hgcashRequest(apiToken, environment, '/account')

export { getAccount, getBaseUrl }
