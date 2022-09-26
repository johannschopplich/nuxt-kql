# `KirbyQueryRequest`

Importable from `#nuxt-kql`.

```ts
import type { KirbyQueryRequest } from '#nuxt-kql'
```

## Types

::: info
Types are re-exported from the [`kirby-fest`](https://github.com/johannschopplich/kirby-fest) package.
:::

```ts
type KirbyQueryModel<T extends string = never> =
  | 'collection'
  | 'file'
  | 'kirby'
  | 'page'
  | 'site'
  | 'user'
  | T

type KirbyQuery<T extends string = never> =
  | KirbyQueryModel<T>
  | `${KirbyQueryModel<T>}.${string}`
  | `${KirbyQueryModel<T>}(${string})`

interface KirbyQuerySchema {
  query: KirbyQuery
  select?: string[] | Record<string, string | number | boolean | KirbyQuerySchema>
}

interface KirbyQueryRequest extends KirbyQuerySchema {
  pagination?: {
    /** @default 100 */
    limit?: number
    page?: number
  }
}
```
