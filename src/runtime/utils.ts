import type { ModuleOptions } from '../module'

export function headersToObject(headers: HeadersInit = {}) {
  // SSR compatibility for `Headers` prototype
  if (typeof Headers !== 'undefined' && headers instanceof Headers)
    return Object.fromEntries([...headers.entries()])

  if (Array.isArray(headers))
    return Object.fromEntries(headers)

  return headers as Record<string, string>
}

export function getAuthHeaders({ kirbyAuth, token, credentials }: ModuleOptions) {
  const headers: Record<string, string> = {}

  if (kirbyAuth === 'basic') {
    if (!credentials?.username || !credentials?.password)
      throw new Error('Missing KQL credentials for basic auth')

    const { username, password } = credentials

    headers.Authorization = Buffer.from(`${username}:${password}`).toString('base64')
  }

  if (kirbyAuth === 'bearer') {
    if (!token)
      throw new Error('Missing KQL token for bearer auth')

    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export function assertKqlPublicConfig(config: ModuleOptions) {
  if (!config.clientRequests)
    throw new Error('Fetching from the KQL server directly on the client isn\'t allowed. Enable it by setting the nuxt-kql option "clientRequests" to "true" first.')

  if (!config.kirbyUrl || !config.kirbyEndpoint)
    throw new Error('Kirby base URL or KQL API route path is not configured')
}
