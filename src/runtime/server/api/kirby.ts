import { createError, defineEventHandler, readBody } from 'h3'
import type { FetchError } from 'ohmyfetch'
import type { ModuleOptions } from '../../../module'
import { buildAuthHeader } from '../../utils'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const uri: string = body.uri || ''
  const headers: Record<string, string> = body.headers || {}

  if (!uri) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty page ID',
    })
  }

  const { kql } = useRuntimeConfig()

  try {
    return await $fetch<any>(uri, {
      baseURL: kql.url,
      headers: {
        ...headers,
        ...buildAuthHeader({
          auth: kql.auth as ModuleOptions['auth'],
          token: kql.token,
          credentials: kql.credentials,
        }),
      },
    })
  }
  catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Couldn\'t fetch Kirby data',
      data: (err as FetchError).message,
    })
  }
})