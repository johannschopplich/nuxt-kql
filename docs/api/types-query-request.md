# `KirbyQueryRequest`

```ts
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
