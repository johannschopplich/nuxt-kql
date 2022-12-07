# `KirbyQueryRequest`

Importable from `#nuxt-kql`.

```ts
import type { KirbyQueryRequest } from '#nuxt-kql'
```

## Type Declarations

::: info
Types are re-exported from the [`kirby-fest`](https://github.com/johannschopplich/kirby-fest) package.
:::

```ts
 type KirbyQueryModel<CustomModel extends string = never> =
  | 'collection'
  | 'file'
  | 'kirby'
  | 'page'
  | 'site'
  | 'user'
  | CustomModel

 type KirbyQuery<CustomModel extends string = never> =
  | KirbyQueryModel<CustomModel>
  | `${KirbyQueryModel<CustomModel>}.${string}`
  | `${KirbyQueryModel<CustomModel>}(${string})${string}`

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
