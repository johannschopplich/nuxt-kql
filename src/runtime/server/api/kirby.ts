import { createError, defineEventHandler, readBody } from 'h3'
import type { FetchError } from 'ofetch'
import { getAuthHeader } from '../../utils'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<any> => {
  const { uri, headers } = await readBody(event)
  const { kql } = useRuntimeConfig()

  if (!uri) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty page URI',
    })
  }

  try {
    return await $fetch(uri, {
      baseURL: kql.url,
      headers: {
        ...headers,
        ...getAuthHeader(kql),
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
