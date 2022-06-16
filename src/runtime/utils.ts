import type { ModuleOptions } from '../module'

export function headersToObject(headers?: HeadersInit): Record<string, string> {
  if (!headers)
    return {}

  return Object.fromEntries([
    ...(Array.isArray(headers) ? headers : Object.entries(headers)),
  ])
}

export function getAuthHeaders(config: ModuleOptions) {
  const headers: HeadersInit = {}

  if (config.kirbyAuth === 'basic') {
    if (!config.credentials?.username || !config.credentials?.password)
      throw new Error('Missing KQL credentials for basic auth')

    const { username, password } = config.credentials

    headers.Authorization = Buffer.from(`${username}:${password}`).toString('base64')
  }

  if (config.kirbyAuth === 'bearer') {
    if (!config.token)
      throw new Error('Missing KQL token for bearer auth')

    headers.Authorization = `Bearer ${config.token}`
  }

  return headers
}

export function assertKqlPublicConfig(config: ModuleOptions) {
  if (!config.clientRequests)
    throw new Error('Fetching from the KQL server directly on the client isn\'t allowed. Enable it by setting the nuxt-kql option "clientRequests" to "true" first.')

  if (!config.kirbyUrl || !config.kirbyEndpoint)
    throw new Error('Kirby base URL or KQL API route path is not configured')
}
