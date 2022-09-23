import { computed } from 'vue'
import { hash } from 'ohash'
import type { FetchError } from 'ohmyfetch'
import type { NitroFetchRequest } from 'nitropack'
import type { AsyncData, UseFetchOptions } from 'nuxt/app'
import { headersToObject, kirbyApiRoute, resolveUnref } from '../utils'
import type { MaybeComputedRef } from '../utils'
import { useFetch } from '#imports'

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
>

export function useKirbyData<T = any>(
  uri: MaybeComputedRef<string>,
  opts: UseKirbyDataOptions<T> = {},
) {
  const _uri = computed(() => resolveUnref(uri).replace(/^\//, ''))

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
