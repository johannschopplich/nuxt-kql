import { computed, unref } from 'vue'
import { hash } from 'ohash'
import { joinURL } from 'ufo'
import type { FetchError, FetchOptions } from 'ofetch'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-fest'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { buildAuthHeader, clientErrorMessage, headersToObject, kqlApiRoute } from '../utils'
import type { ModuleOptions } from '../../module'
import { useAsyncData, useRuntimeConfig } from '#imports'

export type UseKqlOptions<T> = Pick<
  AsyncDataOptions<T>,
  | 'lazy'
  | 'default'
  | 'watch'
  | 'immediate'
> & Pick<
  FetchOptions,
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
    immediate,
    headers,
    language,
    client,
    ...fetchOptions
  } = opts

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[useKql] Empty KQL query')

  if (client && !kql.client)
    throw new Error(clientErrorMessage)

  const asyncDataOptions: AsyncDataOptions<ResT> = {
    lazy,
    default: defaultFn,
    immediate,
    watch: [
      _query,
    ],
  }

  const _fetchOptions: FetchOptions = {
    body: {
      query: _query.value,
      headers: {
        ...headersToObject(unref(headers)),
        ...(language ? { 'X-Language': language } : {}),
      },
    },
  }

  const _publicFetchOptions: FetchOptions = {
    body: _query.value,
    headers: {
      ...headersToObject(unref(headers)),
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
  ) as AsyncData<ResT, FetchError | null | true>
}
