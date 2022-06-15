# `$kql`

Returns raw KQL query data. Uses an internal server route to proxy requests.

Queries are cached by default.

## Types

```ts
function $kql<T = KqlQueryResponse>(
  query: KqlQueryRequest,
  options: KqlPrivateFetchOptions = {},
): Promise<T>

interface KqlPrivateFetchOptions {
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
const data = await $kql({
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
