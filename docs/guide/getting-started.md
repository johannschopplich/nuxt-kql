# Getting Started

This guide will walk you through the steps to get started with Nuxt KQL.

::: tip
Choose on of the [starter kits](/guide/starters) and get started with Nuxt KQL in no time instead of starting from scratch.
:::

## Step 1: Install Nuxt KQL

```bash
npx nuxi@latest module add kql
```

## Step 2: Use the `nuxt-kql` Module

Add `nuxt-kql` to your Nuxt config:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kql']
})
```

## Step 3: Set up the Environment

Without a backend, Nuxt KQL will not be able to fetch queries. In order to do so, you have to point to a Kirby instance with the official [Kirby KQL](https://github.com/getkirby/kql) plugin installed.

It is recommended to use the [Kirby Headless Starter](/guide/what-is-nuxt-kql#kirby-headless-plugin), which is a customized Kirby project template that includes the KQL plugin and a custom KQL endpoint `api/kql` that supports **token authentication**.

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

Nuxt KQL automatically reads your environment variables. Set the following environment variables in your project's `.env` file:

```ini
# Base URL of your Kirby instance (without a path)
KIRBY_BASE_URL=https://kirby.example.com
KIRBY_API_TOKEN=your-token
```

::: tip
Although not recommended, you can also use basic authentication, follow the [basic authentication method](/guide/authentication-methods#basic-authentication) guide.
:::

## Step 4: Send Queries

Use the globally available [`useKql`](/api/use-kql) composable to send queries:

```vue
<script setup lang="ts">
const { data, refresh, error, status, clear } = await useKql({
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

Create your own Nuxt KQL project and start building your website.

I'm curious to see what you've built. [Drop me a line at](mailto:hello@johannschopplich.com) if you like!
