import { computed } from 'vue'
import { hash } from 'ohash'
import type { FetchError, FetchOptions } from 'ohmyfetch'
import type { AsyncDataOptions, UseFetchOptions } from 'nuxt/app'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-fest'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { buildAuthHeader, headersToObject, kqlApiRoute } from '../utils'
import type { ModuleOptions } from '../../module'
import { useAsyncData, useRuntimeConfig } from '#imports'

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
  /**
   * Skip the Nuxt server proxy and fetch directly from the API
   * Requires `clientRequests` to be enabled in the module options
   */
  client?: boolean
}

export function useKql<
  ResT extends KirbyQueryResponse = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
>(query: MaybeComputedRef<ReqT>, opts: UseKqlOptions<ResT> = {}) {
  const { kql } = useRuntimeConfig().public
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

  if (opts.client && !kql.clientRequests)
    throw new Error('Fetching from Kirby client-side isn\'t allowed. Enable it by setting "clientRequests" to "true".')

  const asyncDataOptions: AsyncDataOptions<ResT> = {
    lazy,
    default: defaultFn,
    initialCache,
    immediate,
    watch: [
      _query,
    ],
  }

  const _fetchOptions: FetchOptions = {
    body: {
      query: _query.value,
      headers: {
        ...headersToObject(opts.headers),
        ...(opts.language ? { 'X-Language': opts.language } : {}),
      },
    },
  }

  const _publicFetchOptions: FetchOptions = {
    baseURL: kql.url,
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
  }

  return useAsyncData<ResT, FetchError>(`$kql${hash(_query.value)}`, () => {
    return $fetch(opts.client ? kql.prefix as string : kqlApiRoute, {
      ...fetchOptions,
      method: 'POST',
      ...opts.client ? _publicFetchOptions : _fetchOptions,
    }) as Promise<ResT>
  }, asyncDataOptions)
}
