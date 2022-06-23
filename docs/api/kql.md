# `$kql`

Returns raw KQL query data. Uses an internal server route to proxy requests.

Query responses are cached by default.

## Types

```ts
function $kql<T extends KirbyQueryResponse = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  options: KqlOptions = {},
): Promise<T>

interface KqlOptions {
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
    title: true,
    children: true,
  },
})
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
  </div>
</template>
```
