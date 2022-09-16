import type { FetchOptions } from 'ohmyfetch'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-fest'
import type { ModuleOptions } from '../../module'
import { buildAuthHeader, headersToObject } from '../utils'
import { useRuntimeConfig } from '#imports'

export type PublicKqlOptions = Omit<
  FetchOptions,
  'baseURL' | 'body' | 'params' | 'parseResponse' | 'responseType' | 'response'
> & {
  /**
   * Language code to fetch data for in multilang Kirby setups
   */
  language?: string
}

export function $publicKql<T extends KirbyQueryResponse = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: PublicKqlOptions = {},
): Promise<T> {
  const { kql } = useRuntimeConfig().public

  if (!kql.clientRequests)
    throw new Error('Fetching from Kirby client-side isn\'t allowed. Enable it by setting "clientRequests" to "true".')

  return $fetch<T>(kql.prefix, {
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
  })
}
