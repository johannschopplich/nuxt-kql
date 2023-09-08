import { join } from 'pathe'
import { defu } from 'defu'
import { pascalCase } from 'scule'
import { addImports, addServerHandler, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { KirbyQueryRequest } from 'kirby-types'
import { logger, prefetchQueries } from './prefetch'

export interface ModuleOptions {
  /**
   * Kirby base URL, like `https://kirby.example.com`
   *
   * @default process.env.KIRBY_BASE_URL
   */
  url?: string

  /**
   * Kirby KQL API route path
   *
   * @default 'api/query' for `basic` authentication
   * @default 'api/kql' for `bearer` authentication
   */
  prefix?: string

  /**
   * Kirby API authentication method
   *
   * @remarks
   * Set to `none` to disable authentication
   *
   * @default 'basic'
   */
  auth?: 'basic' | 'bearer' | 'none'

  /**
   * Token for bearer authentication
   *
   * @default process.env.KIRBY_API_TOKEN
   */
  token?: string

  /**
   * Username/password pair for basic authentication
   *
   * @default { username: process.env.KIRBY_API_USERNAME, password: process.env.KIRBY_API_PASSWORD }
   */
  credentials?: {
    username: string
    password: string
  }

  /**
   * Enable client-side requests besides server-side ones
   *
   * @remarks
   * By default, KQL data is fetched safely with a server-side proxy
   * If enabled, you can fetch data directly from the Kirby instance
   * Note: This means your token or user credentials will be publicly visible
   *
   * @default false
   */
  client?: boolean

  /**
   * Prefetch custom KQL queries at build-time
   *
   * @remarks
   * The queries will be fully typed and importable from `#build/kql`
   *
   * @default {}
   */
  prefetch?: Record<
    string,
    KirbyQueryRequest | { query: KirbyQueryRequest; language: string }
  >

  /**
   * Server-side features
   */
  server?: {
    /**
     * Enable server-side caching of queries using the Nitro cache API (in-memory cache)
     *
     * @see https://nitro.unjs.io/guide/cache
     */
    cache?: boolean

    /**
     * Enable stale-while-revalidate behavior (cache is served while a new request is made)
     *
     * @see https://nitro.unjs.io/guide/cache#options
     * @default true
     */
    swr?: boolean

    /**
     * Maximum age that cache is valid in seconds
     *
     * @see https://nitro.unjs.io/guide/cache#options
     * @default 60 * 60
     */
    maxAge?: number
  }
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
    prefix: '',
    auth: 'basic',
    token: process.env.KIRBY_API_TOKEN as string,
    credentials: {
      username: process.env.KIRBY_API_USERNAME as string,
      password: process.env.KIRBY_API_PASSWORD as string,
    },
    client: false,
    prefetch: {},
    server: {
      cache: false,
      swr: true,
      maxAge: 60 * 60,
    },
  },
  async setup(options, nuxt) {
    const moduleName = 'nuxt-kql'

    // Make sure Kirby URL and KQL endpoint are set
    if (!options.url)
      logger.error('Missing `KIRBY_BASE_URL` in `.env`')

    // Make sure authentication credentials are set
    if (options.auth === 'basic' && (!options.credentials || !options.credentials.username || !options.credentials.password))
      logger.error('Missing `KIRBY_API_USERNAME` and `KIRBY_API_PASSWORD` in `.env` for basic authentication')

    if (options.auth === 'bearer' && !options.token)
      logger.error('Missing `KIRBY_API_TOKEN` in `.env` for bearer authentication')

    if (!options.prefix) {
      if (options.auth === 'basic')
        options.prefix = 'api/query'

      if (options.auth === 'bearer')
        options.prefix = 'api/kql'
    }

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

    // Add KQL proxy endpoint to send queries server-side
    addServerHandler({
      route: '/api/__kql/:key',
      method: 'post',
      handler: resolve('runtime/server'),
    })

    // Add KQL composables
    addImports(
      ['$kirby', '$kql', 'useKirbyData', 'useKql'].map(name => ({
        name,
        as: name,
        from: resolve(`runtime/composables/${name}`),
      })),
    )

    nuxt.hook('nitro:config', (config) => {
      // Inline local server handler dependencies into Nitro bundle
      // Needed to circumvent "cannot find module" error in `server.ts` for the `utils` import
      config.externals ||= {}
      config.externals.inline ||= []
      config.externals.inline.push(resolve('runtime/utils'))
    })

    // Add `#nuxt-kql` module alias
    nuxt.options.alias[`#${moduleName}`] = join(nuxt.options.buildDir, `module/${moduleName}`)

    // Add `#nuxt-kql` module template
    addTemplate({
      filename: `module/${moduleName}.mjs`,
      getContents() {
        return `
export * from '../kql'
`.trimStart()
      },
    })

    // Add global `#nuxt-kql` types
    addTemplate({
      filename: `module/${moduleName}.d.ts`,
      getContents() {
        return `
// Generated by ${moduleName}
export * from 'kirby-types'
export * from '../kql'
`.trimStart()
      },
    })

    // Prefetch custom KQL queries at build-time
    const prefetchResults = await prefetchQueries(options)

    // Add template for prefetched query data
    addTemplate({
      // TODO: Move to `module/kql.ts`?
      filename: 'kql.ts',
      write: true,
      getContents() {
        const results = [...prefetchResults.entries()]

        if (!results.length)
          return 'export {}\n'

        return results
          .map(([key, response]) =>
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
