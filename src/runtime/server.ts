import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import type { FetchError } from 'ofetch'
import type { ModuleOptions } from '../module'
import { getAuthHeader } from './utils'
import type { ServerFetchOptions } from './utils'

// @ts-expect-error: Will be resolved by Nitro
import { defineCachedFunction } from '#internal/nitro'
import { useRuntimeConfig } from '#imports'

type FetcherOptions = {
  key: string
  kql: Required<ModuleOptions>
} & ServerFetchOptions

const { kql } = useRuntimeConfig()

async function fetcher({ key, kql, query, uri, headers }: FetcherOptions) {
  const isQueryRequest = key.startsWith('$kql')

  try {
    const result = await globalThis.$fetch<any>(isQueryRequest ? kql.prefix : uri!, {
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

const cachedFetcher = defineCachedFunction(fetcher, {
  swr: kql.server.swr,
  maxAge: kql.server.maxAge,
  getKey: ({ key }: FetcherOptions) => key,
})

export default defineEventHandler(async (event) => {
  const body = await readBody<ServerFetchOptions>(event)

  const key = decodeURIComponent(getRouterParam(event, 'key'))

  if (key.startsWith('$kql') && !body.query?.query) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty KQL query',
    })
  }

  const options: FetcherOptions = {
    key,
    kql: kql as Required<ModuleOptions>,
    ...body,
  }

  if (kql.server.cache && body.cache)
    return await cachedFetcher(options)

  return await fetcher(options)
})
