import { fileURLToPath } from 'url'
import { defu } from 'defu'
import { addServerHandler, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Kirby base URL, like `https://kirby.example.com`
   * @default 'process.env.KIRBY_BASE_URL'
   */
  kirbyUrl?: string

  /**
   * Kirby KQL API route path
   * @default 'api/query'
   */
  kirbyEndpoint?: string

  /**
   * Kirby API authentication method
   * Set to `none` to disable authentication
   * @default 'basic'
   */
  kirbyAuth?: 'basic' | 'bearer' | 'none'

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
   * If enabled, you can use `usePublicQuery()` and `$publicQuery()` to fetch data
   * directly from the Kirby instance
   * Note: This means your token or user credentials will be publicly visible
   * @default false
   */
  clientRequests?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-kql',
    configKey: 'kql',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {
    kirbyUrl: process.env.KIRBY_BASE_URL as string,
    kirbyEndpoint: 'api/query',
    kirbyAuth: 'basic',
    token: process.env.KIRBY_API_TOKEN as string,
    credentials: {
      username: process.env.KIRBY_API_USERNAME as string,
      password: process.env.KIRBY_API_PASSWORD as string,
    },
    clientRequests: false,
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const apiRoute = '/api/__kql__' as const

    // Make sure Kirby URL and KQL endpoint are set
    if (!options.kirbyUrl)
      console.warn('Missing `KIRBY_BASE_URL` in `.env`')

    if (!options.kirbyEndpoint)
      console.warn('Missing `kql.kirbyEndpoint` option in Nuxt config')

    // Make sure authentication credentials are set
    if (options.kirbyAuth === 'basic' && (!options.credentials || !options.credentials.username || !options.credentials.password))
      console.warn('Missing `KIRBY_API_USERNAME` and `KIRBY_API_PASSWORD` in `.env` for basic authentication')

    if (options.kirbyAuth === 'bearer' && !options.token)
      console.warn('Missing `KIRBY_API_TOKEN` in `.env` for bearer authentication')

    // Private runtime config
    nuxt.options.runtimeConfig.kql = defu(
      nuxt.options.runtimeConfig.kql,
      options,
    )

    // Transpile runtime
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    // Add KQL proxy endpoint to send queries on server-side
    addServerHandler({
      route: apiRoute,
      method: 'post',
      handler: resolve(runtimeDir, 'server/api/kql'),
    })

    // Add KQL composables
    nuxt.hook('autoImports:dirs', (dirs) => {
      dirs.push(resolve(runtimeDir, 'composables'))
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      // Inline module runtime in Nitro bundle
      nitroConfig.externals = defu(typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {}, {
        inline: [resolve('./runtime')],
      })
    })

    addTemplate({
      filename: 'nuxt-kql/options.mjs',
      getContents() {
        return `
export const apiRoute = '${apiRoute}'
`.trimStart()
      },
    })

    addTemplate({
      filename: 'nuxt-kql/options.d.ts',
      getContents() {
        return `
export declare const apiRoute = '${apiRoute}'
`.trimStart()
      },
    })

    addTemplate({
      filename: 'types/nuxt-kql.d.ts',
      getContents: () => `
declare module '#nuxt-kql' {
  type KirbyQueryRequest = import('${resolve('./runtime/types')}').KirbyQueryRequest
  type KirbyQueryResponse<Pagination extends boolean = false> = import('${resolve('./runtime/types')}').KirbyQueryResponse<Pagination>
  type KirbyBlockType = import('${resolve('./runtime/types')}').KirbyBlockType
  type KirbyBlock<T extends string = KirbyBlockType, U = Record<string, any>> = import('${resolve('./runtime/types')}').KirbyBlock<T, U>
}
`.trimStart(),
    })

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: resolve(nuxt.options.buildDir, 'types/nuxt-kql.d.ts') })
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
