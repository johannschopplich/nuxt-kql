import { hash } from 'ohash'
import type { NitroFetchOptions } from 'nitropack'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { ModuleOptions } from '../../module'
import type { ServerFetchOptions } from '../types'
import { getAuthHeader, getProxyPath, headersToObject } from '../utils'
import { useNuxtApp, useRuntimeConfig } from '#imports'

export type KqlOptions = Pick<
  NitroFetchOptions<string>,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'headers'
  | 'retry'
  | 'retryDelay'
  | 'timeout'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   */
  language?: string
  /**
   * Cache the response between function calls for the same query.
   * @default true
   */
  cache?: boolean
}

export function $kql<T extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlOptions = {},
): Promise<T> {
  const nuxt = useNuxtApp()
  const promiseMap = (nuxt._promiseMap = nuxt._promiseMap || new Map()) as Map<string, Promise<T>>
  const { headers, language, cache = true, ...fetchOptions } = opts
  const kql = useRuntimeConfig().public.kql as Required<ModuleOptions>
  const key = `$kql${hash([query, language])}`

  if ((nuxt.isHydrating || cache) && key in nuxt.payload.data)
    return Promise.resolve(nuxt.payload.data[key])

  if (promiseMap.has(key))
    return promiseMap.get(key)!

  const baseHeaders = {
    ...headersToObject(headers),
    ...(language && { 'X-Language': language }),
  }

  const _serverFetchOptions: NitroFetchOptions<string> = {
    method: 'POST',
    body: {
      query,
      cache,
      headers: Object.keys(baseHeaders).length ? baseHeaders : undefined,
    } satisfies ServerFetchOptions,
  }

  const _clientFetchOptions: NitroFetchOptions<string> = {
    baseURL: kql.url,
    method: 'POST',
    body: query,
    headers: {
      ...baseHeaders,
      ...getAuthHeader(kql),
    },
  }

  const request = globalThis.$fetch(kql.client ? kql.prefix : getProxyPath(key), {
    ...fetchOptions,
    ...(kql.client ? _clientFetchOptions : _serverFetchOptions),
  })
    .then((response) => {
      if (process.server || cache)
        nuxt.payload.data[key] = response
      promiseMap.delete(key)
      return response
    })
    // Invalidate cache if request fails
    .catch((error) => {
      if (key in nuxt.payload.data)
        delete nuxt.payload.data[key]
      promiseMap.delete(key)
      throw error
    }) as Promise<T>

  promiseMap.set(key, request)

  return request
}
