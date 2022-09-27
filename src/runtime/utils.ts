import type { ModuleOptions } from '../module'

export const kqlApiRoute = '/api/__kql__' as const
export const kirbyApiRoute = '/api/__kirby__' as const
export const clientErrorMessage = 'Fetching from Kirby client-side isn\'t allowed. Enable it by setting the module option "client" to "true" in your Nuxt config.'

/**
 * Normalize headers to object
 */
export function headersToObject(headers: HeadersInit = {}): Record<string, string> {
  // SSR compatibility for `Headers` prototype
  if (typeof Headers !== 'undefined' && headers instanceof Headers)
    return Object.fromEntries([...headers.entries()])

  if (Array.isArray(headers))
    return Object.fromEntries(headers)

  return headers as Record<string, string>
}

/**
 * Generate authentication headers for KQL fetch requests
 */
export function buildAuthHeader({
  auth,
  token,
  credentials,
}: Pick<ModuleOptions, 'auth' | 'token' | 'credentials'>) {
  const headers: Record<string, string> = {}

  if (auth === 'basic' && credentials) {
    const { username, password } = credentials
    headers.Authorization = Buffer.from(`${username}:${password}`).toString('base64')
  }

  if (auth === 'bearer')
    headers.Authorization = `Bearer ${token}`

  return headers
}
