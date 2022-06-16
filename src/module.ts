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
   * By default, KQL queries are fetched safely for client as well as server via
   * an internal server API route
   * If enabled, you can use `usePublicKql()` and `$publicKql()` to fetch data
   * directly from the Kirby instance
   * Note: This means your token or user credentials will be publicly visible
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
    kirbyUrl: process.env.KIRBY_BASE_URL,
    kirbyEndpoint: 'api/query',
    kirbyAuth: 'basic',
    token: process.env.KIRBY_API_TOKEN,
    credentials: {
      username: process.env.KIRBY_API_USERNAME,
      password: process.env.KIRBY_API_PASSWORD,
    },
    clientRequests: false,
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const { clientRequests } = options
    const apiRoute = '/api/__kql__' as const

    // Private runtime config
    nuxt.options.runtimeConfig.kql = defu(
      nuxt.options.runtimeConfig.kql,
      options,
    )

    // Public runtime config
    nuxt.options.runtimeConfig.public.kql = defu(
      nuxt.options.runtimeConfig.public.kql,
      options,
    )

    // Protect authorization data if no public requests are used
    if (!clientRequests) {
      const { kql } = nuxt.options.runtimeConfig.public
      kql.kirbyUrl = ''
      kql.kirbyEndpoint = ''
      kql.kirbyAuth = ''
      kql.token = ''
      kql.credentials = { username: '', password: '' }
    }

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    nuxt.hook('autoImports:dirs', (dirs) => {
      dirs.push(resolve(runtimeDir, 'composables'))
    })

    addServerHandler({
      route: apiRoute,
      handler: resolve(runtimeDir, 'server/api.ts'),
    })

    addTemplate({
      filename: 'nuxt-kql-options.ts',
      write: true,
      getContents() {
        return `
export const apiRoute = '${apiRoute}'
`.trimStart()
      },
    })
  },
})
