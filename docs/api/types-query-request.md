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
  | 'arrayItem'
  | 'structureItem'
  | 'block'
  | CustomModel

type KirbyQueryChain =
  // Allows for `site.title` but also `site.title.upper`, etc.
  | `${string}.${string}`
  // Allows for `page("id")<string>`, etc.
  | `${string}(${string})${string}`

export type KirbyQuery<CustomModel extends string = never> =
  | KirbyQueryModel<CustomModel>
  // Ensures that it must match the pattern exactly, but not more broadly
  | (string extends KirbyQueryChain ? never : KirbyQueryChain)

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
