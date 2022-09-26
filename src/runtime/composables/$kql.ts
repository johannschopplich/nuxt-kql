import { hash } from 'ohash'
import { joinURL } from 'ufo'
import type { FetchOptions } from 'ohmyfetch'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-fest'
import { buildAuthHeader, headersToObject, kqlApiRoute } from '../utils'
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
   * Custom headers to send with the request
   */
  headers?: HeadersInit
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
  const { client = false, ...fetchOptions } = opts

  if (client && !kql.client)
    throw new Error('Fetching from Kirby client-side isn\'t allowed. Enable it by setting "client" to "true".')

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
        ...headersToObject(opts.headers),
        ...(opts.language ? { 'X-Language': opts.language } : {}),
      },
    },
  }

  const _publicFetchOptions: FetchOptions = {
    body: query,
    headers: {
      ...headersToObject(opts.headers),
      ...buildAuthHeader({
        auth: kql.auth as ModuleOptions['auth'],
        token: kql.token,
        credentials: kql.credentials,
      }),
      ...(opts.language ? { 'X-Language': opts.language } : {}),
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
