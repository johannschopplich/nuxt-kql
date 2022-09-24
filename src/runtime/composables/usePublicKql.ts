import { computed } from 'vue'
import { hash } from 'ohash'
import type { FetchError } from 'ohmyfetch'
import type { NitroFetchRequest } from 'nitropack'
import type { AsyncData } from 'nuxt/app'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-fest'
import { resolveUnref } from '@vueuse/core'
import type { MaybeComputedRef } from '@vueuse/core'
import { buildAuthHeader, headersToObject } from '../utils'
import type { ModuleOptions } from '../../module'
import type { UseKqlOptions } from './useKql'
import { useFetch, useRuntimeConfig } from '#imports'

export function usePublicKql<
  ResT extends KirbyQueryResponse = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
>(query: MaybeComputedRef<ReqT>, opts: UseKqlOptions<ResT> = {}) {
  const { kql } = useRuntimeConfig().public

  if (!kql.clientRequests)
    throw new Error('Fetching queries client-side isn\'t allowed. Enable it by setting "clientRequests" to "true".')

  const _query = computed(() => resolveUnref(query))

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[usePublicKql] Empty KQL query')

  return useFetch<ResT, FetchError, NitroFetchRequest, ResT>(kql.prefix, {
    ...opts,
    key: hash(_query.value),
    baseURL: kql.url,
    method: 'POST',
    body: _query.value,
    headers: {
      ...headersToObject(opts.headers),
      ...buildAuthHeader({
        auth: kql.auth as ModuleOptions['auth'],
        token: kql.token,
        credentials: kql.credentials,
      }),
      ...(opts.language ? { 'X-Language': opts.language } : {}),
    },
  }) as AsyncData<ResT, true | FetchError>
}
