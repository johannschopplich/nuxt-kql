# Server-Side Cache

`nuxt-kql` lets you opt in to server-side caching of query responses. It does so by utilizing the [storage layer](https://nitro.unjs.io/guide/introduction/storage) of Nuxt's underlying server engine, [Nitro](https://nitro.unjs.io). Query responses are cached in-memory. For short concurrent requests on your website, it will make a great performance difference.

The default expiration time is set to 15 minutes (`900` seconds). This limit will probably never be hit in serverless deployment environments.

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    server: {
      // Enable server-side caching
      cache: true,
    },
  },
})
```
