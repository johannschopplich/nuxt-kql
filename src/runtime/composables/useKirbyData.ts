import { computed, reactive } from 'vue'
import { hash } from 'ohash'
import type { FetchError, FetchOptions } from 'ofetch'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { DEFAULT_CLIENT_ERROR, KIRBY_API_ROUTE, getAuthHeader, headersToObject } from '../utils'
import { useAsyncData, useRuntimeConfig } from '#imports'

type UseKirbyDataOptions<T> = Pick<
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
   * Skip the Nuxt server proxy and fetch directly from the API
   * Requires `client` to be enabled in the module options as well
   */
  client?: boolean
}

export function useKirbyData<T = any>(
  uri: MaybeComputedRef<string>,
  opts: UseKirbyDataOptions<T> = {},
) {
  const { kql } = useRuntimeConfig().public
  const _uri = computed(() => resolveUnref(uri).replace(/^\//, ''))
  const key = computed(() => `$kirby${hash(_uri.value)}`)

  const {
    server,
    lazy,
    default: defaultFn,
    immediate,
    watch,
    headers,
    client,
    ...fetchOptions
  } = opts

  if (!_uri.value)
    console.error('[useKirbyData] Empty Kirby URI')

  if (client && !kql.client)
    throw new Error(DEFAULT_CLIENT_ERROR)

  const baseHeaders = headersToObject(headers)

  const asyncDataOptions: AsyncDataOptions<T> = {
    server,
    lazy,
    default: defaultFn,
    immediate,
    watch: [
      _uri,
      ...(watch || []),
    ],
  }

  const _fetchOptions = reactive<FetchOptions>({
    method: 'POST',
    body: {
      uri: _uri,
      headers: Object.keys(baseHeaders).length ? baseHeaders : undefined,
    },
  })

  const _publicFetchOptions: FetchOptions = {
    baseURL: kql.url,
    headers: {
      ...baseHeaders,
      ...getAuthHeader(kql),
    },
  }

  let controller: AbortController

  return useAsyncData<T, FetchError>(
    key.value,
    async (nuxt) => {
      controller?.abort?.()

      // Workaround to persist response client-side
      // https://github.com/nuxt/framework/issues/8917
      if (key.value in nuxt!.static.data)
        return nuxt!.static.data[key.value]

      controller = typeof AbortController !== 'undefined'
        ? new AbortController()
        : ({} as AbortController)

      const result = (await $fetch<T>(
        client ? _uri.value : KIRBY_API_ROUTE,
        {
          ...fetchOptions,
          signal: controller.signal,
          ...(client ? _publicFetchOptions : _fetchOptions),
        },
      )) as T

      nuxt!.static.data[key.value] = result

      return result
    },
    asyncDataOptions,
  ) as AsyncData<T, FetchError | null | true>
}
