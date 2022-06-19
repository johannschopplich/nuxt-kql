import type { NitroFetchRequest } from 'nitropack'
import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import type { AsyncData } from 'nuxt/app'
import type { KqlQueryRequest, KqlQueryResponse, UseKqlOptions } from '../types'
import { useFetch } from '#imports'
import { apiRoute } from '#build/nuxt-kql/options'

export function useKql<ResT = KqlQueryResponse, ReqT = KqlQueryRequest>(
  query: Ref<ReqT> | ReqT,
  opts: UseKqlOptions<ResT> = {},
) {
  const _query = computed(() => unref(query))

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(apiRoute, {
    ...opts,
    method: 'POST',
    body: { query: _query.value },
  }) as AsyncData<ResT, true | Error>
}
