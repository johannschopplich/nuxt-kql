import type { NitroFetchRequest } from 'nitropack'
import { computed, unref } from 'vue'
import type { Ref } from 'vue'
import type { AsyncData, UseFetchOptions } from 'nuxt/app'
import type { KirbyQueryRequest, KirbyQueryResponse } from '../types'
import type { ModuleOptions } from '../../module'
import { getAuthHeaders } from '../utils'
import { useFetch, useRuntimeConfig } from '#imports'

export type UseKqlOptions<T> = Omit<UseFetchOptions<T>, 'baseURL' | 'body' | 'params' | 'parseResponse' | 'responseType' | 'response'>

export function usePublicKql<
  ResT extends KirbyQueryResponse = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
>(query: Ref<ReqT> | ReqT, opts: UseKqlOptions<ResT> = {}) {
  const { kql } = useRuntimeConfig().public

  if (!kql?.clientRequests)
    throw new Error('Fetching queries client-side isn\'t allowed. Enable it by setting `clientRequests` to `true`.')

  const _query = computed(() => unref(query))

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[usePublicKql] Empty KQL query')

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(kql.prefix, {
    ...opts,
    baseURL: kql.url,
    method: 'POST',
    body: _query.value,
    headers: getAuthHeaders(kql as ModuleOptions),
  }) as AsyncData<ResT, true | Error>
}
