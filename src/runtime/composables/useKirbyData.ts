import type { NitroFetchOptions } from 'nitropack'
import type { AsyncData, AsyncDataOptions, NuxtError } from 'nuxt/app'
import type { MaybeRefOrGetter, MultiWatchSources } from 'vue'
import type { ModuleOptions } from '../../module'
import { useAsyncData, useRequestFetch, useRuntimeConfig } from '#imports'
import { hash } from 'ohash'
import { joinURL } from 'ufo'
import { computed, toValue } from 'vue'
import { createAuthHeader, getProxyPath, headersToObject } from '../utils'

// #region options
type UseKirbyDataOptions<T> = Omit<AsyncDataOptions<T>, 'watch'> & Pick<
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
  | 'retryStatusCodes'
  | 'timeout'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   */
  language?: MaybeRefOrGetter<string>
  /**
   * Cache the response between function calls for the same path.
   * @default true
   */
  cache?: boolean
  /**
   * Watch an array of reactive sources and auto-refresh the fetch result when they change.
   * Path and language are watched by default. You can completely ignore reactive sources by using `watch: false`.
   * @default undefined
   */
  watch?: MultiWatchSources | false
}
// #endregion options

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
    watch: watchSources,
    immediate,
    query,
    headers,
    method,
    body,
    language,
    cache = true,
    ...fetchOptions
  } = opts

  const kql = useRuntimeConfig().public.kql as Required<ModuleOptions>
  const _language = computed(() => toValue(language))
  const _path = computed(() => {
    const value = toValue(path).replace(/^\//, '')
    return _language.value ? joinURL(_language.value, value) : value
  })
  const key = computed(() => `$kirby${hash([
    _path.value,
    query,
    method,
  ])}`)

  if (!_path.value || (_language.value && !_path.value.replace(new RegExp(`^${_language.value}/`), '')))
    console.warn('[useKirbyData] Empty Kirby path')

  const asyncDataOptions: AsyncDataOptions<T> = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch: watchSources === false ? [] : [...(watchSources || []), key],
    immediate,
  }

  let controller: AbortController | undefined

  return useAsyncData<T, unknown>(
    watchSources === false ? key.value : key,
    async (nuxt) => {
      controller?.abort?.()

      if (nuxt && (nuxt.isHydrating || cache) && nuxt.payload.data[key.value])
        return nuxt.payload.data[key.value]

      controller = new AbortController()

      try {
        let result: T | undefined

        if (kql.client) {
          result = (await useRequestFetch()<T>(_path.value, {
            ...fetchOptions,
            signal: controller.signal,
            baseURL: kql.url,
            query,
            headers: {
              ...headersToObject(headers),
              ...createAuthHeader(kql),
            },
            method,
            body,
          })) as T
        }
        else {
          result = (await useRequestFetch()<T>(getProxyPath(key.value), {
            ...fetchOptions,
            signal: controller.signal,
            method: 'POST',
            body: {
              path: _path.value,
              query,
              headers: headersToObject(headers),
              method,
              body,
              cache,
            },
          })) as T
        }

        if (nuxt && cache)
          nuxt.payload.data[key.value] = result

        return result
      }
      catch (error) {
        // Invalidate cache if request fails
        if (nuxt)
          nuxt.payload.data[key.value] = undefined

        throw error
      }
    },
    asyncDataOptions,
  ) as AsyncData<T | undefined, NuxtError>
}
