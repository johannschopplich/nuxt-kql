# Batching KQL Queries

Fetching multiple KQL queries in a single request can significantly improve performance by reducing the number of HTTP requests made to the server. Nuxt Kirby supports batching multiple queries into a single request using the [`useKql`](/api/use-kql) composable.

To batch multiple queries, you can pass an object to the `select` property of the [`useKql`](/api/use-kql) composable. Each key in the object represents a separate query, and the value is an object containing the actual KQL query and an optional `select` array to limit the returned fields.

```ts
// Optional: DRY up your queries by defining them in a separate file
import { articlesQuery, navigationQuery, siteQuery } from '~/queries'

// Batch multiple KQL queries in a single request
const { data } = await useKql({
  query: 'site',
  select: {
    site: siteQuery,
    articles: articlesQuery,
    navigation: navigationQuery
  }
})

// Access the results of each query
const site = computed(() => data.value?.result.site)
const articles = computed(() => data.value?.result.articles)
const navigation = computed(() => data.value?.result.navigation)
```
