import { assertMethod, defineEventHandler, useBody } from 'h3'
import type { ModuleOptions } from '../../../module'
import type { KqlQueryRequest, KqlQueryResponse } from '../../types'
import { getAuthHeaders } from '../../utils'

export default defineEventHandler(async (event): Promise<KqlQueryResponse> => {
  assertMethod(event, 'POST')
  const body = await useBody(event)

  const data: Partial<KqlQueryRequest> = body.data || {}

  if (Object.keys(data).length === 0) {
    event.res.statusCode = 404
    return {
      code: 404,
      status: 'Empty KQL query',
    }
  }

  const { kql } = useRuntimeConfig()

  try {
    return await $fetch<KqlQueryResponse>(kql.kirbyEndpoint, {
      baseURL: kql.kirbyUrl,
      method: 'POST',
      body: data,
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
