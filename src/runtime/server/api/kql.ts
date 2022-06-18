import { assertMethod, defineEventHandler, useBody } from 'h3'
import type { ModuleOptions } from '../../../module'
import type { KqlQueryRequest, KqlQueryResponse } from '../../types'
import { getAuthHeaders } from '../../utils'
import { useRuntimeConfig } from '#imports'

const { kql } = useRuntimeConfig()

export default defineEventHandler(async (event): Promise<KqlQueryResponse> => {
  assertMethod(event, 'POST')
  const body = await useBody<{ data: Partial<KqlQueryRequest> }>(event)

  const { data = {} } = body

  if (Object.keys(data).length === 0) {
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
