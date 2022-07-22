# `$publicKql`

Returns raw KQL query data. Fetches the data directly from the Kirby instance. Requires `kql.clientRequests` option to be `true` in `nuxt.config.ts`.

::: warning
Authorization credentials will be publicly visible. Also, possible CORS issues ahead if the backend is not configured properly. Use `$kql` if you're unsure what to do instead.
:::

## Types

```ts
function $publicKql<T extends KirbyQueryResponse = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  options: PublicKqlOptions = {},
): Promise<T>

// `FetchOptions` imported from `ohmyfetch`
type PublicKqlOptions = Omit<
  FetchOptions,
  'baseURL' | 'body' | 'params' | 'parseResponse' | 'responseType' | 'response'
> & {
  /**
   * Language code to fetch data for in multilang Kirby setups
   */
  language?: string
}
```

## Example

```vue
<script setup lang="ts">
const data = await $publicKql(
  {
    query: 'site',
    select: {
      title: true,
      children: true,
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
