# Prefetching Queries

Nuxt KQL allows you to prefetch custom queries **at build-time** (during development and in production), recommended for infrequently changing data to increase performance in production. You can prefetch as many queries as you like. The query results as well as their TypeScript type will be importable from `#nuxt-kql`.

To get started, define a **key** for your query as well as the actual query request. Let's use `site` as an example key and fetch the site title solely:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    // Prefetch queries at build-time
    prefetch: {
      // Define key and query
      site: {
        query: 'site',
        select: ['title']
      }
    }
  }
})
```

When running your dev or build command, the `site` query result will be fetched, stored locally and the time spent on the request(s) logged.

```
ℹ Prefetched site KQL query in 170ms
```

Finally, the query result will be importable from `#nuxt-kql`:

```ts
// Import the query result following the query's given name in `nuxt.config.ts`
import { site } from '#nuxt-kql'

// Import the type for the query result above
import type { Site } from '#nuxt-kql'
```

::: info
The actual **type** for the key will be pascal cased, e.g. the key `somePageKey` will result in the type `SomePageKey`.
:::

## Multi-Language Queries

If you have a [multi-language](/guide/example-multi-language-sites) Kirby instance, you can define the language for each query individually. Let's use `site` as an example key and fetch the site title in German:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    prefetch: {
      site: {
        // Define a query and its language
        query: {
          query: 'site',
          select: ['title']
        },
        language: 'de'
      }
    }
  }
})
```

::: info
Note that the actual `query` to be fetched is nested under the `query` key.
:::
