import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import type { FetchError } from 'ofetch'
import type { ModuleOptions } from '../../module'
import { createAuthHeader } from '../utils'
import type { ServerFetchOptions } from '../types'

// @ts-expect-error: Will be resolved by Nitro
import { defineCachedFunction } from '#internal/nitro'
import { useRuntimeConfig } from '#imports'

const kql = useRuntimeConfig().kql as Required<ModuleOptions>

async function fetcher({
  key,
  query,
  path,
  headers,
  method,
  body,
}: { key: string } & ServerFetchOptions) {
  const isQueryRequest = key.startsWith('$kql')

  try {
    const result = await globalThis.$fetch<any>(isQueryRequest ? kql.prefix : path!, {
      baseURL: kql.url,
      ...(isQueryRequest
        ? {
            method: 'POST',
            body: query,
          }
        : {
            query,
            method,
            body,
          }),
      headers: {
        ...headers,
        ...createAuthHeader(kql),
      },
    })

    return result
  }
  catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: isQueryRequest
        ? 'Failed to execute KQL query'
        : `Failed to fetch "${path}"`,
      data: (err as FetchError).message,
    })
  }
}

const cachedFetcher = defineCachedFunction(fetcher, {
  base: kql.server.storage,
  swr: kql.server.swr,
  maxAge: kql.server.maxAge,
  getKey: ({ key }: { key: string } & ServerFetchOptions) => key,
})

export default defineEventHandler(async (event) => {
  const body = await readBody<ServerFetchOptions>(event)
  const key = decodeURIComponent(getRouterParam(event, 'key')!)

  if (key.startsWith('$kql')) {
    if (!body.query?.query) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Empty KQL query',
      })
    }
  }
  else {
    // Check if the path is an absolute URL
    if (body.path && new URL(body.path, 'http://localhost').origin !== 'http://localhost') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Absolute URLs are not allowed',
      })
    }
  }

  if (kql.server.cache && body.cache)
    return await cachedFetcher({ key, ...body })

  return await fetcher({ key, ...body })
})
