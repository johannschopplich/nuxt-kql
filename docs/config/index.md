# Module Configuration

## Usage

Adapt `nuxt-kql` to your needs by setting module options in your `nuxt.config.ts`:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    // ... your options
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
   * The queries will be fully typed and importable from `#nuxt-kql`
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
```
