import { createError, defineEventHandler, readBody } from 'h3'
import destr from 'destr'
import type { FetchError } from 'ofetch'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-fest'
import { getAuthHeader } from '../../utils'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<KirbyQueryResponse> => {
  const { key, query, headers } = await readBody<{
    key: string
    query: Partial<KirbyQueryRequest>
    headers?: Record<string, string>
  }>(event)

  if (Object.keys(query).length === 0 || !query?.query) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty KQL query',
    })
  }

  const storage = useStorage()
  const { kql } = useRuntimeConfig()
  const { server } = kql.experimental

  if (
    server.cache
    && await storage.hasItem(key)
    && ((await storage.getMeta(key))?.expires ?? 0) > Date.now()
  )
    return destr(await storage.getItem(key))

  try {
    const result = await $fetch<KirbyQueryResponse>(kql.prefix, {
      baseURL: kql.url,
      method: 'POST',
      body: query,
      headers: {
        ...headers,
        ...getAuthHeader(kql),
      },
    })

    if (server.cache) {
      await storage.setItem(key, JSON.stringify(result))
      await storage.setMeta(key, { expires: Date.now() + server.expires })
    }

    return result
  }
  catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to execute KQL query',
      data: (err as FetchError).message,
    })
  }
})
