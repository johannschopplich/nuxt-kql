import { hash } from 'ohash'
import { buildAuthHeader, headersToObject, kirbyApiRoute } from '../utils'
import type { ModuleOptions } from '../../module'
import { useNuxtApp, useRuntimeConfig } from '#imports'

export interface KirbyFetchOptions {
  /**
   * Custom headers to send with the request
   */
  headers?: HeadersInit
  /**
   * Skip the Nuxt server proxy and fetch directly from the API
   * Requires `clientRequests` to be enabled in the module options
   */
  client?: boolean
}

export function $kirby<T = any>(
  uri: string,
  opts: KirbyFetchOptions = {},
): Promise<T> {
  if (opts.client) {
    const { kql } = useRuntimeConfig().public

    if (!kql.clientRequests)
      throw new Error('Fetching from Kirby client-side isn\'t allowed. Enable it by setting "clientRequests" to "true".')

    return $fetch<T>(uri, {
      baseURL: kql.url,
      headers: {
        ...headersToObject(opts.headers),
        ...buildAuthHeader({
          auth: kql.auth as ModuleOptions['auth'],
          token: kql.token,
          credentials: kql.credentials,
        }),
      },
    })
  }

  const nuxt = useNuxtApp()
  nuxt._kqlPromises = nuxt._kqlPromises || {}
  const key = `$kirby${hash(uri)}`

  if (key in nuxt.payload.data!)
    return Promise.resolve(nuxt.payload.data![key])

  if (key in nuxt._kqlPromises)
    return nuxt._kqlPromises[key]

  const request = $fetch(kirbyApiRoute, {
    method: 'POST',
    body: {
      uri,
      headers: headersToObject(opts.headers),
    },
  }).then((response) => {
    nuxt.payload.data![key] = response
    delete nuxt._kqlPromises[key]
    return response
  }) as Promise<T>

  nuxt._kqlPromises[key] = request

  return request
}