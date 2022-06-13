# nuxt-kql

[![npm version][npm-version-src]][npm-version-href]

> Kirby [KQL](https://github.com/getkirby/kql) module for Nuxt 3.

This module provides a `useKql` composable, which under the hood uses [`useFetch`](https://v3.nuxtjs.org/guide/features/data-fetching/#usefetch). Thus, KQL query fetching in your Nuxt 3 application will behave the same as Nuxt' internal data fetching and also infers its request caching!

## Features

- 🤹 Handles authentication
- 🪢 Supports token-based authentication with [kirby-headless-starter](https://github.com/johannschopplich/kirby-headless-starter) (recommended)
- 🍱 Built upon [`useFetch` composable](https://v3.nuxtjs.org/guide/features/data-fetching/#usefetch)
- 🗃 Cached query responses
- 🦾 Strongly typed

> ℹ️ For the time being, the module will be available on the server and client. Thus, your username/password pair for the API authentication will be exposed. Please keep that in mind.

## Setup

```bash
# pnpm
pnpm add -D nuxt-kql

# npm
npm i -D nuxt-kql
```

## Usage

Add `nuxt-kql` to your Nuxt config:

```ts
// `nuxt.config.ts`
import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: [
    'nuxt-kql',
  ],
})
```

Create a `.env` file in your project and add the following environment variables:

```env
KIRBY_API_URL=https://kirby.example.com/api
KIRBY_API_USERNAME=your-username
KIRBY_API_PASSWORD=your-password
```

### Token-Based Authentication

In combination with the [kirby-headless-starter](https://github.com/johannschopplich/kirby-headless-starter), you can use a bearer token for authentication.

```ts
// `nuxt.config.ts`
import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: [
    'nuxt-kql',
  ],

  kql: {
    // Enable the token-based authentication
    auth: 'bearer',
    // Needed for the kirby-headless-starter custom KQL endpoint
    endpoint: 'kql',
  },
})
```

Set the following environment variables in your project's `.env` file:

```env
KIRBY_API_URL=https://kirby.example.com/api
KIRBY_API_TOKEN=your-token
```

### Data Fetching

Use the globally available `useKql` composable to fetch queries:

```vue
<script setup lang="ts">
const { data, pending, refresh, error } = await useKql({
  query: 'site',
  select: {
    title: 'site.title',
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

## Options

```ts
export interface ModuleOptions {
  /**
   * Kirby API base URL, like `https://kirby.example.com/api`
   * @default 'process.env.KIRBY_API_URL'
   */
  url?: string

  /**
   * Kirby KQL API route path
   * @default 'query'
   */
  endpoint?: string

  /**
   * Authentication method
   * Set to `none` to disable authentication
   * @default 'basic'
   */
  auth?: 'basic' | 'bearer' | 'none'

  /**
   * Token for bearer authentication
   * @default 'process.env.KIRBY_API_TOKEN'
   */
  token?: string

  /**
   * Username/password pair for basic authentication
   * @default { username: process.env.KIRBY_API_USERNAME, password: process.env.KIRBY_API_PASSWORD }
   */
  credentials?: {
    username: string
    password: string
  }
}
```

## Playground

Checkout [the playground example](./playground).

## Development

1. Clone this repository
2. Install dependencies using `pnpm install`
3. Run `pnpm run dev:prepare`
4. Start development server using `pnpm run dev`

## License

[MIT](./LICENSE) License © 2022 [Johann Schopplich](https://github.com/johannschopplich)

[npm-version-src]: https://img.shields.io/npm/v/nuxt-kql/latest.svg
[npm-version-href]: https://npmjs.com/package/nuxt-kql
