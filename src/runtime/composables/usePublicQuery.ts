import type { NitroFetchRequest } from 'nitropack'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import type { AsyncData } from 'nuxt/app'
import type { KirbyQueryRequest, KirbyQueryResponse, UseQueryOptions } from '../types'
import type { ModuleOptions } from '../../module'
import { getAuthHeaders } from '../utils'
import { useFetch, useRuntimeConfig } from '#imports'

export function usePublicQuery<ResT = KirbyQueryResponse, ReqT = KirbyQueryRequest>(
  query: Ref<ReqT> | ReqT,
  opts: UseQueryOptions<ResT> = {},
) {
  const { kql } = useRuntimeConfig().public
  if (!kql.clientRequests)
    throw new Error('Fetching queries client-side isn\'t allowed. Enable it by setting `clientRequests` to `true`.')

  const _query = computed(() => unref(query))

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(kql.kirbyEndpoint, {
    ...opts,
    baseURL: kql.kirbyUrl,
    method: 'POST',
    body: _query.value,
    headers: { ...getAuthHeaders(kql as ModuleOptions) },
  }) as AsyncData<ResT, true | Error>
}
