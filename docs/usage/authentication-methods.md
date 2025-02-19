# Authentication

::: tip
Nuxt KQL is designed to be used with the [Kirby Headless plugin](/guide/what-is-nuxt-kql#kirby-headless-plugin), a collection of best practices and tools for building headless Kirby projects. It includes a custom KQL endpoint that supports token-based authentication out of the box.
:::

Depending on your Kirby setup and project requirements, you can use one of the following authentication methods:

## Token-Based Authentication

Nuxt KQL supports the use of a bearer token for authentication when coupled with the [Kirby Headless plugin](https://github.com/johannschopplich/kirby-headless). It supports KQL with token authentication out of the box, unlike the default Kirby API which requires basic authentication for API endpoints.

Enable token-based authentication in your Nuxt project's `nuxt.config.ts` file:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    // Enable token-based authentication for the Kirby Headless plugin,
    // which includes a custom KQL endpoint `api/kql`
    auth: 'bearer'
  }
})
```

Set the following environment variables in your project's `.env` file:

```ini
KIRBY_BASE_URL=https://kirby.example.com
KIRBY_API_TOKEN=your-token
```

::: info
Make sure to set the same token as the `KIRBY_HEADLESS_API_TOKEN` environment variable in your headless Kirby project's `.env` file.
:::

## Basic Authentication

If you do not want to build your KQL API using [Kirby Headless plugin](https://github.com/johannschopplich/kirby-headless), you can use basic authentication. However, this method is not recommended for production environments due to security concerns.

::: tip
The default KQL endpoint `/api/query` [requires authentication](https://getkirby.com/docs/guide/api/authentication). You have to enable HTTP basic authentication in your Kirby project's `config.php` file:

```php
// `site/config/config.php`
return [
    'api' => [
        'basicAuth' => true,
        // For local development, you may want to disable SSL verification
        'allowInsecure' => true
    ]
];
```

:::

Nuxt KQL will automatically read your environment variables. Create an `.env` file in your project (or edit the existing one) and add the following environment variables:

```ini
KIRBY_BASE_URL=https://kirby.example.com
KIRBY_API_USERNAME=your-username
KIRBY_API_PASSWORD=your-password
```
