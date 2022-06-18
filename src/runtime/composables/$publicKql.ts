import type { KqlPublicFetchOptions, KqlQueryRequest, KqlQueryResponse } from '../types'
import type { ModuleOptions } from '../../module'
import { getAuthHeaders, headersToObject } from '../utils'
import { useRuntimeConfig } from '#imports'

export function $publicKql<T = KqlQueryResponse>(
  query: KqlQueryRequest,
  opts: KqlPublicFetchOptions = {},
): Promise<T> {
  const { kql } = useRuntimeConfig().public
  if (!kql.clientRequests)
    throw new Error('Fetching from Kirby client-side isn\'t allowed. Enable it by setting `clientRequests` to `true`.')

  return $fetch<T>(kql.kirbyEndpoint, {
    ...opts,
    baseURL: kql.kirbyUrl,
    method: 'POST',
    body: query,
    headers: {
      ...headersToObject(opts.headers),
      ...getAuthHeaders(kql as ModuleOptions),
    },
  })
}
