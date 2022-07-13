import { hash as ohash } from 'ohash'
import type { KirbyQueryRequest, KirbyQueryResponse } from '#nuxt-kql'
import { useNuxtApp } from '#imports'
import { apiRoute } from '#build/nuxt-kql/options'

interface InternalState<T> {
  promiseMap: Map<string, Promise<T>>
}

export interface KqlOptions {
  /**
   * Cache result with same query for hydration
   *
   * @default true
   */
  cache?: boolean
}

export function $kql<T extends KirbyQueryResponse = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  options: KqlOptions = {},
): Promise<T> {
  const { cache = true } = options
  const body = { query }

  if (!cache) {
    return $fetch<T>(apiRoute, {
      method: 'POST',
      body,
    })
  }

  const nuxt = useNuxtApp()
  const payloadCache: Record<string, T> = nuxt.payload.kql = nuxt.payload.kql || {}
  const state = (nuxt.__kql__ || {}) as InternalState<T>
  state.promiseMap = state.promiseMap || new Map()

  const key = ohash(query)

  if (key in payloadCache)
    return Promise.resolve(payloadCache[key])

  if (state.promiseMap.has(key))
    return state.promiseMap.get(key)

  const request = $fetch<T>(apiRoute, { method: 'POST', body })
    .then((response) => {
      payloadCache[key] = response
      state.promiseMap.delete(key)
      return response
    })

  state.promiseMap.set(key, request)

  return request
}
