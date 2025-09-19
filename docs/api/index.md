# API Reference

Nuxt Kirby provides powerful composables for fetching data from your Kirby CMS and a set of types for type-safe queries and responses.

## Composables

::: info
All composables are [auto-imported](https://nuxt.com/docs/guide/concepts/auto-imports) by Nuxt and available globally in your project.
:::

### KQL (Kirby Query Language)

Ideal for content queries with relationships and filtering:

- **[`useKql`](/api/use-kql)** – Reactive KQL queries with caching
- **[`$kql`](/api/kql)** – Direct KQL calls for programmatic use

### Direct Kirby API Access

Perfect for simple data fetching, file handling, and custom endpoints:

- **[`useKirbyData`](/api/use-kirby-data)** – Reactive data fetching with caching
- **[`$kirby`](/api/kirby)** – Direct API calls for programmatic use

## Common Usage Patterns

```ts
// KQL query
const { data } = await useKql({
  query: 'page("about")',
  select: { title: true, text: 'page.text.kirbytext' }
})

// Direct API access
const { data } = await useKirbyData('api/pages/about')
```

## Type Safety

Nuxt Kirby includes TypeScript types for KQL queries and responses to enhance developer experience and catch errors early. The core types are:

- [Query Types](/api/types-query) – To build type-safe KQL queries
- [Request Types](/api/types-request) – For typing request payloads
- [Response Types](/api/types-response) – For typing response data

You can use these types to ensure your queries and responses are correctly typed. Here's an example of a type-safe KQL query:

```ts
import type { KirbyQueryRequest, KirbyQueryResponse } from '#nuxt-kirby'

interface BlogPost {
  title: string
  date: string
  author: { name: string }
}

const { data } = await useKql<KirbyQueryResponse<BlogPost[]>>({
  query: 'page("blog").children',
  select: {
    title: true,
    date: 'page.date.toDate("Y-m-d")',
    author: {
      query: 'page.author.toUser',
      select: ['name']
    }
  }
})
```
