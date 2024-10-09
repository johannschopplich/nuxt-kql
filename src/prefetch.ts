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

  if (!options.url) {
    logger.error('Skipping KQL prefetch, since no Kirby base URL is provided')
    return results
  }

  const start = Date.now()

  for (const [key, query] of Object.entries(options.prefetch)) {
    const language = 'language' in query ? query.language : undefined

    if (language && !query.query) {
      logger.error(`Prefetch KQL query "${key}" requires the "query" property in multi-language mode`)
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
      const _error = error as FetchError
      logger.error(
        `Prefetch KQL query "${key}" failed${
          _error.status
            ? ` with status code ${_error.status}:\n${JSON.stringify(_error.data, undefined, 2)}`
            : `: ${_error}`
        }`,
      )
    }
  }

  if (results.size > 0) {
    const firstKey = results.keys().next().value as string

    logger.info(
      `Prefetched ${results.size === 1 ? '' : `${results.size} `}KQL ${
        results.size === 1 ? `query "${firstKey}"` : 'queries'
      } in ${Date.now() - start}ms`,
    )
  }

  return results
}
