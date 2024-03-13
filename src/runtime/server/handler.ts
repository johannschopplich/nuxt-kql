import { joinURL } from 'ufo'
import { consola } from 'consola'
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import type { ModuleOptions } from '../../module'
import { createAuthHeader } from '../utils'
import type { ServerFetchOptions } from '../types'
import type { NuxtError } from '#app'

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
  catch (error) {
    if (isQueryRequest) {
      consola.error(
        `KQL query failed with status code ${(error as NuxtError).status}:\n`,
        JSON.stringify((error as NuxtError).data, undefined, 2),
      )
      if (kql.server.verboseErrors)
        consola.log('KQL query request:', query)
    }
    else {
      consola.error(`Failed ${(method || 'get')?.toUpperCase()} request to ${joinURL(kql.url, path!)} with options:`, { headers, query, body })
    }

    throw createError({
      statusCode: 500,
      statusMessage: isQueryRequest
        ? 'Failed to execute KQL query'
        : `Failed to fetch "${path}"`,
      data: (error as NuxtError).message,
    })
  }
}

const cachedFetcher = defineCachedFunction(fetcher, {
  name: 'kql-fetcher',
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
