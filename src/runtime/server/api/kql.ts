import { createError, defineEventHandler, readBody } from 'h3'
import type { FetchError } from 'ofetch'
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-fest'
import { getAuthHeader } from '../../utils'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<KirbyQueryResponse> => {
  const { query = {}, headers } = await readBody<{
    query?: Partial<KirbyQueryRequest>
    headers?: Record<string, string>
  }>(event)

  if (Object.keys(query).length === 0 || !query?.query) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty KQL query',
    })
  }

  const { kql } = useRuntimeConfig()

  try {
    return await $fetch<KirbyQueryResponse>(kql.prefix, {
      baseURL: kql.url,
      method: 'POST',
      body: query,
      headers: {
        ...headers,
        ...getAuthHeader(kql),
      },
    })
  }
  catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to execute KQL query',
      data: (err as FetchError).message,
    })
  }
})
