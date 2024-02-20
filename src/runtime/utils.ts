import type { ModuleOptions } from '../module'

export function getProxyPath(key: string) {
  return `/api/__kirby__/${encodeURIComponent(key)}`
}

export function headersToObject(headers: HeadersInit = {}): Record<string, string> {
  if (headers instanceof Headers || Array.isArray(headers))
    return Object.fromEntries(headers)

  return headers
}

export function createAuthHeader({
  auth,
  token,
  credentials,
}: Pick<ModuleOptions, 'token' | 'credentials'> & { auth?: string }) {
  if (auth === 'basic' && credentials) {
    const { username, password } = credentials
    let encoded = ''

    if (process.server)
      encoded = Buffer.from(`${username}:${password}`).toString('base64')
    else if (process.client)
      encoded = btoa(`${username}:${password}`)

    return { Authorization: `Basic ${encoded}` }
  }

  if (auth === 'bearer')
    return { Authorization: `Bearer ${token}` }
}
