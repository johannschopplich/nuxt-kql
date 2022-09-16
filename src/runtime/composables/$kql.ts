import { hash } from 'ohash'
import { headersToObject } from '../utils'
import { useNuxtApp } from '#imports'
import { apiRoute } from '#build/nuxt-kql/options'
import type { KirbyQueryRequest, KirbyQueryResponse } from '#nuxt-kql'

export interface KqlOptions {
  /**
   * Cache result with same query for hydration
   *
   * @default true
   */
  cache?: boolean
  /**
   * Language code to fetch data for in multilang Kirby setups
   */
  language?: string
  /**
   * Custom headers to send with the request
   */
  headers?: HeadersInit
}

export function $kql<T extends KirbyQueryResponse = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlOptions = {},
): Promise<T> {
  const body = {
    query,
    headers: {
      ...headersToObject(opts.headers),
      ...(opts.language ? { 'X-Language': opts.language } : {}),
    },
  }

  if (opts.cache === false) {
    return $fetch<T>(apiRoute, {
      method: 'POST',
      body,
    })
  }

  const nuxt = useNuxtApp()
  nuxt._kqlPromises = nuxt._kqlPromises || {}
  const key = `$kql${hash(query)}`

  if (key in nuxt.payload.data!)
    return Promise.resolve(nuxt.payload.data![key])

  if (key in nuxt._kqlPromises)
    return nuxt._kqlPromises[key]

  const request = $fetch(apiRoute, { method: 'POST', body })
    .then((response) => {
      nuxt.payload.data![key] = response
      delete nuxt._kqlPromises[key]
      return response
    }) as Promise<T>

  nuxt._kqlPromises[key] = request

  return request
}
