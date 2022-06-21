# `KirbyQueryResponse`

```ts
interface KirbyQueryResponse<Pagination extends boolean = false> {
  code: number
  status: string
  result?: Pagination extends true ? {
    data: any
    pagination: {
      page: number
      pages: number
      offset: number
      limit: number
      total: number
    }
  } : any
}
```
