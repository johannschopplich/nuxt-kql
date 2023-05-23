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

async function fetcher({ key, kql, query, uri, headers }: FetcherOptions) {
  const isQueryRequest = key.startsWith('$kql')

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

const cachedFetcher = defineCachedFunction(fetcher, {
  swr: useRuntimeConfig().kql.server.swr,
  maxAge: useRuntimeConfig().kql.server.maxAge,
  getKey: (opts: FetcherOptions) => opts.key,
})

export default defineEventHandler(async (event): Promise<any> => {
  const body = await readBody<ServerFetchOptions>(event)

  const key = decodeURIComponent(getRouterParam(event, 'key'))

  if (key.startsWith('$kql') && !body.query?.query) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty KQL query',
    })
  }

  const { kql } = useRuntimeConfig()
  const opts: FetcherOptions = {
    key,
    kql: kql as Required<ModuleOptions>,
    ...body,
  }

  if (kql.server.cache && body.cache)
    return await cachedFetcher(opts)

  return await fetcher(opts)
})
