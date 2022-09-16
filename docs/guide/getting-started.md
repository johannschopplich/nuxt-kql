# Getting Started

This section will help you add `nuxt-kql` to your Nuxt 3 project.

::: tip
This module ist suited to be used with [kirby-headless-starter](/guide/what-is-nuxt-kql#kirby-headless-starter). You may use it as a base for your KQL server.
:::

## Step. 1: Install nuxt-kql

Using [pnpm](https://pnpm.io):

```bash
$ pnpm add -D nuxt-kql
```

Using npm:

```bash
$ npm i -D nuxt-kql
```

## Step. 2: Add nuxt-kql to Nuxt

Add `nuxt-kql` to your Nuxt config:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql'],
})
```

## Step. 3: Set up the Environment

This module will have to know, where the Kirby server is deployed. `nuxt-kql` automatically reads your environment variables.

Create a `.env` file in your project (or edit the existing one) and add the following environment variables:

```
KIRBY_BASE_URL=https://kirby.example.com
KIRBY_API_USERNAME=your-username
KIRBY_API_PASSWORD=your-password
```

::: info
The default KQL endpoint `/api/query` [requires authentication](https://getkirby.com/docs/guide/api/authentication).
:::

Now, you can fetch data with the [`useKql`](/api/use-kql) composable.

## Step. 4: Send Queries

Use the globally available `useKql` composable to send queries:

```vue
<script setup lang="ts">
const { data, pending, refresh, error } = await useKql({
  query: 'site',
  select: {
    title: true,
    children: true,
  },
})
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
    <pre>{{ JSON.stringify(data?.result, undefined, 2) }}</pre>
  </div>
</template>
```

## Step. 5: Your Turn

Create something awesome! I'm eager to find out what you have built. [Drop me a line](mailto:mail@johannschopplich.com), if you want.

::: tip
If you want to take a look at a complete solution with this module, you may check out the [Kirby Nuxt Starter Kit](https://github.com/johannschopplich/kirby-nuxt-starterkit), which is a rewrite of the official Kirby Starter Kit with this module.
:::
