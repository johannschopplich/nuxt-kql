import { unref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { ModuleOptions } from '../module'

/**
 * Maybe it's a ref, or a plain value, or a getter function
 */
export type MaybeComputedRef<T> = (() => T) | ComputedRef<T> | T | Ref<T>

/**
 * Normalize value/ref/getter to `ref` or `computed`
 */
export function resolveUnref<T>(r: MaybeComputedRef<T>): T {
  return typeof r === 'function'
    ? (r as any)()
    : unref(r)
}

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
}: {
  auth: ModuleOptions['auth']
  token: ModuleOptions['token']
  credentials: ModuleOptions['credentials']
}) {
  const headers: Record<string, string> = {}

  if (auth === 'basic' && credentials) {
    const { username, password } = credentials
    headers.Authorization = Buffer.from(`${username}:${password}`).toString('base64')
  }

  if (auth === 'bearer')
    headers.Authorization = `Bearer ${token}`

  return headers
}
