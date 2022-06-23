import { computed, unref } from 'vue'
import type { Ref } from 'vue'
import type { NitroFetchRequest } from 'nitropack'
import type { AsyncData, UseFetchOptions } from 'nuxt/app'
import type { KirbyQueryRequest, KirbyQueryResponse } from '../types'
import { useFetch } from '#imports'
import { apiRoute } from '#build/nuxt-kql/options'

export type UseKqlOptions<T> = Omit<UseFetchOptions<T>, 'baseURL' | 'body' | 'params' | 'parseResponse' | 'responseType' | 'response'>

export function useKql<
  ResT extends KirbyQueryResponse = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
>(query: Ref<ReqT> | ReqT, opts: UseKqlOptions<ResT> = {}) {
  const _query = computed(() => unref(query))

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[useKql] Empty KQL query')

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(apiRoute, {
    ...opts,
    method: 'POST',
    body: { query: _query.value },
  }) as AsyncData<ResT, true | Error>
}
