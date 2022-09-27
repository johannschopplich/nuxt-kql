import { defu } from 'defu'
import { pascalCase } from 'scule'
import { addImportsDir, addServerHandler, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { KirbyQueryRequest } from 'kirby-fest'
import { kirbyApiRoute, kqlApiRoute } from './runtime/utils'
import { logger, prefetchQueries } from './utils'

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
   * Enable client-side requests besides server-side ones
   *
   * By default, KQL data is fetched safely with a server-side proxy
   * If enabled, you can fetch data directly from the Kirby instance
   * Note: This means your token or user credentials will be publicly visible
   * @default false
   */
  client?: boolean

  /**
   * Prefetch custom KQL queries at build-time
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
    client: false,
    prefetch: {},
  },
  async setup(options, nuxt) {
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
    // @ts-expect-error: prefetch queries of playground break assignment
    nuxt.options.runtimeConfig.kql = defu(
      nuxt.options.runtimeConfig.kql,
      options,
    )

    // Write data to public runtime config if client requests are enabled
    // @ts-expect-error: prefetch queries of playground break assignment
    nuxt.options.runtimeConfig.public.kql = defu(
      nuxt.options.runtimeConfig.public.kql,
      options.client
        ? options
        : { client: false },
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

    // Add KQL proxy endpoint to send queries server-side
    addServerHandler({
      route: kqlApiRoute,
      method: 'post',
      handler: resolve('runtime/server/api/kql'),
    })

    // Add another proxy endpoint to fetch raw Kirby data server-side
    addServerHandler({
      route: kirbyApiRoute,
      method: 'post',
      handler: resolve('runtime/server/api/kirby'),
    })

    // Add KQL composables
    addImportsDir(resolve('runtime/composables'))

    // Provide global KQL type helpers
    addTemplate({
      filename: 'types/nuxt-kql.d.ts',
      getContents: async () => `
declare module '#nuxt-kql' {
  // TODO: Update docs to import types from \`kirby-fest\` instead
  export * from 'kirby-fest'
}
`.trimStart(),
    })

    // Add global `#nuxt-kql` type import path
    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: `${nuxt.options.buildDir}/types/nuxt-kql.d.ts` })
    })

    // Prefetch custom KQL queries at build-time
    const prefetchResults = await prefetchQueries(options)

    // Add template for prefetched query data
    addTemplate({
      filename: 'kql.ts',
      write: true,
      getContents() {
        return [...prefetchResults.entries()]
          .map(
            ([key, response]) =>
              `export const ${key} = ${
                response?.result
                  ? JSON.stringify(response.result, undefined, 2)
                  : '{} as Record<string, any>'
              }\n` + `export type ${pascalCase(key)} = typeof ${key}\n`,
          )
          .join('\n')
      },
    })
  },
})
