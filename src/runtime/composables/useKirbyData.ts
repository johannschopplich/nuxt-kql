import { computed } from 'vue'
import { hash } from 'ohash'
import type { FetchError } from 'ohmyfetch'
import type { NitroFetchRequest } from 'nitropack'
import type { AsyncData, UseFetchOptions } from 'nuxt/app'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { buildAuthHeader, headersToObject, kirbyApiRoute } from '../utils'
import type { ModuleOptions } from '../../module'
import { useFetch, useRuntimeConfig } from '#imports'

export type UseKirbyDataOptions<T> = Omit<
  UseFetchOptions<T>,
  | 'baseURL'
  | 'params'
  | 'parseResponse'
  | 'pick'
  | 'responseType'
  | 'response'
  | 'transform'
  | keyof Omit<globalThis.RequestInit, 'headers'>
> & {
  /**
   * Enable client-side requests to the API
   */
  client?: boolean
}

export function useKirbyData<T = any>(
  uri: MaybeComputedRef<string>,
  opts: UseKirbyDataOptions<T> = {},
) {
  const _uri = computed(() => resolveUnref(uri).replace(/^\//, ''))

  if (!_uri.value)
    console.error('[useKirbyData] Empty Kirby URI')

  if (opts.client) {
    const { kql } = useRuntimeConfig().public

    if (!kql.clientRequests)
      throw new Error('Fetching from Kirby client-side isn\'t allowed. Enable it by setting "clientRequests" to "true".')

    return useFetch<T, FetchError, NitroFetchRequest, T>(_uri.value, {
      ...opts,
      key: hash(_uri.value),
      baseURL: kql.url,
      headers: {
        ...headersToObject(opts.headers),
        ...buildAuthHeader({
          auth: kql.auth as ModuleOptions['auth'],
          token: kql.token,
          credentials: kql.credentials,
        }),
      },
    }) as AsyncData<T, true | FetchError>
  }

  return useFetch<T, FetchError, NitroFetchRequest, T>(kirbyApiRoute, {
    ...opts,
    key: hash(_uri.value),
    method: 'POST',
    body: {
      uri: _uri.value,
      headers: headersToObject(opts.headers),
    },
  }) as AsyncData<T, true | FetchError>
}
