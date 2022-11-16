import { hash } from 'ohash'
import { joinURL } from 'ufo'
import type { FetchOptions } from 'ofetch'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-fest'
import { buildAuthHeader, clientErrorMessage, headersToObject, kqlApiRoute } from '../utils'
import type { ModuleOptions } from '../../module'
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
    throw new Error(clientErrorMessage)

  const promiseMap: Map<string, Promise<T>> = nuxt._promiseMap = nuxt._promiseMap || new Map()
  const key = `$kql${hash(query)}`

  if (key in nuxt.payload.data!)
    return Promise.resolve(nuxt.payload.data![key])

  if (promiseMap.has(key))
    return promiseMap.get(key)!

  const _fetchOptions: FetchOptions = {
    body: {
      query,
      headers: {
        ...headersToObject(headers),
        ...(language ? { 'X-Language': language } : {}),
      },
    },
  }

  const _publicFetchOptions: FetchOptions = {
    body: query,
    headers: {
      ...headersToObject(headers),
      ...buildAuthHeader({
        auth: kql.auth as ModuleOptions['auth'],
        token: kql.token,
        credentials: kql.credentials,
      }),
      ...(language ? { 'X-Language': language } : {}),
    },
  }

  const request = $fetch(client ? joinURL(kql.url, kql.prefix) : kqlApiRoute, {
    ...fetchOptions,
    method: 'POST',
    ...(client ? _publicFetchOptions : _fetchOptions),
  }).then((response) => {
    nuxt.payload.data![key] = response
    promiseMap.delete(key)
    return response
  }) as Promise<T>

  promiseMap.set(key, request)

  return request
}
