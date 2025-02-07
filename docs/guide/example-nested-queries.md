# Nested queries

When using multiple queries in a page or component, you can optimize performance by nesting them into a single request. This is useful when working with servers that impose rate limits on requests.

### Example

```ts
// Optional: Queries can be imported from a separate directory for cleaner code.
import { siteQuery, articlesQuery, navigationQuery } from '~/queries'

// Combine the queries in a single nested request
const { data } = await useKql<KirbyQueryResponse<{ title: string }>>({
  query: 'site',
  select: {
    site: siteQuery,
    articles: articlesQuery,
    navigation: navigationQuery
  }
})

// Separate the response data into its corresponding query results
const site = data?.value?.result.site
const articles = data?.value?.result.articles
const navigation = data?.value?.result.navigation
```
