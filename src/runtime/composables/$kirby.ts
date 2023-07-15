import { joinURL } from 'ufo'
import { hash } from 'ohash'
import type { NitroFetchOptions } from 'nitropack'
import type { ServerFetchOptions } from '../utils'
import { DEFAULT_CLIENT_ERROR, getAuthHeader, getProxyPath, headersToObject } from '../utils'
import { useNuxtApp, useRuntimeConfig } from '#imports'

export type KirbyFetchOptions = Pick<
  NitroFetchOptions<string>,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'query'
  | 'headers'
  | 'method'
  | 'body'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups
   */
  language?: string
  /**
   * Skip the Nuxt server proxy and fetch directly from the API.
   * Requires `client` to be enabled in the module options as well.
   * @default false
   */
  client?: boolean
  /**
   * Cache the response between function calls for the same path
   * @default true
   */
  cache?: boolean
}

export function $kirby<T = any>(
  path: string,
  opts: KirbyFetchOptions = {},
): Promise<T> {
  const nuxt = useNuxtApp()
  const promiseMap = (nuxt._promiseMap = nuxt._promiseMap || new Map()) as Map<string, Promise<T>>
  const { query, headers, method, body, language, client = false, cache = true, ...fetchOptions } = opts
  const { kql } = useRuntimeConfig().public

  if (language)
    path = joinURL(language, path)

  const key = `$kirby${hash([
    path,
    query,
    method,
    body,
    language,
  ])}`

  if (client && !kql.client)
    throw new Error(DEFAULT_CLIENT_ERROR)

  if ((nuxt.isHydrating || cache) && key in nuxt.payload.data)
    return Promise.resolve(nuxt.payload.data[key])

  if (promiseMap.has(key))
    return promiseMap.get(key)!

  const baseHeaders = headersToObject(headers)

  const _serverFetchOptions: NitroFetchOptions<string> = {
    method: 'POST',
    body: {
      path,
      query,
      headers: Object.keys(baseHeaders).length ? baseHeaders : undefined,
      method,
      body,
      cache,
    } satisfies ServerFetchOptions,
  }

  const _clientFetchOptions: NitroFetchOptions<string> = {
    baseURL: kql.url,
    query,
    headers: {
      ...baseHeaders,
      ...getAuthHeader(kql),
    },
    method,
    body,
  }

  const request = globalThis.$fetch(client ? path : getProxyPath(key), {
    ...fetchOptions,
    ...(client ? _clientFetchOptions : _serverFetchOptions),
  }).then((response) => {
    if (process.server || cache)
      nuxt.payload.data[key] = response
    promiseMap.delete(key)
    return response
  }) as Promise<T>

  promiseMap.set(key, request)

  return request
}
