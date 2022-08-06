import { computed, unref } from 'vue'
import { hash } from 'ohash'
import type { Ref } from 'vue'
import type { NitroFetchRequest } from 'nitropack'
import type { AsyncData, UseFetchOptions } from 'nuxt/app'
import { headersToObject } from '../utils'
import type { KirbyQueryRequest, KirbyQueryResponse } from '#nuxt-kql'
import { useFetch } from '#imports'
import { apiRoute } from '#build/nuxt-kql/options'

export type UseKqlOptions<T> = Omit<
  UseFetchOptions<T>,
  | 'baseURL'
  | 'params'
  | 'parseResponse'
  | 'pick'
  | 'responseType'
  | 'response'
  | 'transform'
  | keyof Omit<globalThis.RequestInit, 'headers'>
> & {
  /**
   * Language code to fetch data for in multilang Kirby setups
   */
  language?: string
}

export function useKql<
  ResT extends KirbyQueryResponse = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
>(query: (() => ReqT) | ReqT | Ref<ReqT>, opts: UseKqlOptions<ResT> = {}) {
  const _query = computed(() => typeof query === 'function'
    ? (query as () => ReqT)()
    : unref(query))

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[useKql] Empty KQL query')

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(apiRoute, {
    ...opts,
    key: hash(_query.value),
    method: 'POST',
    body: {
      query: _query.value,
      headers: {
        ...headersToObject(opts.headers),
        ...(opts.language ? { 'X-Language': opts.language } : {}),
      },
    },
  }) as AsyncData<ResT, true | Error>
}
