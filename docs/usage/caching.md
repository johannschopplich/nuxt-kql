# Caching

## Client-Side Caching

Query responses using the built-in [composables](/api/#composables) are cached by default. This means that if you call the same query multiple times, the response will be cached and returned from the cache on subsequent calls.

For each query, a hash is calculated based on the query string and the requested language (in multi-language setups).

If you want to disable caching, you can do so by setting the `cache` option to `false`:

```ts
const { data } = await useKql(
  query,
  {
    // Disable in-memory caching
    cache: false
  }
)
```

## Clearing the Cache

```ts
const { data, refresh, clear } = await useKql({ query: 'site' })

async function invalidateAndRefresh() {
  clear()
  await refresh()
}
```

## Server-Side Caching

Nuxt KQL allows you opt-in to server-side caching of query responses. It does this by using the [cache API](https://nitro.build/guide/cache) of Nuxt's underlying server engine, [Nitro](https://nitro.build). Query responses are cached in-memory by default, but you can use any storage mountpoint supported by Nitro. The full list of built-in storage mountpoints can be found in the [unstorage documentation](https://unstorage.unjs.io).

For short, concurrent requests on your site, caching will make a big difference in performance because the query response will be served from the cache rather than fetched from the server. The default expiration time is set to 60 minutes.

You can enable server-side caching by setting the `server.cache` module option to `true`. You can also set a custom expiration time in seconds by setting the `server.maxAge` option:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    server: {
      // Enable server-side caching
      // @default false
      cache: true,
      // Number of seconds to cache the query response
      // @default 1
      maxAge: 1
    }
  }
})
```

A custom storage mountpoint is appropriate for production environments. For example, if you are deploying to Cloudflare, the Clouflare KV storage mountpoint is a good choice. For development, you can use the built-in `fs` storage mountpoint.

To define a custom storage mountpoint, use the `storage` option of the Nuxt KQL module. In the example above, we use the `kql` storage mountpoint to store the query responses.

However, this custom storage mountpoint is not yet defined. To make it available, we need to mount it in the `nitro` section of our `nuxt.config.ts`:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  nitro: {
    storage: {
      kql: {
        // https://unstorage.unjs.io/drivers/cloudflare
        driver: 'cloudflareKVBinding',
        // Make sure to link the namespace in your worker settings
        binding: 'KV_BINDING'
      }
    },
    // Make sure to define a fallback storage mountpoint for
    // local development, since the Cloudflare KV binding is
    // not available locally
    devStorage: {
      kql: {
        driver: 'fs',
        base: '.data',
      },
    },
  }
})
```
