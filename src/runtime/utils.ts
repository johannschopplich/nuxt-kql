import type { ModuleOptions } from '../module'

export const KQL_API_ROUTE = '/api/__kql'
export const KIRBY_API_ROUTE = '/api/__kirby'
export const DEFAULT_CLIENT_ERROR = 'Fetching from Kirby client-side isn\'t allowed. Enable it by setting the module option "client" to "true" in your "nuxt.config.ts".'

export function headersToObject(headers: HeadersInit = {}): Record<string, string> {
  // SSR compatibility for `Headers` prototype
  if (typeof Headers !== 'undefined' && headers instanceof Headers)
    return Object.fromEntries([...headers.entries()])

  if (Array.isArray(headers))
    return Object.fromEntries(headers)

  return headers as Record<string, string>
}

export function getAuthHeader({
  auth,
  token,
  credentials,
}: Pick<ModuleOptions, 'token' | 'credentials'> & { auth?: string }) {
  const headers: Record<string, string> = {}

  if (auth === 'basic' && credentials) {
    const { username, password } = credentials
    headers.Authorization = Buffer.from(`${username}:${password}`).toString('base64')
  }

  if (auth === 'bearer')
    headers.Authorization = `Bearer ${token}`

  return headers
}
