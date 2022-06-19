import type { NitroFetchRequest } from 'nitropack'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import type { AsyncData } from 'nuxt/app'
import type { KirbyQueryRequest, KirbyQueryResponse, UseQueryOptions } from '../types'
import { useFetch } from '#imports'
import { apiRoute } from '#build/nuxt-kql/options'

export function useQuery<ResT = KirbyQueryResponse, ReqT = KirbyQueryRequest>(
  query: Ref<ReqT> | ReqT,
  opts: UseQueryOptions<ResT> = {},
) {
  const _query = computed(() => unref(query))

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(apiRoute, {
    ...opts,
    method: 'POST',
    body: { query: _query.value },
  }) as AsyncData<ResT, true | Error>
}
