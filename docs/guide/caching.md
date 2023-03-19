# Caching

## Client-side Caching

Query responses using the built-in [composables](api/#composables) are cached by default. Meaning, if you call the same query multiple times, the response will be cached and returned from the cache on subsequent calls.

For each query, a hash is calculated based on the query string and the requested language (in multi-language setups).

If you want to disable caching, you can do so by setting the `cache` option to `false`:

```ts
const { data } = await useKql(
  query,
  {
    // Disable caching
    cache: false
  }
)
```

## Server-side Caching

`nuxt-kql` lets you opt in to server-side caching of query responses. It does so by utilizing the [cache API](https://nitro.unjs.io/guide/cache) of Nuxt's underlying server engine, [Nitro](https://nitro.unjs.io). Query responses are cached in-memory. For short concurrent requests on your website, it will make a great performance difference, as the query response will be served from the cache instead of being fetched from the server again.

The default expiration time is set to 60 minutes. This limit will probably never be hit in serverless deployment environments.

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
      // Control stale-while-revalidate behavior
      // @default true
      swr: true,
      // Set a custom expiration time in seconds
      // @default 60 * 60
      maxAge: 60 * 60
    }
  }
})
```
