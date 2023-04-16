import { $fetch } from 'ofetch'
import { useLogger } from '@nuxt/kit'
import type { KirbyQueryResponse } from 'kirby-fest'
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
    try {
      results.set(
        key,
        await $fetch<KirbyQueryResponse>(options.prefix!, {
          baseURL: options.url,
          method: 'POST',
          body: query,
          headers: getAuthHeader({ auth, token, credentials }),
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
