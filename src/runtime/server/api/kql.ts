import { assertMethod, defineEventHandler, useBody } from 'h3'
import { getAuthHeaders } from '../../utils'
import type { ModuleOptions } from '../../../module'
import type { KirbyQueryRequest, KirbyQueryResponse } from '../../types'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<KirbyQueryResponse> => {
  assertMethod(event, 'POST')
  const body = await useBody(event)

  const query: Partial<KirbyQueryRequest> = body.query || {}

  if (Object.keys(query).length === 0 || !query?.query) {
    event.res.statusCode = 400
    return {
      code: 400,
      status: 'Empty KQL query',
    }
  }

  const { kql } = useRuntimeConfig()

  try {
    return await $fetch<KirbyQueryResponse>(kql.kirbyEndpoint, {
      baseURL: kql.kirbyUrl,
      method: 'POST',
      body: query,
      headers: getAuthHeaders(kql as ModuleOptions),
    })
  }
  catch (err) {
    event.res.statusCode = 500
    return {
      code: 500,
      status: 'Couldn\'t execute KQL query',
      result: err.data,
    }
  }
})
