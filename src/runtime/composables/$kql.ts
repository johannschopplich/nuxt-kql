import { hash as ohash } from 'ohash'
import type { KqlPrivateFetchOptions, KqlQueryRequest, KqlQueryResponse } from '../types'
import { useRuntimeConfig } from '#app'

interface InternalState<T> {
  promiseMap: Map<string, Promise<T>>
}

export function $kql<T = KqlQueryResponse>(
  query: KqlQueryRequest,
  options: KqlPrivateFetchOptions = {},
): Promise<T> {
  const { cache = true } = options
  const { public: { kql } } = useRuntimeConfig()

  const nuxt = useNuxtApp()
  const queries: Record<string, T> = nuxt.payload.kqlQueries = (nuxt.payload.kqlQueries || {})

  const state = (nuxt.__kql__ || {}) as InternalState<T>
  state.promiseMap = state.promiseMap || new Map()

  const body = { data: query }

  if (!cache) {
    return $fetch<T>(kql.apiRoute, {
      method: 'POST',
      body,
    })
  }

  const key = ohash(query)

  if (key in queries)
    return Promise.resolve(queries[key])

  if (state.promiseMap.has(key))
    return state.promiseMap.get(key)

  const request = $fetch<T>(kql.apiRoute, { method: 'POST', body })
    .then((response) => {
      queries[key] = response
      state.promiseMap.delete(key)
      return response
    })

  state.promiseMap.set(key, request)

  return request
}