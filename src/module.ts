import { readFile } from 'fs/promises'
import { defu } from 'defu'
import { addServerHandler, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'

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
    url: process.env.KIRBY_BASE_URL as string,
    prefix: 'api/query',
    auth: 'basic',
    token: process.env.KIRBY_API_TOKEN as string,
    credentials: {
      username: process.env.KIRBY_API_USERNAME as string,
      password: process.env.KIRBY_API_PASSWORD as string,
    },
    clientRequests: false,
  },
  async setup(options, nuxt) {
    const apiRoute = '/api/__kql__' as const

    // Make sure Kirby URL and KQL endpoint are set
    if (!options.url)
      console.warn('Missing `KIRBY_BASE_URL` in `.env`')

    if (!options.prefix)
      console.warn('Missing `kql.prefix` option in Nuxt config')

    // Make sure authentication credentials are set
    if (options.auth === 'basic' && (!options.credentials || !options.credentials.username || !options.credentials.password))
      console.warn('Missing `KIRBY_API_USERNAME` and `KIRBY_API_PASSWORD` in `.env` for basic authentication')

    if (options.auth === 'bearer' && !options.token)
      console.warn('Missing `KIRBY_API_TOKEN` in `.env` for bearer authentication')

    // Private runtime config
    nuxt.options.runtimeConfig.kql = defu(
      nuxt.options.runtimeConfig.kql,
      options,
    )

    // Transpile runtime
    const { resolve } = createResolver(import.meta.url)
    nuxt.options.build.transpile.push(resolve('runtime'))

    nuxt.hook('nitro:config', (nitroConfig) => {
      // Inline module runtime in Nitro bundle
      nitroConfig.externals = defu(typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {}, {
        inline: [resolve('runtime')],
      })
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

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: `${nuxt.options.buildDir}/types/nuxt-kql.d.ts` })
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
