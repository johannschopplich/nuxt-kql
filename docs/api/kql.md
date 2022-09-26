# `$kql`

Returns raw KQL query data. Uses an internal server route to proxy requests.

Query responses are cached by default.

## Types

```ts
function $kql<T extends KirbyQueryResponse = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlOptions = {},
): Promise<T>

interface KqlOptions {
  /**
   * Language code to fetch data for in multilang Kirby setups
   */
  language?: string
  /**
   * Custom headers to send with the request
   */
  headers?: HeadersInit
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
