import { computed } from 'vue'
import { hash } from 'ohash'
import { joinURL } from 'ufo'
import type { FetchError, FetchOptions } from 'ohmyfetch'
import type { AsyncDataOptions, UseFetchOptions } from 'nuxt/app'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { buildAuthHeader, clientErrorMessage, headersToObject, kirbyApiRoute } from '../utils'
import type { ModuleOptions } from '../../module'
import { useAsyncData, useRuntimeConfig } from '#imports'

export type UseKirbyDataOptions<T> = Pick<
  UseFetchOptions<T>,
  // Pick from `AsyncDataOptions`
  | 'lazy'
  | 'default'
  | 'watch'
  | 'initialCache'
  | 'immediate'
  // Pick from `FetchOptions`
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

  const {
    lazy,
    default: defaultFn,
    initialCache,
    immediate,
    client,
    ...fetchOptions
  } = opts

  if (!_uri.value)
    console.error('[useKirbyData] Empty Kirby URI')

  if (client && !kql.client)
    throw new Error(clientErrorMessage)

  const asyncDataOptions: AsyncDataOptions<T> = {
    lazy,
    default: defaultFn,
    initialCache,
    immediate,
    watch: [
      _uri,
    ],
  }

  const _fetchOptions: FetchOptions = {
    method: 'POST',
    body: {
      uri: _uri.value,
      headers: headersToObject(opts.headers),
    },
  }

  const _publicFetchOptions: FetchOptions = {
    headers: {
      ...headersToObject(opts.headers),
      ...buildAuthHeader({
        auth: kql.auth as ModuleOptions['auth'],
        token: kql.token,
        credentials: kql.credentials,
      }),
    },
  }

  return useAsyncData<T, FetchError>(
    `$kirby${hash(_uri.value)}`,
    () => {
      return $fetch(client ? joinURL(kql.url, _uri.value) : kirbyApiRoute, {
        ...fetchOptions,
        ...(client ? _publicFetchOptions : _fetchOptions),
      }) as Promise<T>
    },
    asyncDataOptions,
  )
}
