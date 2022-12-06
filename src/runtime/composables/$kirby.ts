import { hash } from 'ohash'
import { joinURL } from 'ufo'
import type { FetchOptions } from 'ofetch'
import { DEFAULT_CLIENT_ERROR, KIRBY_API_ROUTE, getAuthHeader, headersToObject } from '../utils'
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
}

export function $kirby<T = any>(
  uri: string,
  opts: KirbyFetchOptions = {},
): Promise<T> {
  const nuxt = useNuxtApp()
  const { kql } = useRuntimeConfig().public
  const { headers, client = false, ...fetchOptions } = opts

  if (client && !kql.client)
    throw new Error(DEFAULT_CLIENT_ERROR)

  const promiseMap: Map<string, Promise<T>> = nuxt._promiseMap = nuxt._promiseMap || new Map()
  const key = `$kirby${hash(uri)}`

  if (key in nuxt.payload.data!)
    return Promise.resolve(nuxt.payload.data![key])

  if (promiseMap.has(key))
    return promiseMap.get(key)!

  const _fetchOptions: FetchOptions = {
    method: 'POST',
    body: {
      uri,
      headers: headersToObject(headers),
    },
  }

  const _publicFetchOptions: FetchOptions = {
    headers: {
      ...headersToObject(headers),
      ...getAuthHeader(kql),
    },
  }

  const request = $fetch(client ? joinURL(kql.url, uri) : KIRBY_API_ROUTE, {
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
