import { hash } from 'ohash'
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
   * Requires `clientRequests` to be enabled in the module options
   */
  client?: boolean
}

export function $kql<T extends KirbyQueryResponse = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlOptions = {},
): Promise<T> {
  const nuxt = useNuxtApp()
  const { kql } = useRuntimeConfig().public

  if (opts.client && !kql.clientRequests)
    throw new Error('Fetching from Kirby client-side isn\'t allowed. Enable it by setting "clientRequests" to "true".')

  nuxt._kqlPromises = nuxt._kqlPromises || {}
  const key = `$kql${hash(query)}`

  if (key in nuxt.payload.data!)
    return Promise.resolve(nuxt.payload.data![key])

  if (key in nuxt._kqlPromises)
    return nuxt._kqlPromises[key]

  const fetchOptions: FetchOptions = {
    ...opts,
    method: 'POST',
    body: {
      query,
      headers: {
        ...headersToObject(opts.headers),
        ...(opts.language ? { 'X-Language': opts.language } : {}),
      },
    },
  }

  const publicFetchOptions: FetchOptions = {
    ...opts,
    baseURL: kql.url,
    method: 'POST',
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

  const request = $fetch(
    opts.client ? kql.prefix : kqlApiRoute,
    opts.client ? publicFetchOptions : fetchOptions,
  ).then((response) => {
    nuxt.payload.data![key] = response
    delete nuxt._kqlPromises[key]
    return response
  }) as Promise<T>

  nuxt._kqlPromises[key] = request

  return request
}
