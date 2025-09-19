# Data Fetching Methods

Nuxt Kirby offers two complementary approaches to fetch data from your Kirby CMS. Understanding when to use each method will help you build more efficient and maintainable applications.

::: tip
In most cases, KQL queries with `useKql` and `$kql` are preferred for their flexibility and type safety. However, `useKirbyData` and `$kirby` are excellent for simple data fetching and direct API access.
:::

## Methods Comparison

Access your Kirby CMS data using either KQL or direct API access:

| Method | Composables | Description |
|--------|-------------|-------------|
| KQL | `useKql`, `$kql` | Kirby Query Language for content queries for simple and complex data structures and relationships. |
| Direct Kirby API Access | `useKirbyData`, `$kirby` | Direct access to Kirby's REST API for custom endpoints. |

## Composables Comparison

In you Vue components, you can choose between reactive data fetching with `useKirbyData` / `useKql` or programmatic one-time actions with `$kirby` / `$kql`.

| Feature | **`useKirbyData` / `useKql`** | **`$kirby` / `$kql`** |
|---------|---------------------------|-------------------|
| **Use case** | Components, reactive data | One-time actions |
| **Return type** | [`AsyncData`](https://nuxt.com/docs/api/composables/use-async-data#return-values) interface | Direct Promise |
| **Error handling** | Reactive error property | Try/catch with `FetchError` |
| **Best for** | Simple data, files, custom endpoints | Complex queries, relationships |

## Method 1: KQL (Kirby Query Language)

Use `useKql` and `$kql` as your daily driver for fetching content from Kirby. KQL is designed to handle complex queries and relationships efficiently.

Commonly, use `useKql` in your Vue components to fetch and reactively update data. For example, fetching a page's title and text:

```vue
<script setup lang="ts">
const { data } = await useKql({
  query: 'page("home")',
  select: {
    title: true,
    text: 'page.text.kirbytext',
  }
})
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
    <div v-html="data?.result?.text" />
  </div>
</template>
```

## Method 2: Direct Kirby API Access

Use `useKirbyData` and `$kirby` to access Kirby's REST API directly. This method is ideal when you need to fetch simple data or interact with custom endpoints.

A common example is a Nuxt plugin that fetches site-wide settings once and stores them in a global state for easy access across your application:

```ts
import type { FetchError } from 'ofetch'
import { siteQuery } from '~/queries'

export default defineNuxtPlugin(async (nuxtApp) => {
  const site = useState('site', () => ({}))

  // Fetch site data once and store it in the payload for client-side hydration
  if (import.meta.server) {
    try {
      const data = await $kql(siteQuery)
      site.value = data?.result || {}
    }
    catch (e) {
      console.error('Failed to fetch site data:', (e as FetchError).message)
    }
  }
})
```
