import { createError, defineEventHandler, readBody } from 'h3'
import type { FetchError } from 'ofetch'
import type { ModuleOptions } from '../module'
import { getAuthHeader } from './utils'
import type { ServerFetchOptions } from './utils'
// @ts-expect-error: Will be resolved by Nitro
import { cachedFunction } from '#internal/nitro'
import { useRuntimeConfig } from '#imports'

const fetcher = async (
  key: string,
  kql: Required<ModuleOptions>,
  { query, uri, headers }: ServerFetchOptions,
) => {
  const hasQuery = key.startsWith('$kql')

  try {
    const result = await $fetch<any>(hasQuery ? kql.prefix : uri!, {
      baseURL: kql.url,
      ...(hasQuery && {
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
      statusMessage: hasQuery
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
  getKey: (key: string) => key,
})

export default defineEventHandler(async (event): Promise<any> => {
  const body = await readBody<ServerFetchOptions>(event)
  const key = decodeURIComponent(event.context.params.key)
  const { kql } = useRuntimeConfig()

  if (key.startsWith('$kql') && !body.query?.query) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty KQL query',
    })
  }

  if (kql.server.cache && body.cache)
    return await cachedFetcher(key, kql, body)

  return await fetcher(key, kql as Required<ModuleOptions>, body)
})
