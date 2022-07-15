import { hash } from 'ohash'
import type { KirbyQueryRequest, KirbyQueryResponse } from '#nuxt-kql'
import { useNuxtApp } from '#imports'
import { apiRoute } from '#build/nuxt-kql/options'

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
  const body = { query }

  if (options.cache === false) {
    return $fetch<T>(apiRoute, {
      method: 'POST',
      body,
    })
  }

  const nuxt = useNuxtApp()
  nuxt._kqlPromises = nuxt._kqlPromises || {}
  const key = `$kql${hash(query)}`

  if (key in nuxt.payload.data)
    return Promise.resolve(nuxt.payload.data[key])

  if (key in nuxt._kqlPromises)
    return nuxt._kqlPromises[key]

  const request = $fetch<T>(apiRoute, { method: 'POST', body })
    .then((response) => {
      nuxt.payload.data[key] = response
      delete nuxt._kqlPromises[key]
      return response
    })

  nuxt._kqlPromises[key] = request

  return request
}
