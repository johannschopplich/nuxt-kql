import type { NitroFetchRequest } from 'nitropack'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import type { KqlQueryRequest, KqlQueryResponse, UseKqlOptions } from '../types'
import type { ModuleOptions } from '../../module'
import { getAuthHeaders } from '../utils'
import type { AsyncData } from '#app'
import { useFetch, useRuntimeConfig } from '#imports'
import { apiRoute } from '#build/nuxt-kql/options'

export function useKql<ResT = KqlQueryResponse, ReqT = KqlQueryRequest>(
  query: Ref<ReqT> | ReqT,
  opts: UseKqlOptions<ResT> = {},
) {
  const _query = computed(() => unref(query))

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(apiRoute, {
    ...opts,
    method: 'POST',
    body: { data: _query.value },
  }) as AsyncData<ResT, true | Error>
}

export function usePublicKql<ResT = KqlQueryResponse, ReqT = KqlQueryRequest>(
  query: Ref<ReqT> | ReqT,
  opts: UseKqlOptions<ResT> = {},
) {
  const { kql } = useRuntimeConfig().public
  if (!kql.clientRequests)
    throw new Error('Fetching from Kirby client-side isn\'t allowed. Enable it by setting `clientRequests` to `true`.')

  const _query = computed(() => unref(query))

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(kql.kirbyEndpoint, {
    ...opts,
    baseURL: kql.kirbyUrl,
    method: 'POST',
    body: _query.value,
    headers: { ...getAuthHeaders(kql as ModuleOptions) },
  }) as AsyncData<ResT, true | Error>
}
