# `usePublicKql`

::: info
Deprecated. Please use `useKql` instead with the option `{ client: true }` enabled.
:::

Returns KQL query data. Fetches the data directly from the Kirby instance. Requires `kql.clientRequests` option to be `true` in `nuxt.config.ts`.

Query responses are cached.

::: warning
Authorization credentials will be publicly visible. Also, possible CORS issues ahead if the backend is not configured properly. Use `useKql` if you're unsure what to do instead.
:::

## Types

See [`useKql`](/api/use-kql)

## Return Values

See [`useKql`](/api/use-kql)

## Example

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await usePublicKql(
  {
    query: 'site',
    select: {
      title: true,
      children: true,
    },
  },
  { client: true }
)
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
    <button @click="refresh()">
      Refresh
    </button>
  </div>
</template>
```
