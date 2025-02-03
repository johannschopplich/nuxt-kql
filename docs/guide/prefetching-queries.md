# Prefetching Queries

Nuxt KQL allows you to prefetch custom queries **at build time** (during development and in production). This is recommended for infrequently changing data to improve performance in production. You can prefetch as many queries as you like. The query results as well as their TypeScript type can be imported from `#nuxt-kql`.

To get started, define a **key** for your query as well as the actual query request. Let's use `site` as an example key and just get the site title:

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

When you run your dev or build command, the result of the `site` query is fetched, stored locally, and the time spent on the query(s) is logged.

```
ℹ Prefetched site KQL query in 170ms
```

Now you can import the query result and its TypeScript type in your application:

```ts
// Import the type for the query result below
import type { Site } from '#nuxt-kql'

// Import the query result following the query's given name in `nuxt.config.ts`
import { site } from '#nuxt-kql'
```

::: info
The actual **type** for the key will be pascal-cased, e.g. the key `somePageKey` will result in the type `SomePageKey`.
:::

## Multi-Language Queries

If you have a [multi-language](/guide/multi-language-sites) Kirby instance, you can specify the language for each query individually. Let's use `site` as an example key and get the site title in German:

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
