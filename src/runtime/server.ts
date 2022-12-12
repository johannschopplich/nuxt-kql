import { createError, defineEventHandler, readBody } from 'h3'
import type { FetchError } from 'ofetch'
import type { ModuleOptions } from '../module'
import { getAuthHeader } from './utils'
import type { EventHandlerBody } from './utils'
// @ts-expect-error: Will be resolved by Nitro
import { cachedFunction } from '#internal/nitro'
import { useRuntimeConfig } from '#imports'

const fetcher = async (
  kql: Required<ModuleOptions>,
  { key, query, uri, headers }: EventHandlerBody,
) => {
  const isQueryRequest = key.startsWith('$kql')

  if (key.startsWith('$kql') && !query?.query) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty KQL query',
    })
  }

  try {
    const result = await $fetch<any>(isQueryRequest ? kql.prefix : uri!, {
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
}

const cachedFetcher = cachedFunction(fetcher, {
  // Disable serving stale responses
  swr: false,
  maxAge: 15 * 60,
  getKey: (kql: Required<ModuleOptions>, opts: EventHandlerBody) => opts.key,
})

export default defineEventHandler(async (event): Promise<any> => {
  const body = await readBody<EventHandlerBody>(event)
  const { kql } = useRuntimeConfig()

  if (kql.server.cache && body.cache)
    return await cachedFetcher(kql, body)

  return await fetcher(kql as Required<ModuleOptions>, body)
})
