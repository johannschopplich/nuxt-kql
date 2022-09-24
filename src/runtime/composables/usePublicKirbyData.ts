import { computed } from 'vue'
import { hash } from 'ohash'
import type { FetchError } from 'ohmyfetch'
import type { NitroFetchRequest } from 'nitropack'
import type { AsyncData } from 'nuxt/app'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { buildAuthHeader, headersToObject } from '../utils'
import type { ModuleOptions } from '../../module'
import type { UseKirbyDataOptions } from './useKirbyData'
import { useFetch, useRuntimeConfig } from '#imports'

export function usePublicKirbyData<T = any>(
  uri: MaybeComputedRef<string>,
  opts: UseKirbyDataOptions<T> = {},
) {
  const { kql } = useRuntimeConfig().public

  if (!kql.clientRequests)
    throw new Error('Fetching Kirby data client-side isn\'t allowed. Enable it by setting "clientRequests" to "true".')

  const _uri = computed(() => resolveUnref(uri).replace(/^\//, ''))

  if (!_uri.value)
    console.error('[usePublicKql] Empty Kirby URI')

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
