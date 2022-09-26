import { computed } from 'vue'
import { hash } from 'ohash'
import type { FetchError } from 'ohmyfetch'
import type { AsyncDataOptions, UseFetchOptions } from 'nuxt/app'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-fest'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { headersToObject, kqlApiRoute } from '../utils'
import { useAsyncData } from '#imports'

export type UseKqlOptions<T> = Pick<
  UseFetchOptions<T>,
  // Pick from `AsyncDataOptions`
  | 'lazy'
  | 'default'
  | 'watch'
  | 'initialCache'
  | 'immediate'
  // Pick from `FetchOptions`
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  // Pick from `globalThis.RequestInit`
  | 'headers'
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

  const {
    lazy,
    default: defaultFn,
    initialCache,
    immediate,
    ...fetchOptions
  } = opts

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[useKql] Empty KQL query')

  const asyncDataOptions: AsyncDataOptions<ResT> = {
    lazy,
    default: defaultFn,
    initialCache,
    immediate,
    watch: [
      _query,
    ],
  }

  return useAsyncData<ResT, FetchError>(`$kql${hash(_query.value)}`, () => {
    return $fetch(kqlApiRoute, {
      ...fetchOptions,
      method: 'POST',
      body: {
        query: _query.value,
        headers: {
          ...headersToObject(opts.headers),
          ...(opts.language ? { 'X-Language': opts.language } : {}),
        },
      },
    }) as Promise<ResT>
  }, asyncDataOptions)
}
