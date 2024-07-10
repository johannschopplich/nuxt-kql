import { computed, toValue } from 'vue'
import { hash } from 'ohash'
import type { NitroFetchOptions } from 'nitropack'
import type { MaybeRefOrGetter, WatchSource } from 'vue'
import type { AsyncData, AsyncDataOptions, NuxtError } from 'nuxt/app'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { ModuleOptions } from '../../module'
import { createAuthHeader, getProxyPath, headersToObject } from '../utils'
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    cache = true,
    ...fetchOptions
  } = opts

  const kql = useRuntimeConfig().public.kql as Required<ModuleOptions>
  const _query = computed(() => toValue(query))
  const _language = computed(() => toValue(language))
  const key = computed(() => `$kql${hash([_query.value, _language.value])}`)

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[useKql] Empty KQL query')

  const asyncDataOptions: AsyncDataOptions<ResT> = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch: watch === false
      ? []
      : [
          // Key contains query and language
          key,
          ...(watch || []),
        ],
    immediate,
  }

  let controller: AbortController | undefined

  return useAsyncData<ResT, unknown>(
    key.value,
    async (nuxt) => {
      controller?.abort?.()

      if (nuxt && (nuxt.isHydrating || cache) && nuxt.payload.data[key.value])
        return nuxt!.payload.data[key.value]

      controller = new AbortController()

      try {
        let result: ResT | undefined

        if (kql.client) {
          result = (await globalThis.$fetch<ResT>(kql.prefix, {
            ...fetchOptions,
            signal: controller.signal,
            baseURL: kql.url,
            method: 'POST',
            body: _query.value,
            headers: {
              ...headersToObject(headers),
              ...createAuthHeader(kql),
              ...(_language.value && { 'X-Language': _language.value }),
            },
          })) as ResT
        }
        else {
          result = (await globalThis.$fetch<ResT>(getProxyPath(key.value), {
            ...fetchOptions,
            signal: controller.signal,
            method: 'POST',
            body: {
              query: _query.value,
              cache,
              headers: {
                ...headersToObject(headers),
                ...(_language.value && { 'X-Language': _language.value }),
              },
            },
          })) as ResT
        }

        if (nuxt && cache)
          nuxt.payload.data[key.value] = result

        return result
      }
      catch (error) {
        // Invalidate cache if request fails
        if (nuxt) nuxt.payload.data[key.value] = undefined

        throw error
      }
    },
    asyncDataOptions,
  ) as AsyncData<ResT | null, NuxtError>
}
