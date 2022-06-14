import type { NitroFetchRequest } from 'nitropack'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import type { KqlQueryRequest, KqlQueryResponse, UseKqlOptions } from '../types'
import { assertKqlPublicConfig, getAuthHeaders } from '../utils'
import type { ModuleOptions } from '../../module'
import type { AsyncData } from '#app'
import { useFetch, useRuntimeConfig } from '#app'

export function useKql<ResT = KqlQueryResponse, ReqT = KqlQueryRequest>(
  query: Ref<ReqT> | ReqT | (() => ReqT),
  opts: UseKqlOptions<ResT> = {},
) {
  const { public: { kql } } = useRuntimeConfig()

  const _query = computed(() => {
    let q = query
    if (typeof q === 'function')
      q = (q as (() => ReqT))()

    return unref(q)
  })

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(kql.apiRoute, {
    ...opts,
    method: 'POST',
    body: { data: _query.value },
  }) as AsyncData<ResT, true | Error>
}

export function usePublicKql<ResT = KqlQueryResponse, ReqT = KqlQueryRequest>(
  query: Ref<ReqT> | ReqT | (() => ReqT),
  opts: UseKqlOptions<ResT> = {},
) {
  const { public: { kql } } = useRuntimeConfig()
  assertKqlPublicConfig(kql as ModuleOptions)

  const _query = computed(() => {
    let q = query
    if (typeof q === 'function')
      q = (q as (() => ReqT))()

    return unref(q)
  })

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(kql.kirbyEndpoint, {
    ...opts,
    baseURL: kql.kirbyUrl,
    method: 'POST',
    body: _query.value,
    headers: { ...getAuthHeaders(kql as ModuleOptions) },
  }) as AsyncData<ResT, true | Error>
}
