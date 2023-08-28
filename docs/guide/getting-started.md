# Getting Started

This guide will walk you through the steps to get started with `nuxt-kql`.

## Step 1: Install `nuxt-kql`

Using [pnpm](https://pnpm.io):

```bash
$ pnpm add -D nuxt-kql
```

Using npm:

```bash
$ npm i -D nuxt-kql
```

## Step 2: Add `nuxt-kql` to Nuxt

Add `nuxt-kql` to your Nuxt config:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql']
})
```

## Step 3: Set up the Environment

Without a backend, `nuxt-kql` won't be able to fetch queries. In order to do so, you have to point to a Kirby instance with the official [Kirby KQL](https://github.com/getkirby/kql) plugin installed.

It's recommended to use the [Kirby Headless Starter](/guide/what-is-nuxt-kql#kirby-headless-starter), which is a customized Kirby project template that includes the KQL plugin and a custom KQL endpoint `api/kql` that supports **token authentication**.

Enable the `bearer` authentication method in your Nuxt config:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    // Enable token-based authentication for the Kirby Headless Starter,
    // which includes a custom KQL endpoint `api/kql`
    auth: 'bearer'
  }
})
```

`nuxt-kql` automatically reads your environment variables. Set the following environment variables in your project's `.env` file:

```ini
# Base URL of your Kirby instance (without a path)
KIRBY_BASE_URL=https://kirby.example.com
KIRBY_API_TOKEN=your-token
```

:::tip
If you have reasons not to use the [Kirby Headless Starter](/guide/what-is-nuxt-kql#kirby-headless-starter) and want to use basic authentication, follow the [basic authentication method](/config/authentication-methods#basic-authentication) guide.
:::

## Step 4: Send Queries

Use the globally available [`useKql`](/api/use-kql) composable to send queries:

```vue
<script setup lang="ts">
const { data, pending, refresh, error } = await useKql({
  query: 'site',
  select: {
    title: true,
    children: true
  }
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
