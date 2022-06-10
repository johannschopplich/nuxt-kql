import { fileURLToPath } from 'url'
import { defu } from 'defu'
import { createResolver, defineNuxtModule } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Kirby API base URL, like `https://kirby.example.com/api`
   * @default 'process.env.KIRBY_API_URL'
   */
  url?: string

  /**
   * Kirby KQL API route path
   * @default 'query'
   */
  endpoint?: string

  /**
   * Authentication method
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
    url: process.env.KIRBY_API_URL as string,
    endpoint: 'query',
    auth: 'basic',
    token: process.env.KIRBY_API_TOKEN as string,
    credentials: {
      username: process.env.KIRBY_API_USERNAME as string,
      password: process.env.KIRBY_API_PASSWORD as string,
    },
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Public runtimeConfig
    nuxt.options.runtimeConfig.public.kql = defu(
      nuxt.options.runtimeConfig.public.kql,
      {
        url: options.url,
        endpoint: options.endpoint,
        auth: options.auth,
        token: options.token,
        credentials: options.credentials,
      },
    )

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    nuxt.hook('autoImports:dirs', (dirs) => {
      dirs.push(resolve(runtimeDir, 'composables'))
    })
  },
})
