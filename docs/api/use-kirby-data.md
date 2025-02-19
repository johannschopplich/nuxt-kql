# `useKirbyData`

Returns raw data from a Kirby instance for the given path.

Responses are cached by default between function calls for the same path based on a calculated hash of the path and fetch options.

## Return Values

- `data`: the result of the asynchronous function that is passed in.
- `refresh`/`execute`: a function that can be used to refresh the data returned by the `handler` function.
- `error`: an error object if the data fetching failed.
- `status`: a string indicating the status of the data request (`'idle'`, `'pending'`, `'success'`, `'error'`).
- `clear`: a function which will set `data` to `undefined`, set `error` to `null`, set `status` to `'idle'`, and mark any currently pending requests as cancelled.

By default, Nuxt waits until a `refresh` is finished before it can be executed again.

## Caching

By default, a [unique key is generated](/usage/caching) based in input parameters for each request to ensure that data fetching can be properly de-duplicated across requests. To disable caching, set the `cache` option to `false`:

```ts
const { data } = await useKirbyData('api/my-path', {
  cache: false
})
```

Clear the cache for a specific path by calling the `clear` function. This will remove the cached data for the path and allow the next request to fetch the data from the server:

```ts
const { data, refresh, clear } = await useKirbyData('api/my-path')

async function invalidateAndRefresh() {
  clear()
  await refresh()
}
```

## Example

```vue
<script setup lang="ts">
import type { KirbyApiResponse } from 'kirby-types'

interface KirbySitemapItem {
  url: string
  modified: string
  links: {
    lang: string
    url: string
  }[]
}

const { data, refresh, error, status, clear } = await useKirbyData<KirbyApiResponse<KirbySitemapItem[]>>('api/__sitemap__')
</script>

<template>
  <div>
    <ul>
      <li v-for="item in data?.result" :key="item.url">
        <a :href="item.url">{{ item.url }}</a>
      </li>
    </ul>

    <button @click="refresh()">
      Refresh
    </button>
  </div>
</template>
```

## Allow Client Requests

::: warning
Authorization credentials will be publicly visible. Also, possible CORS issues ahead if the backend is not configured properly.
:::

To fetch data directly from your Kirby instance without the Nuxt proxy, set the module option `client` to `true`:

```ts{6}
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    client: true
  }
})
```

Now, every `useKirbyData` call will be directly use the Kirby instance by sending requests from the client:

```ts{3}
const { data } = await useKirbyData('api/my-path')
```

## Type Declarations

```ts
export function useKirbyData<T = any>(
  path: MaybeRefOrGetter<string>,
  opts: UseKirbyDataOptions<T> = {},
): AsyncData<T | null, NuxtError>

type UseKirbyDataOptions<T> = Omit<AsyncDataOptions<T>, 'watch'> & Pick<
  NitroFetchOptions<string>,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'query'
  | 'headers'
  | 'method'
  | 'body'
  | 'retry'
  | 'retryDelay'
  | 'retryStatusCodes'
  | 'timeout'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   */
  language?: MaybeRefOrGetter<string>
  /**
   * Cache the response between function calls for the same path.
   * @default true
   */
  cache?: boolean
  /**
   * Watch an array of reactive sources and auto-refresh the fetch result when they change.
   * Path and language are watched by default. You can completely ignore reactive sources by using `watch: false`.
   * @default undefined
   */
  watch?: MultiWatchSources | false
}
```

`useKirbyData` infers all of Nuxt's [`useAsyncData` options](https://nuxt.com/docs/api/composables/use-async-data#params).
