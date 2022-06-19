# `$publicQuery`

Returns raw KQL query data. Fetches the data directly from the Kirby instance. Requires `kql.clientRequests` option to be `true` in `nuxt.config.ts`.

::: warning
Authorization credentials will be publicly visible. Also, possible CORS issues ahead if the backend is not configured properly. Use `$query` if you're unsure what to do instead.
:::

## Types

```ts
function $publicQuery<T = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  options: PublicQueryOptions = {},
): Promise<T>

// `FetchOptions` imported from `ohmyfetch`
type PublicQueryOptions = Omit<FetchOptions, 'baseURL' | 'body' | 'params' | 'parseResponse' | 'responseType' | 'response'>
```

## Example

```vue
<script setup lang="ts">
const data = await $publicQuery(
  {
    query: 'site',
    select: {
      title: 'site.title',
    },
  },
  {
    async onRequest({ request }) {
      console.log(request)
    },
    async onResponse({ response }) {
      console.log(response)
    },
    async onRequestError({ error }) {
      console.log(error)
    },
    async onResponseError({ error }) {
      console.log(error)
    },
  })
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
  </div>
</template>
```
