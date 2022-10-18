# `$publicKql`

::: warning
Deprecated. Please use `$kql` instead with the option `{ client: true }`.
:::

Returns raw KQL query data. Fetches the data directly from the Kirby instance. Requires `kql.client` option to be `true` in `nuxt.config.ts`.

::: warning
Authorization credentials will be publicly visible. Also, possible CORS issues ahead if the backend is not configured properly. Use `$kql` if you're unsure what to do instead.
:::

## Type Declarations

See [`$kql`](/api/kql).

## Example

```vue
<script setup lang="ts">
const data = await $kql(
  {
    query: 'site',
    select: ['title', 'children']
  },
  {
    client: true,
  }
)
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
  </div>
</template>
```
