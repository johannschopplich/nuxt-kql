# `KirbyQueryResponse`

Importable from `#nuxt-kql`.

```ts
import type { KirbyQueryResponse } from '#nuxt-kql'
```

## Types

```ts
interface KirbyQueryResponse<T = any, Pagination extends boolean = false> {
  code: number
  status: string
  result?: Pagination extends true
    ? {
        data: T
        pagination: {
          page: number
          pages: number
          offset: number
          limit: number
          total: number
        }
      }
    : T
}
```
