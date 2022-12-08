import { createError, defineEventHandler, readBody } from 'h3'
import destr from 'destr'
import type { FetchError } from 'ofetch'
import type { KirbyQueryRequest } from 'kirby-fest'
import { getAuthHeader } from './utils'
// @ts-expect-error: Will be resolved by Nitro
import { useStorage } from '#internal/nitro/virtual/storage'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<any> => {
  const { key, query, uri = '', cache = true, headers } = await readBody<{
    key: string
    query?: Partial<KirbyQueryRequest>
    uri?: string
    cache?: boolean
    headers?: Record<string, string>
  }>(event)
  const isQueryRequest = key.startsWith('$kql')

  if (isQueryRequest && !query?.query) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty KQL query',
    })
  }

  const { kql } = useRuntimeConfig()
  const storage = useStorage()
  const cacheEnabled = kql.server.cache && cache

  if (
    cacheEnabled
    && await storage.hasItem(key)
    && ((await storage.getMeta(key))?.expires ?? 0) > Date.now()
  )
    return destr(await storage.getItem(key))

  try {
    const result = await $fetch(
      isQueryRequest ? kql.prefix : uri,
      {
        baseURL: kql.url,
        ...(isQueryRequest && {
          method: 'POST',
          body: query,
        }),
        headers: {
          ...headers,
          ...getAuthHeader(kql),
        },
      })

    if (cacheEnabled) {
      await storage.setItem(key, JSON.stringify(result))
      await storage.setMeta(key, { expires: Date.now() + kql.server.cacheTTL })
    }

    return result
  }
  catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: isQueryRequest
        ? 'Failed to execute KQL query'
        : `Failed to fetch "${uri}"`,
      data: (err as FetchError).message,
    })
  }
})
