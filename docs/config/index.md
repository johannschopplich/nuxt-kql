# Module Config

## Usage

Adapt `nuxt-kql` to your needs by setting module options in your `nuxt.config.ts`:

```ts
import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: ['nuxt-kql'],
  kql: {
    // ... your options
  }
})
```

## Types

See the types below for a complete list of options.

```ts
interface ModuleOptions {
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
   * If enabled, you can use `usePublicQuery()` and `$publicQuery()` to fetch data
   * directly from the Kirby instance
   * Note: This means your token or user credentials will be publicly visible
   * @default false
   */
  clientRequests?: boolean
}
```
