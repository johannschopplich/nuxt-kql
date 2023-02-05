# Authentication Methods

::: tip
`nuxt-kql` ist suited to be used with [kirby-headless-starter](/guide/what-is-nuxt-kql#kirby-headless-starter). You may use it as a base for your KQL server.
:::

Depending on your Kirby setup, you can use one of the following authentication methods:

## Token-Based Authentication

`nuxt-kql` supports using a bearer token for authentication. For this to work, you will have to use the [kirby-headless-starter](https://github.com/johannschopplich/kirby-headless-starter), which supports KQL with token authentication out of the box, in contradiction to the default Kirby API that requires basic authentication for API endpoints.

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

## Basic Authentication

In the case you don't want to build upon the [kirby-headless-starter](https://github.com/johannschopplich/kirby-headless-starter), for example because you only want to opt-in to KQL with an existing Kirby project, you can use basic authentication.

::: info
The default KQL endpoint `/api/query` [requires basic authentication](https://getkirby.com/docs/guide/api/authentication).
:::

`nuxt-kql` automatically reads your environment variables. Create a `.env` file in your project (or edit the existing one) and add the following environment variables:

```
KIRBY_BASE_URL=https://kirby.example.com
KIRBY_API_USERNAME=your-username
KIRBY_API_PASSWORD=your-password
```
