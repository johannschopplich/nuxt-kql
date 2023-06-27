# `KirbyQueryResponse`

Importable from `kirby-fest`.

```ts
import type { KirbyQueryResponse } from 'kirby-fest'
```

## Type Declarations

::: info
Types are re-exported from the [`kirby-fest`](https://github.com/johannschopplich/kirby-fest) package.
:::

```ts
interface KirbyQueryResponse<
  T = any,
  Pagination extends boolean = false
> {
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
