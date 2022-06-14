# API Reference

`nuxt-kql` offers several composables to fetch KQL queries. All composables are [auto-imported](https://v3.nuxtjs.org/guide/concepts/auto-imports) and globally available inside your `<script setup>`.

## `useKql`

Returns KQL query data. Uses a internal server route to proxy requests.

**Type:**

```ts
function useKql<ResT = KqlQueryResponse, ReqT = KqlQueryRequest>(
  query: Ref<ReqT> | ReqT | (() => ReqT),
  opts?: UseKqlOptions<ResT>
): AsyncData<ResT, true | Error>
```

`useKql` infers all of Nuxt's [`useAsyncData` options](https://v3.nuxtjs.org/api/composables/use-async-data#params).

**Return Values:**

- **data**: the result of the KQL query
- **pending**: a boolean indicating whether the data is still being fetched
- **refresh**: a function that can be used to refresh the data returned by the handler function
- **error**: an error object if the data fetching failed

By default, Nuxt waits until a `refresh` is finished before it can be executed again. Passing `true` as parameter skips that wait.

**Example:**

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await useKql({
  query: 'site',
  select: {
    title: 'site.title',
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

## `usePublicKql`

Returns KQL query data. Fetches the data directly from the Kirby instance. Requires `kql.clientRequests` option to be `true` in `nuxt.config.ts`.

::: warning
Authorization credentials will be publicly visible. Also, possible CORS issues ahead if the backend is not configured properly. Use `useKql` if you're unsure what to do instead.
:::

**Type:**

```ts
function usePublicKql<ResT = KqlQueryResponse, ReqT = KqlQueryRequest>(
  query: Ref<ReqT> | ReqT | (() => ReqT),
  opts?: UseKqlOptions<ResT>
): AsyncData<ResT, true | Error>
```

`usePublicKql` infers all of Nuxt's [`useAsyncData` options](https://v3.nuxtjs.org/api/composables/use-async-data#params).

### Return Values

- **data**: the result of the KQL query
- **pending**: a boolean indicating whether the data is still being fetched
- **refresh**: a function that can be used to refresh the data returned by the handler function
- **error**: an error object if the data fetching failed

By default, Nuxt waits until a `refresh` is finished before it can be executed again. Passing `true` as parameter skips that wait.

### Example

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await usePublicKql({
  query: 'site',
  select: {
    title: 'site.title',
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
