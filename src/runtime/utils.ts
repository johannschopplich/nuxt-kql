import type { ModuleOptions } from '../module'

export const DEFAULT_CLIENT_ERROR = 'Fetching from Kirby client-side isn\'t allowed. Enable it by setting the module option "client" to "true" in your "nuxt.config.ts".'

export function getProxyPath(key: string) {
  return `/api/__kql/${encodeURIComponent(key)}`
}

export function headersToObject(headers: HeadersInit = {}): Record<string, string> {
  if (headers instanceof Headers)
    return Object.fromEntries([...headers.entries()])

  if (Array.isArray(headers))
    return Object.fromEntries(headers)

  return headers
}

export function getAuthHeader({
  auth,
  token,
  credentials,
}: Pick<ModuleOptions, 'token' | 'credentials'> & { auth?: string }) {
  const headers: Record<string, string> = {}

  if (auth === 'basic' && credentials) {
    const { username, password } = credentials
    headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
  }

  if (auth === 'bearer')
    headers.Authorization = `Bearer ${token}`

  return headers
}
