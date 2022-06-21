# `useQuery`

Returns KQL query data. Uses an internal server route to proxy requests.

Query responses are cached.

## Types

```ts
function useQuery<ResT = KirbyQueryResponse, ReqT = KirbyQueryRequest>(
  query: Ref<ReqT> | ReqT,
  opts?: UseQueryOptions<ResT>
): AsyncData<ResT, true | Error>

type UseQueryOptions<T> = Omit<UseFetchOptions<T>, 'baseURL' | 'body' | 'params' | 'parseResponse' | 'responseType' | 'response'>
```

`useQuery` infers all of Nuxt's [`useAsyncData` options](https://v3.nuxtjs.org/api/composables/use-async-data#params).

## Return Values

- **data**: the result of the KQL query
- **pending**: a boolean indicating whether the data is still being fetched
- **refresh**: a function that can be used to refresh the data returned by the handler function
- **error**: an error object if the data fetching failed

By default, Nuxt waits until a `refresh` is finished before it can be executed again. Passing `true` as parameter skips that wait.

## Example

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await useQuery({
  query: 'site',
  select: {
    title: 'site.title',
    children: 'site.children',
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
