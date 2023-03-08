import { computed, reactive } from 'vue'
import { hash } from 'ohash'
import type { FetchError } from 'ofetch'
import type { NitroFetchOptions } from 'nitropack'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { DEFAULT_CLIENT_ERROR, getAuthHeader, getProxyPath, headersToObject } from '../utils'
import { useAsyncData, useRuntimeConfig } from '#imports'

type UseKirbyDataOptions<T> = AsyncDataOptions<T> & Pick<
  NitroFetchOptions<string>,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'headers'
> & {
  /**
   * Skip the Nuxt server proxy and fetch directly from the API.
   * Requires `client` to be enabled in the module options as well.
   * @default false
   */
  client?: boolean
  /**
   * Cache the response between function calls for the same URI
   * @default true
   */
  cache?: boolean
}

export function useKirbyData<T = any>(
  uri: MaybeComputedRef<string>,
  opts: UseKirbyDataOptions<T> = {},
) {
  const { kql } = useRuntimeConfig().public
  const _uri = computed(() => resolveUnref(uri).replace(/^\//, ''))

  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch,
    immediate,
    headers,
    client = false,
    cache = true,
    ...fetchOptions
  } = opts

  if (!_uri.value)
    console.warn('[useKirbyData] Empty Kirby URI')

  if (client && !kql.client)
    throw new Error(DEFAULT_CLIENT_ERROR)

  const baseHeaders = headersToObject(headers)

  const asyncDataOptions: AsyncDataOptions<T> = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch: [
      _uri,
      ...(watch || []),
    ],
    immediate,
  }

  const _serverFetchOptions = reactive<NitroFetchOptions<string>>({
    method: 'POST',
    body: {
      uri: _uri,
      cache,
      headers: Object.keys(baseHeaders).length ? baseHeaders : undefined,
    },
  })

  const _clientFetchOptions: NitroFetchOptions<string> = {
    baseURL: kql.url,
    headers: {
      ...baseHeaders,
      ...getAuthHeader(kql),
    },
  }

  let controller: AbortController
  const key = computed(() => `$kirby${hash(_uri.value)}`)

  return useAsyncData<T, FetchError>(
    key.value,
    async (nuxt) => {
      controller?.abort?.()

      // Workaround to persist response client-side
      // https://github.com/nuxt/nuxt/issues/15445
      if ((nuxt!.isHydrating || cache) && key.value in nuxt!.payload.data)
        return nuxt!.payload.data[key.value]

      controller = typeof AbortController !== 'undefined'
        ? new AbortController()
        : ({} as AbortController)

      const result = (await globalThis.$fetch<T>(
        client ? _uri.value : getProxyPath(key.value),
        {
          ...fetchOptions,
          signal: controller.signal,
          ...(client ? _clientFetchOptions : _serverFetchOptions),
        },
      )) as T

      if (cache)
        nuxt!.payload.data[key.value] = result

      return result
    },
    asyncDataOptions,
  ) as AsyncData<T, FetchError>
}
