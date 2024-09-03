import { consola } from 'consola'
import { createError, defineEventHandler, getRouterParam, readBody, send, setResponseHeader, setResponseStatus, splitCookiesString } from 'h3'
import { base64ToUint8Array, uint8ArrayToBase64, uint8ArrayToString } from 'uint8array-extras'
import { destr } from 'destr'
import type { H3Event } from 'h3'
import type { ModuleOptions } from '../../module'
import { createAuthHeader } from '../utils'
import type { ServerFetchOptions } from '../types'
// @ts-expect-error: `tsconfig.server` has the types
import { defineCachedFunction, useRuntimeConfig } from '#imports'

const ignoredResponseHeaders = new Set([
  // https://github.com/unjs/h3/blob/fe9800bbbe9bda2972cc5d11db7353f4ab70f0ba/src/utils/proxy.ts#L97
  'content-encoding',
  'content-length',
  // Reduce information leakage
  'server',
  'x-powered-by',
])

export default defineEventHandler(async (event) => {
  const kql = useRuntimeConfig(event).kql as Required<ModuleOptions>
  const body = await readBody<ServerFetchOptions>(event)
  const key = decodeURIComponent(getRouterParam(event, 'key')!)
  const isQueryRequest = key.startsWith('$kql')

  // Always give `event` as first argument to make sure cached functions
  // are working as expected in edge workers
  const fetcher = async (event: H3Event, {
    key,
    query,
    path,
    headers,
    method,
    body,
  }: { key: string } & ServerFetchOptions) => {
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
    const dataArray = new Uint8Array(response._data ?? ([] as unknown as ArrayBuffer))
    const data = uint8ArrayToBase64(dataArray)

    return {
      status: response.status,
      statusText: response.statusText,
      headers: [...response.headers.entries()],
      data,
    }
  }

  const cachedFetcher = defineCachedFunction(fetcher, {
    name: 'nuxt-kql',
    base: kql.server.storage,
    swr: kql.server.swr,
    maxAge: kql.server.maxAge,
    getKey: (event: H3Event, { key }: { key: string } & ServerFetchOptions) => key,
  })

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
      ? await cachedFetcher(event, { key, ...body })
      : await fetcher(event, { key, ...body })

    const dataArray = base64ToUint8Array(response.data)

    if (response.status >= 400 && response.status < 600) {
      if (isQueryRequest) {
        consola.error(`Failed KQL query "${body.query?.query}" (...) with status code ${response.status}:\n`, destr(
          uint8ArrayToString(dataArray),
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
    return send(event, dataArray)
  }
  catch (error) {
    consola.error(error)

    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
    })
  }
})
