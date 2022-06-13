import { useRuntimeConfig } from '#app'

export function normalizeHeaders(headers?: HeadersInit) {
  const normalized: Record<string, string> = {}

  if (!headers)
    return normalized

  for (const [key, value] of Array.isArray(headers) ? headers : Object.entries(headers))
    normalized[key] = value
}

export function getAuthHeaders() {
  const { public: { kql: { auth, credentials, token } } } = useRuntimeConfig()
  const headers: HeadersInit = {}

  if (auth === 'basic') {
    if (!credentials.username || !credentials.password)
      throw new Error('Missing KQL credentials for basic auth')

    const { username, password } = credentials

    headers.Authorization = Buffer.from(`${username}:${password}`).toString('base64')
  }

  if (auth === 'bearer') {
    if (!token)
      throw new Error('Missing KQL token for bearer auth')

    headers.Authorization = `Bearer ${token}`
  }

  return headers
}
