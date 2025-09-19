import type { KirbyQueryRequest } from 'kirby-types'
import process from 'node:process'
import { addImports, addServerHandler, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'
import { join } from 'pathe'
import { pascalCase } from 'scule'
import { withLeadingSlash } from 'ufo'
import { name } from '../package.json'
import { logger } from './kit'
import { prefetchQueries } from './prefetch'

const KIRBY_TYPES_PKG_EXPORT_NAMES = [
  'KirbyApiResponse',
  'KirbyBlock',
  'KirbyDefaultBlockType',
  'KirbyDefaultBlocks',
  'KirbyLayout',
  'KirbyLayoutColumn',
  'KirbyQuery',
  'KirbyQueryChain',
  'KirbyQueryModel',
  'KirbyQueryRequest',
  'KirbyQueryResponse',
  'KirbyQuerySchema',
]

// #region options
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
   * @default 'api/query' // for `basic` authentication
   * @default 'api/kql' // for `bearer` authentication
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
   * Send client-side requests instead of using the server-side proxy
   *
   * @remarks
   * By default, KQL data is fetched safely with a server-side proxy.
   * If enabled, query requests will be be sent directly from the client.
   * Note: This means your token or user credentials will be publicly visible.
   * If Nuxt SSR is disabled, this option is enabled by default.
   *
   * @default false
   */
  client?: boolean

  /**
   * Prefetch custom KQL queries at build-time
   *
   * @remarks
   * The queries will be fully typed and importable from `#nuxt-kql`.
   *
   * @default {}
   */
  prefetch?: Record<
    string,
    KirbyQueryRequest | { query: KirbyQueryRequest, language: string }
  >

  /**
   * Server-side features
   */
  server?: {
    /**
     * Enable server-side caching of queries using the Nitro cache API
     *
     * @see https://nitro.unjs.io/guide/cache
     */
    cache?: boolean

    /**
     * Name of the storage mountpoint to use for caching
     *
     * @see https://nitro.unjs.io/guide/cache
     * @default 'cache'
     */
    storage?: string

    /**
     * Enable stale-while-revalidate behavior (cache is returned while it is being updated)
     *
     * @see https://nitro.unjs.io/guide/cache#options
     * @default false
     */
    swr?: boolean

    /**
     * Number of seconds to cache the query response
     *
     * @see https://nitro.unjs.io/guide/cache#options
     * @default 1
     */
    maxAge?: number

    /**
     * Log verbose errors to the console if a query fails
     *
     * @remarks
     * This will log the full query to the console. Depending on the content of the query, this could be a security risk.
     *
     * @default false
     */
    verboseErrors?: boolean
  }
}
// #endregion options

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    kql: ModuleOptions
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    configKey: 'kql',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: {
    url: process.env.KIRBY_BASE_URL || '',
    prefix: '',
    auth: 'basic',
    token: process.env.KIRBY_API_TOKEN || '',
    credentials: {
      username: process.env.KIRBY_API_USERNAME || '',
      password: process.env.KIRBY_API_PASSWORD || '',
    },
    client: false,
    prefetch: {},
    server: {
      cache: false,
      storage: 'cache',
      swr: false,
      maxAge: 1,
      verboseErrors: false,
    },
  },
  async setup(options, nuxt) {
    const moduleName = name

    logger.warn('`nuxt-kql` has been renamed to `nuxt-kirby`. Please update your dependencies!')

    // Make sure Kirby URL and KQL endpoint are set
    if (!options.url)
      logger.error('Missing `KIRBY_BASE_URL` environment variable')

    // Make sure authentication credentials are set
    if (options.auth === 'basic' && (!options.credentials || !options.credentials.username || !options.credentials.password))
      logger.error('Missing `KIRBY_API_USERNAME` and `KIRBY_API_PASSWORD` environment variable for basic authentication')

    if (options.auth === 'bearer' && !options.token)
      logger.error('Missing `KIRBY_API_TOKEN` environment variable for bearer authentication')

    if (!options.prefix) {
      if (options.auth === 'basic')
        options.prefix = 'api/query'
      else if (options.auth === 'bearer')
        options.prefix = 'api/kql'
    }

    if (!nuxt.options.ssr) {
      logger.info('KQL requests are client-only because SSR is disabled')
      options.client = true
    }

    if (options.server) {
      // The Nitro storage mountpoint requires a leading slash
      options.server.storage ||= 'cache'
      options.server.storage = withLeadingSlash(options.server.storage)
    }

    // Private runtime config
    nuxt.options.runtimeConfig.kql = defu(
      nuxt.options.runtimeConfig.kql,
      options,
    )

    // Write data to public runtime config if client requests are enabled
    nuxt.options.runtimeConfig.public.kql = defu(
      nuxt.options.runtimeConfig.public.kql as Required<ModuleOptions>,
      options.client
        ? options
        : { client: false },
    )

    // Transpile runtime
    const { resolve } = createResolver(import.meta.url)
    nuxt.options.build.transpile.push(resolve('runtime'))

    // Add KQL proxy endpoint to send queries server-side
    addServerHandler({
      route: '/api/__kirby__/:key',
      handler: resolve('runtime/server/handler'),
      method: 'post',
    })

    // Add KQL composables
    addImports(
      ['$kirby', '$kql', 'useKirbyData', 'useKql'].map(name => ({
        name,
        as: name,
        from: resolve(`runtime/composables/${name}`),
      })),
    )

    nuxt.hooks.hook('nitro:config', (config) => {
      // Inline local server handler dependencies into Nitro bundle
      // Needed to circumvent "cannot find module" error in `server.ts` for the `utils` import
      config.externals ||= {}
      config.externals.inline ||= []
      config.externals.inline.push(resolve('runtime/utils'))

      // Add Nitro auto-imports for composables
      config.imports = defu(config.imports, {
        presets: [{
          from: resolve('runtime/server/imports'),
          imports: ['$kirby', '$kql'],
        }],
      })
    })

    // Add `#nuxt-kql` module alias
    nuxt.options.alias[`#${moduleName}`] = join(nuxt.options.buildDir, `module/${moduleName}`)

    // Prefetch custom KQL queries at build-time
    const prefetchedQueries = await prefetchQueries(options)

    // Add `#nuxt-kql` module templates
    // (1) Generate module entry point
    addTemplate({
      filename: `module/${moduleName}.mjs`,
      write: true,
      getContents() {
        return `
// Generated by ${moduleName}
${[...prefetchedQueries.entries()].map(([key, response]) => `
export const ${key} = ${JSON.stringify(response?.result || null, undefined, 2)}
`.trimStart()).join('') || `export {}\n`}`.trimStart()
      },
    })

    // (2) Generate type definitions
    addTemplate({
      filename: `module/${moduleName}.d.ts`,
      write: true,
      getContents() {
        return `
// Generated by ${moduleName}
export type { ${KIRBY_TYPES_PKG_EXPORT_NAMES.join(', ')} } from 'kirby-types'

${[...prefetchedQueries.entries()].map(([key, response]) => `
export declare const ${key}: ${JSON.stringify(response?.result || null, undefined, 2)}
export type ${pascalCase(key)} = typeof ${key}
`.trimStart()).join('') || `export {}\n`}`.trimStart()
      },
    })
  },
})
