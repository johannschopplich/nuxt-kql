import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { NitroFetchOptions } from 'nitropack'
import type { ModuleOptions } from '../../module'
import { useRuntimeConfig } from '#imports'
import { joinURL } from 'ufo'
import { createAuthHeader, headersToObject } from '../utils'

export type KirbyFetchOptions = Omit<
  NitroFetchOptions<string>,
  'baseURL'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   */
  language?: string
}

export type KqlFetchOptions = Pick<
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function $kirby<T = any>(
  path: string,
  opts: KirbyFetchOptions = {},
): Promise<T> {
  const { headers, language, ...fetchOptions } = opts
  const kql = useRuntimeConfig().kql as Required<ModuleOptions>

  if (language)
    path = joinURL(language, path)

  return globalThis.$fetch<T, string>(path, {
    ...fetchOptions,
    baseURL: kql.url,
    headers: {
      ...headersToObject(headers),
      ...createAuthHeader(kql),
    },
  }) as Promise<T>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function $kql<T extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlFetchOptions = {},
): Promise<T> {
  const { headers, language, ...fetchOptions } = opts
  const kql = useRuntimeConfig().kql as Required<ModuleOptions>

  return globalThis.$fetch<T, string>(kql.prefix, {
    ...fetchOptions,
    baseURL: kql.url,
    method: 'POST',
    body: query,
    headers: {
      ...headersToObject(headers),
      ...createAuthHeader(kql),
      ...(language && { 'X-Language': language }),
    },
  }) as Promise<T>
}
