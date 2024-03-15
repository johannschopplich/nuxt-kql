import { stringToBase64 } from 'uint8array-extras'
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
    const encoded = stringToBase64(`${username}:${password}`)

    return { Authorization: `Basic ${encoded}` }
  }

  if (auth === 'bearer')
    return { Authorization: `Bearer ${token}` }
}
