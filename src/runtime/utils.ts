export function buildApiProxyPath(key: string) {
  return `/api/__kirby__/${encodeURIComponent(key)}`
}

export function headersToObject(headers: HeadersInit = {}): Record<string, string> {
  return Object.fromEntries(new Headers(headers))
}

export function createAuthHeader({
  auth,
  token,
  credentials,
}: {
  auth?: string
  token?: string
  credentials?: { username: string, password: string }
}) {
  if (auth === 'basic' && credentials) {
    const { username, password } = credentials
    const encoded = globalThis.btoa(`${username}:${password}`)

    return { Authorization: `Basic ${encoded}` }
  }

  if (auth === 'bearer')
    return { Authorization: `Bearer ${token}` }
}
