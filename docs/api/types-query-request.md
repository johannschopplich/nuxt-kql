# `KirbyQueryRequest`

Importable from `#nuxt-kql`.

```ts
import type { KirbyQueryRequest } from '#nuxt-kql'
```

## Types

```ts
type KirbyQueryModel = 'collection' | 'file' | 'kirby' | 'page' | 'site' | 'user'
type KirbyQuery = KirbyQueryModel | `${KirbyQueryModel}.${string}` | `${KirbyQueryModel}(${string})`

interface KirbyQueryRequest {
  /**
   * @example
   * kirby.page("about")
   */
  query: `${'kirby' | 'site' | 'page'}${string}`
  select?: Record<string, any> | string[]
  pagination?: {
    /** @default 100 */
    limit?: number
    page?: number
  }
}
```
