import { hash } from 'ohash'
import type { FetchOptions } from 'ofetch'
import { DEFAULT_CLIENT_ERROR, KQL_API_ROUTE, getAuthHeader, headersToObject } from '../utils'
import { useNuxtApp, useRuntimeConfig } from '#imports'

export type KirbyFetchOptions = Pick<
  FetchOptions,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'headers'
> & {
  /**
   * Skip the Nuxt server proxy and fetch directly from the API
   * Requires `client` to be enabled in the module options as well
   */
  client?: boolean
  /**
   * Cache the response between function calls for the same URI
   * @default true
   */
  cache?: boolean
}

export function $kirby<T = any>(
  uri: string,
  opts: KirbyFetchOptions = {},
): Promise<T> {
  const nuxt = useNuxtApp()
  const promiseMap: Map<string, Promise<T>> = nuxt._promiseMap = nuxt._promiseMap || new Map()
  const { headers, client = false, cache = true, ...fetchOptions } = opts
  const { kql } = useRuntimeConfig().public
  const key = `$kirby${hash(uri)}`

  if (client && !kql.client)
    throw new Error(DEFAULT_CLIENT_ERROR)

  if ((nuxt.isHydrating || cache) && key in nuxt.payload.data)
    return Promise.resolve(nuxt.payload.data[key])

  if (promiseMap.has(key))
    return promiseMap.get(key)!

  const baseHeaders = headersToObject(headers)

  const _fetchOptions: FetchOptions = {
    method: 'POST',
    body: {
      key,
      uri,
      cache,
      headers: Object.keys(baseHeaders).length ? baseHeaders : undefined,
    },
  }

  const _publicFetchOptions: FetchOptions = {
    baseURL: kql.url,
    headers: {
      ...baseHeaders,
      ...getAuthHeader(kql),
    },
  }

  const request = $fetch(client ? uri : KQL_API_ROUTE, {
    ...fetchOptions,
    ...(client ? _publicFetchOptions : _fetchOptions),
  }).then((response) => {
    if (process.server || cache)
      nuxt.payload.data[key] = response
    promiseMap.delete(key)
    return response
  }) as Promise<T>

  promiseMap.set(key, request)

  return request
}
