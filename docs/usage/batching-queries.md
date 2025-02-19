# Batching Queries

If multiple query requests are needed, they can be combined into a single request. This is useful for reducing the number of requests to the server and improving performance.

The Kirby Query Language supports nested queries by defining a query object with multiple keys. Each key represents a query request that can be executed in parallel:

```ts
// Optional: Queries can be imported from a separate directory for cleaner code
import { articlesQuery, navigationQuery, siteQuery } from '~/queries'

// Combine the queries in a single nested request
const { data } = await useKql({
  query: 'site',
  select: {
    site: siteQuery,
    articles: articlesQuery,
    navigation: navigationQuery
  }
})

// Extract the data from the response
const site = computed(() => data.value?.result.site)
const articles = computed(() => data.value?.result.articles)
const navigation = computed(() => data.value?.result.navigation)
```
