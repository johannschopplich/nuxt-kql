# Module Configuration

## Usage

Adapt `nuxt-kql` to your needs by setting module options in your `nuxt.config.ts`:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    // ... Your options here
  }
})
```

## Type Declarations

See the types below for a complete list of options.

```ts
interface ModuleOptions {
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
     * @default true
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
```
