import { defineEventHandler, useBody } from 'h3'
import { getQuery } from 'ufo'
import type { ModuleOptions } from '../../module'
import type { KqlQueryRequest, KqlQueryResponse } from '../types'
import { getAuthHeaders } from '../utils'

export default defineEventHandler(async (event): Promise<KqlQueryResponse> => {
  const { kql } = useRuntimeConfig()

  if (!kql.kirbyUrl || !kql.kirbyEndpoint)
    throw new Error('Kirby base URL or KQL API route path is not configured')

  let query: KqlQueryRequest

  if (event.req.method === 'POST') {
    const body = await useBody(event)
    query = body.data || {}
  }
  else {
    const q = getQuery(event.req.url!) as Record<string, string>
    query = JSON.parse(q.data || '{}') || {}
  }

  if (!query) {
    event.res.statusCode = 404
    return {
      code: 404,
      status: 'Empty KQL query',
    }
  }

  try {
    return await $fetch<KqlQueryResponse>(kql.kirbyEndpoint, {
      baseURL: kql.kirbyUrl,
      method: 'POST',
      body: query,
      headers: { ...getAuthHeaders(kql as ModuleOptions) },
    })
  }
  catch (e) {
    event.res.statusCode = 500
    return {
      code: 500,
      status: 'Couldn\'t execute KQL query',
      result: e.message,
    }
  }
})
