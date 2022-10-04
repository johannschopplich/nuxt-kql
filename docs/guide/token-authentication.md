# Token-Based Authentication

`nuxt-kql` also supports using a bearer token for authentication. For this to work, you will have to use the [kirby-headless-starter](https://github.com/johannschopplich/kirby-headless-starter), which supports KQL with token authentication out of the box.

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    // Enable token-based authentication for the kirby-headless-starter,
    // which includes a custom KQL endpoint `api/kql`
    auth: 'bearer',
  },
})
```

Set the following environment variables in your project's `.env` file:

```
KIRBY_BASE_URL=https://kirby.example.com
KIRBY_API_TOKEN=your-token
```

::: info
Make sure to set the same token as the `KIRBY_HEADLESS_API_TOKEN` environment variable in your headless Kirby project's `.env` file.
:::
