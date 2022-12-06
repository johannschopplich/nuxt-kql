import { computed, reactive } from 'vue'
import { hash } from 'ohash'
import { joinURL } from 'ufo'
import type { FetchError, FetchOptions } from 'ofetch'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { clientErrorMessage, getAuthHeader, headersToObject, kirbyApiRoute } from '../utils'
import type { ModuleOptions } from '../../module'
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
    throw new Error(clientErrorMessage)

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

  const _publicFetchOptions = {
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
    `$kirby${hash(_uri.value)}`,
    () => {
      controller?.abort?.()
      controller = typeof AbortController !== 'undefined' ? new AbortController() : {} as AbortController

      return $fetch(client ? joinURL(kql.url, _uri.value) : kirbyApiRoute, {
        ...fetchOptions,
        signal: controller.signal,
        ...(client ? _publicFetchOptions : _fetchOptions),
      }) as Promise<T>
    },
    asyncDataOptions,
  ) as AsyncData<T, FetchError | null | true>
}
