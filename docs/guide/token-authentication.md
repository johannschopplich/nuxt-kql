# Token-Based Authentication

`nuxt-kql` also supports using a bearer token for authentication. For this to work, you may use the [kirby-headless-starter](https://github.com/johannschopplich/kirby-headless-starter), which supports KQL with token authentication out of the box.

```ts
// `nuxt.config.ts`
import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    // Enable the token-based authentication
    kirbyAuth: 'bearer',
    // Needed for the kirby-headless-starter custom KQL endpoint
    kirbyEndpoint: 'kql',
  },
})
```

Set the following environment variables in your project's `.env` file:

```
KIRBY_BASE_URL=https://kirby.example.com
KIRBY_API_TOKEN=your-token
```