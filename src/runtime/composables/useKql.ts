import { computed, reactive } from 'vue'
import { hash } from 'ohash'
import type { FetchError } from 'ofetch'
import type { NitroFetchOptions } from 'nitropack'
import type { WatchSource } from 'vue'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import { toValue } from '@vueuse/core'
import type { MaybeRefOrGetter } from '@vueuse/core'
import { DEFAULT_CLIENT_ERROR, getAuthHeader, getProxyPath, headersToObject } from '../utils'
import { useAsyncData, useRuntimeConfig } from '#imports'

export type UseKqlOptions<T> = Omit<AsyncDataOptions<T>, 'watch'> & Pick<
  NitroFetchOptions<string>,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'headers'
  | 'retry'
  | 'retryDelay'
  | 'timeout'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   */
  language?: MaybeRefOrGetter<string>
  /**
   * Skip the Nuxt server proxy and fetch directly from the API.
   * Requires `client` to be enabled in the module options as well.
   * @default false
   */
  client?: boolean
  /**
   * Cache the response between function calls for the same query.
   * @default true
   */
  cache?: boolean
  /**
   * Watch an array of reactive sources and auto-refresh the fetch result when they change.
   * Query and language are watched by default. You can completely ignore reactive sources by using `watch: false`.
   * @default undefined
   */
  watch?: (WatchSource<unknown> | object)[] | false
}

export function useKql<
  ResT extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
>(query: MaybeRefOrGetter<ReqT>, opts: UseKqlOptions<ResT> = {}) {
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch,
    immediate,
    headers,
    language,
    client = false,
    cache = true,
    ...fetchOptions
  } = opts

  const { kql } = useRuntimeConfig().public
  const _query = computed(() => toValue(query))
  const _language = computed(() => toValue(language))

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[useKql] Empty KQL query')

  if (client && !kql.client)
    throw new Error(DEFAULT_CLIENT_ERROR)

  const asyncDataOptions: AsyncDataOptions<ResT> = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch: watch === false
      ? []
      : [
          _query,
          _language,
          ...(watch || []),
        ],
    immediate,
  }

  const _serverFetchOptions = reactive<NitroFetchOptions<string>>({
    method: 'POST',
    body: {
      query: _query,
      cache,
      headers: computed(() => ({
        ...headersToObject(headers),
        ...(_language.value && { 'X-Language': _language.value }),
      })),
    },
  })

  const _clientFetchOptions = reactive<NitroFetchOptions<string>>({
    baseURL: kql.url,
    method: 'POST',
    body: _query,
    // @ts-expect-error: Reactive value
    headers: computed(() => ({
      ...headersToObject(headers),
      ...(_language.value && { 'X-Language': _language.value }),
      ...getAuthHeader(kql),
    })),
  })

  let controller: AbortController | undefined
  const key = computed(() => `$kql${hash([_query.value, _language.value])}`)

  return useAsyncData<ResT, FetchError>(
    key.value,
    async (nuxt) => {
      controller?.abort?.()

      // Workaround to persist response client-side
      // https://github.com/nuxt/nuxt/issues/15445
      if ((nuxt!.isHydrating || cache) && key.value in nuxt!.payload.data)
        return nuxt!.payload.data[key.value]

      controller = new AbortController()

      try {
        const result = (await globalThis.$fetch<ResT>(
          client ? kql.prefix : getProxyPath(key.value),
          {
            ...fetchOptions,
            signal: controller.signal,
            ...(client ? _clientFetchOptions : _serverFetchOptions),
          },
        )) as ResT

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
  ) as AsyncData<ResT, FetchError>
}
