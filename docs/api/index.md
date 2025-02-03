# Overview

## Composables

Nuxt KQL offers intuitive composables to return data for KQL queries or Kirby API requests. All composables are [auto-imported](https://nuxt.com/docs/guide/concepts/auto-imports) and globally available inside your `<script setup>`.

To query data with KQL, you can use the following composables:

- [`useKql`](/api/use-kql)
- [`$kql`](/api/kql)

If you want to retrieve data from the Kirby API (generally available at `/api`), you can use:

- [`useKirbyData`](/api/use-kirby-data)
- [`$kirby`](/api/kirby)

## Type Declarations

Common types are importable from the `#nuxt-kql` module alias:

- [`KirbyQueryRequest`](/api/types-query-request)
- [`KirbyQueryResponse`](/api/types-query-response)

An example use case would be a reactive query using a typed [ref()](https://vuejs.org/api/reactivity-core.html#ref):

```ts
const query = ref<KirbyQueryRequest>({
  query: 'site',
  select: ['title', 'isListed']
})
```
