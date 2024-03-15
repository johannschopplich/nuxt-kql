import { consola } from 'consola'
import { createError, defineEventHandler, getRouterParam, readBody, send, setResponseHeader, setResponseStatus, splitCookiesString } from 'h3'
import type { ModuleOptions } from '../../module'
import { createAuthHeader } from '../utils'
import type { ServerFetchOptions } from '../types'

// @ts-expect-error: Will be resolved by Nitro
import { defineCachedFunction } from '#internal/nitro'
import { useRuntimeConfig } from '#imports'

const kql = useRuntimeConfig().kql as Required<ModuleOptions>
const ignoredResponseHeaders = new Set([
  // https://github.com/unjs/h3/blob/fe9800bbbe9bda2972cc5d11db7353f4ab70f0ba/src/utils/proxy.ts#L97
  'content-encoding',
  'content-length',
  // Reduce information leakage
  'access-control-allow-origin',
  'server',
  'x-powered-by',
])

async function fetcher({
  key,
  query,
  path,
  headers,
  method,
  body,
}: { key: string } & ServerFetchOptions) {
  const isQueryRequest = key.startsWith('$kql')

  const response = await globalThis.$fetch.raw<ArrayBuffer>(isQueryRequest ? kql.prefix : path!, {
    responseType: 'arrayBuffer',
    ignoreResponseError: true,
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

  // Serialize the response data
  const buffer = Buffer.from(response._data ?? ([] as unknown as ArrayBuffer))
  const data = buffer.toString('base64')

  return {
    status: response.status,
    statusText: response.statusText,
    headers: [...response.headers.entries()],
    data,
  }
}

const cachedFetcher = defineCachedFunction(fetcher, {
  name: 'kirby',
  base: kql.server.storage,
  swr: kql.server.swr,
  maxAge: kql.server.maxAge,
  getKey: ({ key }: { key: string } & ServerFetchOptions) => key,
})

export default defineEventHandler(async (event) => {
  const body = await readBody<ServerFetchOptions>(event)
  const key = decodeURIComponent(getRouterParam(event, 'key')!)
  const isQueryRequest = key.startsWith('$kql')

  if (isQueryRequest) {
    if (!body.query?.query) {
      throw createError({
        statusCode: 400,
        statusMessage: 'KQL query is empty',
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

  try {
    const response = kql.server.cache && body.cache
      ? await cachedFetcher({ key, ...body })
      : await fetcher({ key, ...body })

    const buffer = Buffer.from(response.data, 'base64')

    if (response.status >= 400 && response.status < 600) {
      if (isQueryRequest) {
        consola.error(`Failed KQL query "${body.query?.query}" (...) with status code ${response.status}:\n`, tryParseJSON(
          buffer.toString('utf-8'),
        ))
        if (kql.server.verboseErrors)
          consola.log('Full KQL query request:', body.query)
      }
      else {
        consola.error(`Failed ${(body.method || 'get').toUpperCase()} request to "${body.path}"`)
      }
    }

    const cookies: string[] = []

    for (const [key, value] of response.headers) {
      if (ignoredResponseHeaders.has(key))
        continue

      if (key === 'set-cookie') {
        cookies.push(...splitCookiesString(value))
        continue
      }

      setResponseHeader(event, key, value)
    }

    if (cookies.length > 0)
      setResponseHeader(event, 'set-cookie', cookies)

    setResponseStatus(event, response.status, response.statusText)
    return send(event, buffer)
  }
  catch (error) {
    consola.error(error)

    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
    })
  }
})

function tryParseJSON(data: string) {
  try {
    return JSON.parse(data)
  }
  catch (e) {
    return data
  }
}
