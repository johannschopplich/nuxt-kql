import { joinURL } from 'ufo'
import { hash } from 'ohash'
import type { NitroFetchOptions } from 'nitropack'
import type { ModuleOptions } from '../../module'
import type { ServerFetchOptions } from '../types'
import { createAuthHeader, getProxyPath, headersToObject } from '../utils'
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
  | 'retry'
  | 'retryDelay'
  | 'timeout'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   */
  language?: string
  /**
   * Cache the response between function calls for the same path.
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
  const {
    query,
    headers,
    method,
    body,
    language,
    cache = true,
    ...fetchOptions
  } = opts
  const kql = useRuntimeConfig().public.kql as Required<ModuleOptions>

  if (language)
    path = joinURL(language, path)

  const key = `$kirby${hash([
    path,
    query,
    method,
    body,
    language,
  ])}`

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
      ...createAuthHeader(kql),
    },
    method,
    body,
  }

  const request = globalThis.$fetch(kql.client ? path : getProxyPath(key), {
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
