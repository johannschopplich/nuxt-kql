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

  if (kirbyAuth === 'basic' && credentials) {
    const { username, password } = credentials
    headers.Authorization = Buffer.from(`${username}:${password}`).toString('base64')
  }

  if (kirbyAuth === 'bearer')
    headers.Authorization = `Bearer ${token}`

  return headers
}
