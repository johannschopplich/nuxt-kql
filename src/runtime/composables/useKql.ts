import { computed } from 'vue'
import { hash } from 'ohash'
import type { FetchError } from 'ohmyfetch'
import type { NitroFetchRequest } from 'nitropack'
import type { AsyncData, UseFetchOptions } from 'nuxt/app'
import type { MaybeComputedRef } from '../utils'
import { headersToObject, resolveUnref } from '../utils'
import { useFetch } from '#imports'
import { apiRoute } from '#build/nuxt-kql/options'
import type { KirbyQueryRequest, KirbyQueryResponse } from '#nuxt-kql'

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
>(query: MaybeComputedRef<ReqT>, opts: UseKqlOptions<ResT> = {}) {
  const _query = computed(() => resolveUnref(query))

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[useKql] Empty KQL query')

  return useFetch<ResT, FetchError, NitroFetchRequest, ResT>(apiRoute, {
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
  }) as AsyncData<ResT, true | FetchError>
}
