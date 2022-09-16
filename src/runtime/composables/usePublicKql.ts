import { computed } from 'vue'
import { hash } from 'ohash'
import type { FetchError } from 'ohmyfetch'
import type { NitroFetchRequest } from 'nitropack'
import type { AsyncData, UseFetchOptions } from 'nuxt/app'
import type { ModuleOptions } from '../../module'
import type { MaybeComputedRef } from '../utils'
import { buildAuthHeader, headersToObject, resolveUnref } from '../utils'
import { useFetch, useRuntimeConfig } from '#imports'
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

export function usePublicKql<
  ResT extends KirbyQueryResponse = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
>(query: MaybeComputedRef<ReqT>, opts: UseKqlOptions<ResT> = {}) {
  const { kql } = useRuntimeConfig().public

  if (!kql.clientRequests)
    throw new Error('Fetching queries client-side isn\'t allowed. Enable it by setting "clientRequests" to "true".')

  const _query = computed(() => resolveUnref(query))

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[usePublicKql] Empty KQL query')

  return useFetch<ResT, FetchError, NitroFetchRequest, ResT>(kql.prefix, {
    ...opts,
    key: hash(_query.value),
    baseURL: kql.url,
    method: 'POST',
    body: _query.value,
    headers: {
      ...headersToObject(opts.headers),
      ...buildAuthHeader({
        auth: kql.auth as ModuleOptions['auth'],
        token: kql.token,
        credentials: kql.credentials,
      }),
      ...(opts.language ? { 'X-Language': opts.language } : {}),
    },
  }) as AsyncData<ResT, true | FetchError>
}
