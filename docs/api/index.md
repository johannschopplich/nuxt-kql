# Overview

## Composables

Nuxt KQL offers several composables to return data from KQL queries. All composables are [auto-imported](https://nuxt.com/docs/guide/concepts/auto-imports) and globally available inside your `<script setup>`.

- [`useKql`](/api/use-kql)
- [`$kql`](/api/kql)

If you want to make use of the Kirby API directly, you can use the following composables:

- [`useKirbyData`](/api/use-kirby-data)
- [`$kirby`](/api/kirby)

## Type Declarations

Common types are importable from the special `#nuxt-kql` module alias:

- [`KirbyQueryRequest`](/api/types-query-request)
- [`KirbyQueryResponse`](/api/types-query-response)

Example use-case would be a reactive query using a typed [ref()](https://vuejs.org/api/reactivity-core.html#ref):

```ts
const query = ref<KirbyQueryRequest>({
  query: 'site',
  select: ['title', 'isListed']
})
```
