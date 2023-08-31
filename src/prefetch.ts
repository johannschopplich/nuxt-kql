import { ofetch } from 'ofetch'
import { useLogger } from '@nuxt/kit'
import type { KirbyQueryResponse } from 'kirby-types'
import { getAuthHeader } from './runtime/utils'
import type { ModuleOptions } from './module'

export const logger = useLogger('nuxt-kql')

export async function prefetchQueries(
  options: ModuleOptions,
): Promise<Map<string, KirbyQueryResponse>> {
  const results = new Map<string, KirbyQueryResponse>()

  if (!options.prefetch || Object.keys(options.prefetch).length === 0)
    return results

  const start = Date.now()
  const { auth, token, credentials } = options

  for (const [key, query] of Object.entries(options.prefetch)) {
    const language = 'language' in query ? query.language : undefined

    if (language && !query.query) {
      logger.error(
        `Couldn't prefetch ${key} KQL query: \`language\` option requires a \`query\``,
      )
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
            ...getAuthHeader({ auth, token, credentials }),
            ...(language && { 'X-Language': language }),
          },
        }),
      )
    }
    catch (e) {
      logger.error(`Couldn't prefetch ${key} KQL query:`, e)
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
