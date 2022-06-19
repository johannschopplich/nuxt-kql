import { hash as ohash } from 'ohash'
import type { KirbyQueryRequest, KirbyQueryResponse } from '../types'
import { apiRoute } from '#build/nuxt-kql/options'

interface InternalState<T> {
  promiseMap: Map<string, Promise<T>>
}

export interface QueryOptions {
  /**
   * Cache result with same query for hydration
   *
   * @default true
   */
  cache?: boolean
}

export function $query<T = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  options: QueryOptions = {},
): Promise<T> {
  const { cache = true } = options

  const nuxt = useNuxtApp()
  const queries: Record<string, T> = nuxt.payload.kqlQueries = (nuxt.payload.kqlQueries || {})

  const state = (nuxt.__kql__ || {}) as InternalState<T>
  state.promiseMap = state.promiseMap || new Map()

  if (!cache) {
    return $fetch<T>(apiRoute, {
      method: 'POST',
      body: { query },
    })
  }

  const key = ohash(query)

  if (key in queries)
    return Promise.resolve(queries[key])

  if (state.promiseMap.has(key))
    return state.promiseMap.get(key)

  const request = $fetch<T>(apiRoute, { method: 'POST', body: { query } })
    .then((response) => {
      queries[key] = response
      state.promiseMap.delete(key)
      return response
    })

  state.promiseMap.set(key, request)

  return request
}
