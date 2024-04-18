# `KirbyQueryResponse`

Importable from `#nuxt-kql`.

```ts
import type { KirbyQueryResponse } from '#nuxt-kql'
```

## Type Declarations

::: info
Types are re-exported from the [`kirby-types`](https://github.com/johannschopplich/kirby-types) package.
:::

```ts
interface KirbyApiResponse<T = any> {
  code: number;
  status: string;
  result?: T;
}

type KirbyQueryResponse<
  T = any,
  Pagination extends boolean = false
> = KirbyApiResponse<
  Pagination extends true
    ? {
        data: T;
        pagination: {
          page: number;
          pages: number;
          offset: number;
          limit: number;
          total: number;
        };
      }
    : T
>;
```
