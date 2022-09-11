import { readFile } from 'fs/promises'
import { defu } from 'defu'
import { $fetch } from 'ohmyfetch'
import { pascalCase } from 'scule'
import { addServerHandler, addTemplate, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import { getAuthHeaders } from './runtime/utils'
import type { KirbyQueryRequest, KirbyQueryResponse } from './runtime/types'

export interface ModuleOptions {
  /**
   * Kirby base URL, like `https://kirby.example.com`
   * @default 'process.env.KIRBY_BASE_URL'
   */
  url?: string

  /**
   * Kirby KQL API route path
   * @default 'api/query'
   */
  prefix?: string

  /**
   * Kirby API authentication method
   * Set to `none` to disable authentication
   * @default 'basic'
   */
  auth?: 'basic' | 'bearer' | 'none'

  /**
   * Token for bearer authentication
   * @default 'process.env.KIRBY_API_TOKEN'
   */
  token?: string

  /**
   * Username/password pair for basic authentication
   * @default { username: process.env.KIRBY_API_USERNAME, password: process.env.KIRBY_API_PASSWORD }
   */
  credentials?: {
    username: string
    password: string
  }

  /**
   * Enable client-side KQL request
   * By default, KQL data is fetched safely with a server-side proxy
   * If enabled, you can use `usePublicKql()` and `$publicKql()` to fetch data
   * directly from the Kirby instance
   * Note: This means your token or user credentials will be publicly visible
   * @default false
   */
  clientRequests?: boolean

  /**
   * Prefetch queries on Nuxt build
   * The queries will be fully typed and importable from `#build/kql`
   * @default {}
   */
  prefetch?: Record<string, KirbyQueryRequest>
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-kql',
    configKey: 'kql',
    compatibility: {
      nuxt: '^3',
    },
  },
  defaults: {
    url: process.env.KIRBY_BASE_URL as string,
    prefix: 'api/query',
    auth: 'basic',
    token: process.env.KIRBY_API_TOKEN as string,
    credentials: {
      username: process.env.KIRBY_API_USERNAME as string,
      password: process.env.KIRBY_API_PASSWORD as string,
    },
    clientRequests: false,
    prefetch: {},
  },
  async setup(options, nuxt) {
    const logger = useLogger()
    const apiRoute = '/api/__kql__' as const
    const prefetchResults: Record<string, KirbyQueryResponse> = {}

    function kql(query: KirbyQueryRequest) {
      return $fetch<KirbyQueryResponse>(options.prefix!, {
        baseURL: options.url,
        method: 'POST',
        body: query,
        headers: getAuthHeaders(options),
      })
    }

    // Make sure Kirby URL and KQL endpoint are set
    if (!options.url)
      logger.warn('Missing `KIRBY_BASE_URL` in `.env`')

    if (!options.prefix)
      logger.warn('Missing `kql.prefix` option in Nuxt config')

    // Make sure authentication credentials are set
    if (options.auth === 'basic' && (!options.credentials || !options.credentials.username || !options.credentials.password))
      logger.warn('Missing `KIRBY_API_USERNAME` and `KIRBY_API_PASSWORD` in `.env` for basic authentication')

    if (options.auth === 'bearer' && !options.token)
      logger.warn('Missing `KIRBY_API_TOKEN` in `.env` for bearer authentication')

    // Private runtime config
    nuxt.options.runtimeConfig.kql = defu(
      nuxt.options.runtimeConfig.kql,
      options,
    )

    // Transpile runtime
    const { resolve } = createResolver(import.meta.url)
    nuxt.options.build.transpile.push(resolve('runtime'))

    // Inline module runtime in Nitro bundle
    // Needed to circumvent "cannot find module error" in `server/api/kql.ts`
    // for the `util` import
    nuxt.hook('nitro:config', (config) => {
      config.externals = config.externals || {}
      config.externals.inline = config.externals.inline || []
      config.externals.inline.push(resolve('runtime'))
    })

    // Add KQL proxy endpoint to send queries on server-side
    addServerHandler({
      route: apiRoute,
      method: 'post',
      handler: resolve('runtime/server/api/kql'),
    })

    // Add KQL composables
    nuxt.hook('autoImports:dirs', (dirs) => {
      dirs.push(resolve('runtime/composables'))
    })

    // Add module options
    addTemplate({
      filename: 'nuxt-kql/options.mjs',
      getContents() {
        return `
export const apiRoute = '${apiRoute}'
`.trimStart()
      },
    })

    // Add module options types
    addTemplate({
      filename: 'nuxt-kql/options.d.ts',
      getContents() {
        return `
export declare const apiRoute = '${apiRoute}'
`.trimStart()
      },
    })

    // Copy global KQL type helpers to Nuxt types dir
    addTemplate({
      filename: 'types/nuxt-kql.d.ts',
      getContents: async () => `
declare module '#nuxt-kql' {
${(await readFile(resolve('runtime/types.d.ts'), 'utf-8'))
  .replace(/^export\s+/gm, '')
  .split('\n')
  .map(i => `  ${i}`)
  .join('\n')}
}
`.trimStart(),
    })

    // Add global `#nuxt-kql` type import path
    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: `${nuxt.options.buildDir}/types/nuxt-kql.d.ts` })
    })

    // Prefetch global data on build
    if (options.prefetch && Object.keys(options.prefetch).length !== 0) {
      const start = Date.now()

      for (const [key, query] of Object.entries(options.prefetch)) {
        try {
          const result = await kql(query)
          prefetchResults[key] = result
        }
        catch (e) {
          logger.error(`Couldn't prefetch "${key}" KQL query`)
        }
      }

      const prefetchCount = Object.keys(options.prefetch).length
      if (prefetchCount > 0) {
        const firstQueryResult = Object.keys(options.prefetch)[0]
        logger.info(
          `Prefetched ${prefetchCount === 1 ? firstQueryResult : prefetchCount} KQL ${
            prefetchCount === 1 ? 'query' : 'queries'
          } in ${Date.now() - start}ms`,
        )
      }
    }

    // Add template for prefetched query data
    addTemplate({
      filename: 'kql.ts',
      write: true,
      getContents() {
        return Object.entries(prefetchResults).map(([key, response]) => [
          `export const ${key} = ${response?.result ? JSON.stringify(response.result) : '{} as Record<string, any>'}`,
          `export type Kirby${pascalCase(key)} = typeof ${key}`,
        ].join('\n')).join('\n')
      },
    })

    // Protect authorization data if public requests are disabled
    if (!options.clientRequests)
      return

    // Public runtime config
    nuxt.options.runtimeConfig.public.kql = defu(
      nuxt.options.runtimeConfig.public.kql,
      options,
    )
  },
})
