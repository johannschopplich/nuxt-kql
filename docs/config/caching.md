# Caching

## Client-Side Caching

Query responses using the built-in [composables](/api/#composables) are cached by default. Meaning, if you call the same query multiple times, the response will be cached and returned from the cache on subsequent calls.

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

## Server-Side Caching

`nuxt-kql` lets you opt in to server-side caching of query responses. It does so by utilizing the [cache API](https://nitro.unjs.io/guide/cache) of Nuxt's underlying server engine, [Nitro](https://nitro.unjs.io). Query responses are cached in-memory by default, but you can use any storage mountpoints supported by Nitro. The full list of built-in storage mountpoints can be found in the [unstorage documentation](https://unstorage.unjs.io).

For short concurrent requests on your website, caching will make a great performance difference, as the query response will be served from the cache instead of being fetched from the server again. The default expiration time is set to 60 minutes.

You can enable server-side caching by setting the `server.cache` module option to `true`. You can also set a custom expiration time in seconds by setting the `server.maxAge` option or disable stale-while-revalidate behavior by setting the `server.swr` option to `false`:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    server: {
      // Enable server-side caching
      // @default false
      cache: true,
      // Name of the storage mountpoint to use for caching
      // @default 'cache'
      storage: 'kql',
      // Control stale-while-revalidate behavior
      // @default false
      swr: false,
      // Number of seconds to cache the query response
      // @default 1
      maxAge: 1
    }
  }
})
```

A custom storage mountpoint is suitable for production environments. For example, if you deploy to Cloudflare, the Clouflare KV storage mountpoint is a good choice. For development, you can use the built-in `fs` storage mountpoint.

To define a custom storage mountpoint, use the `storage` option of the `nuxt-kql` module. In the example above, we use the `kql` storage mountpoint to store the query responses.

But this custom storage mountpoint is not defined yet. To make it available, we need to mount it in the `nitro` section of our `nuxt.config.ts`:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  nitro: {
    storage: {
      kql: {
        // https://unstorage.unjs.io/drivers/cloudflare-kv-binding
        driver: 'cloudflareKVBinding',
        // Make sure to link the namespace in your Cf worker settings
        binding: '__MY_NAMESPACE'
      }
    },
    // Make sure to define a fallback storage mountpoint for
    // local development, since the Cloudflare KV binding is
    // not available locally
    devStorage: {
      kql: {
        driver: 'fs',
        base: 'data/kql',
      },
    },
  }
})
```
