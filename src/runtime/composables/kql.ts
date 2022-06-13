import type { NitroFetchRequest } from 'nitropack'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import type { FetchOptions } from 'ohmyfetch'
import type { KqlQueryRequest, KqlQueryResponse } from '../types'
import { getAuthHeaders, normalizeHeaders } from '../utils/headers'
import type { AsyncData, UseFetchOptions } from '#app'
import { useFetch, useRuntimeConfig } from '#app'

export function useKql<ResT = KqlQueryResponse, ReqT = KqlQueryRequest>(
  query: Ref<ReqT> | ReqT | (() => ReqT),
  opts: Omit<UseFetchOptions<ResT>, 'baseURL' | 'method' | 'body' > = {},
) {
  const { public: { kql: { url, endpoint } } } = useRuntimeConfig()

  if (!endpoint)
    throw new Error('KQL endpoint is not configured')

  const _query = computed(() => {
    let q = query
    if (typeof q === 'function')
      q = (q as (() => ReqT))()

    return unref(q)
  })

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(endpoint, {
    ...opts,
    baseURL: url,
    method: 'POST',
    body: _query.value,
    headers: { ...normalizeHeaders(opts.headers), ...getAuthHeaders() },
  }) as AsyncData<ResT, true | Error>
}

export function $kql<T = KqlQueryResponse>(
  query: T,
  opts: Omit<FetchOptions, 'baseURL' | 'method' | 'body' > = {},
) {
  const { public: { kql: { url, endpoint } } } = useRuntimeConfig()

  if (!endpoint)
    throw new Error('KQL endpoint is not configured')

  return $fetch<T>(endpoint, {
    ...opts,
    baseURL: url,
    method: 'POST',
    body: query,
    headers: { ...normalizeHeaders(opts.headers), ...getAuthHeaders() },
  })
}
