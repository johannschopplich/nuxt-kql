# `$kirby`

Returns raw data from a Kirby instance for the given path.

Responses are cached by default between function calls for the same path based on a calculated hash of the path and fetch options.

## Type Declarations

```ts
function $kirby<T = any>(
  path: string,
  opts: KirbyFetchOptions = {},
): Promise<T>

type KirbyFetchOptions = Pick<
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
  language?: string
  /**
   * Cache the response between function calls for the same query.
   * @default true
   */
  cache?: boolean
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

const data = await $kirby<KirbyApiResponse<KirbySitemapItem[]>>('api/__sitemap__')

if (!data?.result) {
  throw new Error('Could not fetch sitemap data')
}
</script>

<template>
  <div>
    <ul>
      <li v-for="item in data.result" :key="item.url">
        <a :href="item.url">{{ item.url }}</a>
      </li>
    </ul>
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

Now, every `$kirby` call will be directly use the Kirby instance by sending requests from the client:

```ts{3}
const data = await $kirby('api/my-path')
```
