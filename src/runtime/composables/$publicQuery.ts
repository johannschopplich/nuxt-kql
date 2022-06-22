import type { FetchOptions } from 'ohmyfetch'
import type { KirbyQueryRequest, KirbyQueryResponse } from '../types'
import type { ModuleOptions } from '../../module'
import { getAuthHeaders, headersToObject } from '../utils'
import { useRuntimeConfig } from '#imports'

export type PublicQueryOptions = Omit<FetchOptions, 'baseURL' | 'body' | 'params' | 'parseResponse' | 'responseType' | 'response'>

export function $publicQuery<T extends KirbyQueryResponse = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: PublicQueryOptions = {},
): Promise<T> {
  const { kql } = useRuntimeConfig().public

  if (!kql?.clientRequests)
    throw new Error('Fetching from Kirby client-side isn\'t allowed. Enable it by setting `clientRequests` to `true`.')

  return $fetch<T>(kql.prefix, {
    ...opts,
    baseURL: kql.url,
    method: 'POST',
    body: query,
    headers: {
      ...headersToObject(opts.headers),
      ...getAuthHeaders(kql as ModuleOptions),
    },
  })
}
