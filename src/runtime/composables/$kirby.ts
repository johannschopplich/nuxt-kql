import { hash } from 'ohash'
import type { FetchOptions } from 'ohmyfetch'
import { buildAuthHeader, headersToObject, kirbyApiRoute } from '../utils'
import type { ModuleOptions } from '../../module'
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
   * Custom headers to send with the request
   */
  headers?: HeadersInit
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

  if (opts.client && !kql.client)
    throw new Error('Fetching from Kirby client-side isn\'t allowed. Enable it by setting "client" to "true".')

  const promiseMap: Map<string, Promise<T>> = nuxt._promiseMap = nuxt._promiseMap || new Map()
  const key = `$kirby${hash(uri)}`

  if (key in nuxt.payload.data!)
    return Promise.resolve(nuxt.payload.data![key])

  if (promiseMap.has(key))
    return promiseMap.get(key)!

  const fetchOptions: FetchOptions = {
    ...opts,
    method: 'POST',
    body: {
      uri,
      headers: headersToObject(opts.headers),
    },
  }

  const publicFetchOptions: FetchOptions = {
    ...opts,
    baseURL: kql.url,
    headers: {
      ...headersToObject(opts.headers),
      ...buildAuthHeader({
        auth: kql.auth as ModuleOptions['auth'],
        token: kql.token,
        credentials: kql.credentials,
      }),
    },
  }

  const request = $fetch(
    opts.client ? uri : kirbyApiRoute,
    opts.client ? publicFetchOptions : fetchOptions,
  ).then((response) => {
    nuxt.payload.data![key] = response
    promiseMap.delete(key)
    return response
  }) as Promise<T>

  promiseMap.set(key, request)

  return request
}
