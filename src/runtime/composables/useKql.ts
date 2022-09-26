import { computed } from 'vue'
import { hash } from 'ohash'
import { joinURL } from 'ufo'
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
   * Requires `client` to be enabled in the module options as well
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
    language,
    client,
    ...fetchOptions
  } = opts

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[useKql] Empty KQL query')

  if (client && !kql.client)
    throw new Error('Fetching from Kirby client-side isn\'t allowed. Enable it by setting "client" to "true".')

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
        ...(language ? { 'X-Language': language } : {}),
      },
    },
  }

  const _publicFetchOptions: FetchOptions = {
    body: _query.value,
    headers: {
      ...headersToObject(opts.headers),
      ...buildAuthHeader({
        auth: kql.auth as ModuleOptions['auth'],
        token: kql.token,
        credentials: kql.credentials,
      }),
      ...(language ? { 'X-Language': language } : {}),
    },
  }

  return useAsyncData<ResT, FetchError>(
    `$kql${hash(_query.value)}`,
    () => {
      return $fetch(client ? joinURL(kql.url, kql.prefix) : kqlApiRoute, {
        ...fetchOptions,
        method: 'POST',
        ...(client ? _publicFetchOptions : _fetchOptions),
      }) as Promise<ResT>
    },
    asyncDataOptions,
  )
}
