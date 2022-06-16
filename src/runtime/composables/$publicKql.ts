import type { KqlPublicFetchOptions, KqlQueryRequest, KqlQueryResponse } from '../types'
import { assertKqlPublicConfig, getAuthHeaders, headersToObject } from '../utils'
import type { ModuleOptions } from '../../module'
import { useRuntimeConfig } from '#app'

export function $publicKql<T = KqlQueryResponse>(
  query: KqlQueryRequest,
  opts: KqlPublicFetchOptions = {},
): Promise<T> {
  const { public: { kql } } = useRuntimeConfig()
  assertKqlPublicConfig(kql as ModuleOptions)

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
