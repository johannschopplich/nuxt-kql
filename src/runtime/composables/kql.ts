import { hash as ohash } from 'ohash'
import type { KqlPrivateFetchOptions, KqlPublicFetchOptions, KqlQueryRequest, KqlQueryResponse } from '../types'
import { assertKqlPublicConfig, getAuthHeaders, normalizeHeaders } from '../utils'
import type { ModuleOptions } from '../../module'
import { useRuntimeConfig } from '#app'

interface InternalState<T> {
  promiseMap: Map<string, Promise<T>>
}

export function $kql<T = KqlQueryResponse>(
  query: KqlQueryRequest,
  options: KqlPrivateFetchOptions = {},
): Promise<T> {
  const { cache = true } = options
  const { public: { kql } } = useRuntimeConfig()

  const nuxt = useNuxtApp()
  const queries: Record<string, T> = nuxt.payload.kqlQueries = (nuxt.payload.kqlQueries || {})

  const state = (nuxt.__kql__ || {}) as InternalState<T>
  state.promiseMap = state.promiseMap || new Map()

  const body = { data: query }

  if (!cache) {
    return $fetch<T>(kql.apiRoute, {
      method: 'POST',
      body,
    })
  }

  const key = ohash(query)

  if (key in queries)
    return Promise.resolve(queries[key])

  if (state.promiseMap.has(key))
    return state.promiseMap.get(key)

  const request = $fetch<T>(kql.apiRoute, { method: 'POST', body })
    .then((r) => {
      queries[key] = r
      state.promiseMap.delete(key)
      return r
    })

  state.promiseMap.set(key, request)

  return request
}

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
    headers: { ...normalizeHeaders(opts.headers), ...getAuthHeaders(kql as ModuleOptions) },
  })
}
