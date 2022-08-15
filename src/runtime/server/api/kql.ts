import { createError, defineEventHandler, readBody } from 'h3'
import type { FetchError } from 'ohmyfetch'
import type { ModuleOptions } from '../../../module'
import { getAuthHeaders } from '../../utils'
import type { KirbyQueryRequest, KirbyQueryResponse } from '#nuxt-kql'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<KirbyQueryResponse> => {
  const body = await readBody(event)

  const query: Partial<KirbyQueryRequest> = body.query || {}
  const headers: Record<string, string> = body.headers || {}

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
        ...getAuthHeaders(kql as ModuleOptions),
      },
    })
  }
  catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Couldn\'t execute KQL query',
      data: (err as FetchError).message,
    })
  }
})
