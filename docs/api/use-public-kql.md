# `usePublicKql`

Returns KQL query data. Fetches the data directly from the Kirby instance. Requires `kql.clientRequests` option to be `true` in `nuxt.config.ts`.

Query responses are cached.

::: warning
Authorization credentials will be publicly visible. Also, possible CORS issues ahead if the backend is not configured properly. Use `useKql` if you're unsure what to do instead.
:::

## Types

```ts
function usePublicKql<
  ResT extends KirbyQueryResponse = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
>(query: Ref<ReqT> | ReqT, opts?: UseKqlOptions<ResT>): AsyncData<ResT, true | Error>

type UseKqlOptions<T> = Omit<
  UseFetchOptions<T>,
  | 'baseURL'
  | 'params'
  | 'parseResponse'
  | 'pick'
  | 'responseType'
  | 'response'
  | 'transform'
  | keyof Omit<globalThis.RequestInit, 'headers'>
> & {
  /**
   * Language code to fetch data for in multilang Kirby setups
   */
  language?: string
}
```

`usePublicKql` infers all of Nuxt's [`useAsyncData` options](https://v3.nuxtjs.org/api/composables/use-async-data#params).

## Return Values

- **data**: the result of the KQL query
- **pending**: a boolean indicating whether the data is still being fetched
- **refresh**: a function that can be used to refresh the data returned by the handler function
- **error**: an error object if the data fetching failed

By default, Nuxt waits until a `refresh` is finished before it can be executed again. Passing `true` as parameter skips that wait.

## Example

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await usePublicKql({
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
    <button @click="refresh()">
      Refresh
    </button>
  </div>
</template>
```
