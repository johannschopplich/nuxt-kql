import { hash } from 'ohash'
import { joinURL } from 'ufo'
import type { FetchOptions } from 'ofetch'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-fest'
import { DEFAULT_CLIENT_ERROR, KQL_API_ROUTE, getAuthHeader, headersToObject } from '../utils'
import { useNuxtApp, useRuntimeConfig } from '#imports'

export type KqlOptions = Pick<
  FetchOptions,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'headers'
> & {
  /**
   * Language code to fetch data for in multilang Kirby setups
   */
  language?: string
  /**
   * Skip the Nuxt server proxy and fetch directly from the API
   * Requires `client` to be enabled in the module options as well
   */
  client?: boolean
}

export function $kql<T extends KirbyQueryResponse = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlOptions = {},
): Promise<T> {
  const nuxt = useNuxtApp()
  const { kql } = useRuntimeConfig().public
  const { headers, language, client = false, ...fetchOptions } = opts

  if (client && !kql.client)
    throw new Error(DEFAULT_CLIENT_ERROR)

  const promiseMap: Map<string, Promise<T>> = nuxt._promiseMap = nuxt._promiseMap || new Map()
  const key = `$kql${hash(query)}`

  if (key in nuxt.payload.data!)
    return Promise.resolve(nuxt.payload.data![key])

  if (promiseMap.has(key))
    return promiseMap.get(key)!

  const baseHeaders = {
    ...headersToObject(headers),
    ...(language ? { 'X-Language': language } : {}),
  }

  const _fetchOptions: FetchOptions = {
    method: 'POST',
    body: {
      query,
      headers: baseHeaders,
    },
  }

  const _publicFetchOptions: FetchOptions = {
    method: 'POST',
    body: query,
    headers: {
      ...baseHeaders,
      ...getAuthHeader(kql),
    },
  }

  const request = $fetch(client ? joinURL(kql.url, kql.prefix) : KQL_API_ROUTE, {
    ...fetchOptions,
    ...(client ? _publicFetchOptions : _fetchOptions),
  }).then((response) => {
    if (process.server)
      nuxt.payload.data![key] = response
    promiseMap.delete(key)
    return response
  }) as Promise<T>

  promiseMap.set(key, request)

  return request
}
