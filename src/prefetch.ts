import { ofetch } from 'ofetch'
import type { FetchError } from 'ofetch'
import type { KirbyQueryResponse } from 'kirby-types'
import { logger } from './kit'
import { createAuthHeader } from './runtime/utils'
import type { ModuleOptions } from './module'

export async function prefetchQueries(
  options: ModuleOptions,
): Promise<Map<string, KirbyQueryResponse>> {
  const results = new Map<string, KirbyQueryResponse>()

  if (!options.prefetch || Object.keys(options.prefetch).length === 0)
    return results

  const start = Date.now()

  for (const [key, query] of Object.entries(options.prefetch)) {
    const language = 'language' in query ? query.language : undefined

    if (language && !query.query) {
      logger.error(`Prefetch KQL query "${key}" requires "query" property in multi-language mode`)
      continue
    }

    try {
      results.set(
        key,
        await ofetch<KirbyQueryResponse>(options.prefix!, {
          baseURL: options.url,
          method: 'POST',
          body: language ? query.query : query,
          headers: {
            ...createAuthHeader(options),
            ...(language && { 'X-Language': language }),
          },
        }),
      )
    }
    catch (error) {
      logger.error(
        `Prefetch KQL query "${key}" failed with status code ${(error as FetchError).statusCode}:\n`,
        JSON.stringify((error as FetchError).data, undefined, 2),
      )
    }
  }

  if (results.size > 0) {
    const firstKey = results.keys().next().value as string

    logger.info(
      `Prefetched ${results.size === 1 ? firstKey : results.size} KQL ${
        results.size === 1 ? 'query' : 'queries'
      } in ${Date.now() - start}ms`,
    )
  }

  return results
}
