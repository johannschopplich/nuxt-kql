import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { NitroFetchOptions } from 'nitropack'
import type { ModuleOptions } from '../../module'
import type { ServerFetchOptions } from '../types'
import { useNuxtApp, useRequestFetch, useRuntimeConfig } from '#imports'
import { hash } from 'ohash'
import { createAuthHeader, getProxyPath, headersToObject } from '../utils'

// #region options
export type KqlOptions = Pick<
  NitroFetchOptions<string>,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'headers'
  | 'retry'
  | 'retryDelay'
  | 'retryStatusCodes'
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
// #endregion options

export function $kql<T extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlOptions = {},
): Promise<T> {
  const nuxt = useNuxtApp()
  const promiseMap = (nuxt._pendingRequests ||= new Map()) as Map<string, Promise<T>>
  const { headers, language, cache = true, ...fetchOptions } = opts
  const kql = useRuntimeConfig().public.kql as Required<ModuleOptions>
  const key = `$kql${hash([query, language])}`

  if ((nuxt.isHydrating || cache) && nuxt.payload.data[key])
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
      ...createAuthHeader(kql),
    },
  }

  const request = useRequestFetch()(kql.client ? kql.prefix : getProxyPath(key), {
    ...fetchOptions,
    ...(kql.client ? _clientFetchOptions : _serverFetchOptions),
  })
    .then((response) => {
      if (import.meta.server || cache)
        nuxt.payload.data[key] = response
      promiseMap.delete(key)
      return response
    })
    // Invalidate cache if request fails
    .catch((error) => {
      nuxt.payload.data[key] = undefined
      promiseMap.delete(key)
      throw error
    }) as Promise<T>

  promiseMap.set(key, request)

  return request
}
