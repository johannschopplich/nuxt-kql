# `useKql`

Returns KQL query data. Uses an internal server route to proxy requests.

Query responses are cached by default between function calls for the same query based on a calculated hash.

## Type Declarations

```ts
function useKql<
  ResT extends KirbyQueryResponse = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
>(
  query: MaybeComputedRef<ReqT>,
  opts?: UseKqlOptions<ResT>,
): AsyncData<ResT, FetchError>

type UseKqlOptions<T> = AsyncDataOptions<T> & Pick<
  FetchOptions,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'headers'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups
   */
  language?: string
  /**
   * Skip the Nuxt server proxy and fetch directly from the API.
   * Requires `client` to be enabled in the module options as well.
   * @default false
   */
  client?: boolean
  /**
   * Cache the response between function calls for the same query
   * @default true
   */
  cache?: boolean
}
```

`useKql` infers all of Nuxt's [`useAsyncData` options](https://nuxt.com/docs/api/composables/use-async-data#params).

## Return Values

- **data**: the result of the KQL query
- **pending**: a boolean indicating whether the data is still being fetched
- **refresh**: a function that can be used to refresh the data returned by the handler function
- **error**: an error object if the data fetching failed

By default, Nuxt waits until a `refresh` is finished before it can be executed again. Passing `true` as parameter skips that wait.

## Example

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await useKql({
  query: 'site',
  select: ['title', 'children']
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

### Public Requests in Client

To fetch data directly from the Kirby instance, set the option `{ client: true }`. Requires `kql.client` option to be `true` in `nuxt.config.ts` as well.

::: warning
Authorization credentials will be publicly visible. Also, possible CORS issues ahead if the backend is not configured properly.
:::

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await useKql(
  {
    query: 'site',
    select: ['title', 'children']
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
