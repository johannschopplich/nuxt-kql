import { computed, reactive } from 'vue'
import { hash } from 'ohash'
import type { FetchError, FetchOptions } from 'ofetch'
import type { NitroFetchOptions } from 'nitropack'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-fest'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { DEFAULT_CLIENT_ERROR, getAuthHeader, getProxyPath, headersToObject } from '../utils'
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
   * Language code to fetch data for in multi-language Kirby setups
   */
  language?: string
  /**
   * Skip the Nuxt server proxy and fetch directly from the API
   * Requires `client` to be enabled in the module options as well
   */
  client?: boolean
  /**
   * Cache the response between function calls for the same query
   * @default true
   */
  cache?: boolean
}

export function useKql<
  ResT extends KirbyQueryResponse = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
>(query: MaybeComputedRef<ReqT>, opts: UseKqlOptions<ResT> = {}) {
  const { kql } = useRuntimeConfig().public
  const _query = computed(() => resolveUnref(query))
  const key = computed(() => `$kql${hash(_query.value)}`)

  const {
    server,
    lazy,
    default: defaultFn,
    immediate,
    watch,
    headers,
    language,
    client = false,
    cache = true,
    ...fetchOptions
  } = opts

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[useKql] Empty KQL query')

  if (client && !kql.client)
    throw new Error(DEFAULT_CLIENT_ERROR)

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
    ...(language && { 'X-Language': language }),
  }

  const _fetchOptions = reactive<NitroFetchOptions<string>>({
    method: 'POST',
    body: {
      query: _query,
      cache,
      headers: Object.keys(baseHeaders).length ? baseHeaders : undefined,
    },
  })

  const _publicFetchOptions = reactive<NitroFetchOptions<string>>({
    baseURL: kql.url,
    method: 'POST',
    body: _query,
    headers: {
      ...baseHeaders,
      ...getAuthHeader(kql),
    },
  })

  let controller: AbortController

  return useAsyncData<ResT, FetchError>(
    key.value,
    async (nuxt) => {
      controller?.abort?.()

      // Workaround to persist response client-side
      // https://github.com/nuxt/framework/issues/8917
      if ((nuxt!.isHydrating || cache) && key.value in nuxt!.payload.data)
        return nuxt!.payload.data[key.value]

      controller = typeof AbortController !== 'undefined'
        ? new AbortController()
        : ({} as AbortController)

      const result = (await $fetch<ResT>(
        client ? kql.prefix : getProxyPath(key.value),
        {
          ...fetchOptions,
          signal: controller.signal,
          ...(client ? _publicFetchOptions : _fetchOptions),
        },
      )) as ResT

      if (cache)
        nuxt!.payload.data[key.value] = result

      return result
    },
    asyncDataOptions,
  ) as AsyncData<ResT, FetchError | null | true>
}
