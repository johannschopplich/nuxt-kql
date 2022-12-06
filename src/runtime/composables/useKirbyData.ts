import { computed, reactive } from 'vue'
import { hash } from 'ohash'
import type { FetchError, FetchOptions } from 'ofetch'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { DEFAULT_CLIENT_ERROR, KIRBY_API_ROUTE, getAuthHeader, headersToObject } from '../utils'
import type { ModuleOptions } from '../../module'
import { useAsyncData, useNuxtApp, useRuntimeConfig } from '#imports'

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
  const nuxt = useNuxtApp()
  const { kql } = useRuntimeConfig().public
  const _uri = computed(() => resolveUnref(uri).replace(/^\//, ''))
  const key = `$kirby${hash(_uri.value)}`

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
      headers: headersToObject(headers),
    },
  })

  const _publicFetchOptions: FetchOptions = {
    baseURL: kql.url,
    headers: {
      ...headersToObject(headers),
      ...getAuthHeader({
        auth: kql.auth as ModuleOptions['auth'],
        token: kql.token,
        credentials: kql.credentials,
      }),
    },
  }

  let controller: AbortController

  return useAsyncData<T, FetchError>(
    key,
    async () => {
      controller?.abort?.()

      if (key in nuxt.payload.data)
        return nuxt.payload.data[key]

      if (key in nuxt.static.data)
        return nuxt.static.data[key]

      controller = typeof AbortController !== 'undefined'
        ? new AbortController()
        : ({} as AbortController)

      const result = (await $fetch<T>(client ? _uri.value : KIRBY_API_ROUTE, {
        ...fetchOptions,
        signal: controller.signal,
        ...(client ? _publicFetchOptions : _fetchOptions),
      })) as T

      // Workaround to persist response client-side
      // https://github.com/nuxt/framework/issues/8917
      nuxt.static.data[key] = result

      return result
    },
    asyncDataOptions,
  ) as AsyncData<T, FetchError | null | true>
}
