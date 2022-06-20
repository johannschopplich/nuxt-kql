# `$query`

Returns raw Kirby query data. Uses an internal server route to proxy requests.

Queries are cached by default.

## Types

```ts
function $query<T = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  options: QueryOptions = {},
): Promise<T>

interface QueryOptions {
  /**
   * Cache result with same query for hydration
   *
   * @default true
   */
  cache?: boolean
}
```

## Example

```vue
<script setup lang="ts">
const data = await $query({
  query: 'site',
  select: {
    title: 'site.title',
  },
})
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
  </div>
</template>
```
