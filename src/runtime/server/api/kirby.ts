import { createError, defineEventHandler, readBody } from 'h3'
import type { FetchError } from 'ofetch'
import { getAuthHeader } from '../../utils'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<any> => {
  const { headers } = await readBody(event)
  const { path } = event.context.params

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty page URI',
    })
  }

  const { kql } = useRuntimeConfig()

  try {
    return await $fetch(path, {
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
      statusMessage: `Failed to fetch "${path}"`,
      data: (err as FetchError).message,
    })
  }
})
