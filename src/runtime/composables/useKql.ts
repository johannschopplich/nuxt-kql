import { computed, reactive } from 'vue'
import { hash } from 'ohash'
import { joinURL } from 'ufo'
import type { FetchError, FetchOptions } from 'ofetch'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-fest'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { clientErrorMessage, getAuthHeader, headersToObject, kqlApiRoute } from '../utils'
import type { ModuleOptions } from '../../module'
import { useAsyncData, useRuntimeConfig } from '#imports'

export type UseKqlOptions<T> = Pick<
  AsyncDataOptions<T>,
  | 'server'
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
    server,
    lazy,
    default: defaultFn,
    immediate,
    watch,
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
    server,
    lazy,
    default: defaultFn,
    immediate,
    watch: [
      _query,
      ...(watch || []),
    ],
  }

  const baseHeaders = {
    ...headersToObject(headers),
    ...(language ? { 'X-Language': language } : {}),
  }

  const _fetchOptions = reactive<FetchOptions>({
    method: 'POST',
    body: {
      query: _query,
      headers: baseHeaders,
    },
  })

  const _publicFetchOptions = reactive<FetchOptions>({
    method: 'POST',
    body: _query,
    headers: {
      ...baseHeaders,
      ...getAuthHeader({
        auth: kql.auth as ModuleOptions['auth'],
        token: kql.token,
        credentials: kql.credentials,
      }),
    },
  })

  let controller: AbortController

  return useAsyncData<ResT, FetchError>(
    `$kql${hash(_query.value)}`,
    () => {
      controller?.abort?.()
      controller = typeof AbortController !== 'undefined' ? new AbortController() : {} as AbortController

      return $fetch(client ? joinURL(kql.url, kql.prefix) : kqlApiRoute, {
        ...fetchOptions,
        signal: controller.signal,
        ...(client ? _publicFetchOptions : _fetchOptions),
      }) as Promise<ResT>
    },
    asyncDataOptions,
  ) as AsyncData<ResT, FetchError | null | true>
}
