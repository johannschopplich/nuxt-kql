import { createError, defineEventHandler, readBody } from 'h3'
import type { FetchError } from 'ofetch'
import type { ModuleOptions } from '../../../module'
import { getAuthHeader } from '../../utils'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<any> => {
  const { uri, headers } = await readBody<{
    uri?: string
    headers?: Record<string, string>
  }>(event)

  if (!uri) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty page URI',
    })
  }

  const { kql } = useRuntimeConfig()

  try {
    return await $fetch(uri, {
      baseURL: kql.url,
      headers: {
        ...headers,
        ...getAuthHeader({
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
      statusMessage: `Failed to fetch "${uri}"`,
      data: (err as FetchError).message,
    })
  }
})
