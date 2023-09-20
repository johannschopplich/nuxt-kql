import { computed, reactive } from 'vue'
import { joinURL } from 'ufo'
import { hash } from 'ohash'
import type { FetchError } from 'ofetch'
import type { NitroFetchOptions } from 'nitropack'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import { toValue } from '@vueuse/core'
import type { MaybeRefOrGetter } from '@vueuse/core'
import { DEFAULT_CLIENT_ERROR, getAuthHeader, getProxyPath, headersToObject } from '../utils'
import { useAsyncData, useRuntimeConfig } from '#imports'

type UseKirbyDataOptions<T> = AsyncDataOptions<T> & Pick<
  NitroFetchOptions<string>,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'query'
  | 'headers'
  | 'method'
  | 'body'
  | 'retry'
  | 'retryDelay'
  | 'timeout'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   */
  language?: string
  /**
   * Skip the Nuxt server proxy and fetch directly from the API.
   * Requires `client` to be enabled in the module options as well.
   * @default false
   */
  client?: boolean
  /**
   * Cache the response between function calls for the same path.
   * @default true
   */
  cache?: boolean
}

export function useKirbyData<T = any>(
  path: MaybeRefOrGetter<string>,
  opts: UseKirbyDataOptions<T> = {},
) {
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch,
    immediate,
    query,
    headers,
    method,
    body,
    language,
    client = false,
    cache = true,
    ...fetchOptions
  } = opts

  const { kql } = useRuntimeConfig().public
  const _path = computed(() => {
    const value = toValue(path).replace(/^\//, '')
    return language ? joinURL(language, value) : value
  })

  if (!_path.value || (language && !_path.value.replace(new RegExp(`^${language}/`), '')))
    console.warn('[useKirbyData] Empty Kirby path')

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
      _path,
      ...(watch || []),
    ],
    immediate,
  }

  const _serverFetchOptions = reactive<NitroFetchOptions<string>>({
    method: 'POST',
    body: {
      path: _path,
      query,
      headers: Object.keys(baseHeaders).length ? baseHeaders : undefined,
      method,
      body,
      cache,
    },
  })

  const _clientFetchOptions: NitroFetchOptions<string> = {
    baseURL: kql.url,
    query,
    headers: {
      ...baseHeaders,
      ...getAuthHeader(kql),
    },
    method,
    body,
  }

  let controller: AbortController | undefined
  const key = computed(() => `$kirby${hash([
    _path.value,
    query,
    method,
    body,
    language,
  ])}`)

  return useAsyncData<T, FetchError>(
    key.value,
    async (nuxt) => {
      controller?.abort?.()

      // Workaround to persist response client-side
      // https://github.com/nuxt/nuxt/issues/15445
      if ((nuxt!.isHydrating || cache) && key.value in nuxt!.payload.data)
        return nuxt!.payload.data[key.value]

      controller = new AbortController()

      try {
        const result = (await globalThis.$fetch<T>(
          client ? _path.value : getProxyPath(key.value),
          {
            ...fetchOptions,
            signal: controller.signal,
            ...(client ? _clientFetchOptions : _serverFetchOptions),
          },
        )) as T

        if (cache)
          nuxt!.payload.data[key.value] = result

        return result
      }
      catch (error) {
        // Invalidate cache if request fails
        if (key.value in nuxt!.payload.data)
          delete nuxt!.payload.data[key.value]

        throw error
      }
    },
    asyncDataOptions,
  ) as AsyncData<T, FetchError>
}
