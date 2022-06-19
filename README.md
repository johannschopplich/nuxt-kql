[![nuxt-kql](./docs/public/og.png)](https://nuxt-kql.jhnn.dev)

# nuxt-kql

[![npm version](https://img.shields.io/npm/v/nuxt-kql?color=a1b858&label=)](https://www.npmjs.com/package/nuxt-kql)

> Kirby [KQL](https://github.com/getkirby/kql) module for [Nuxt 3](https://v3.nuxtjs.org).

- [✨ &nbsp;Release Notes](https://github.com/johannschopplich/nuxt-kql/releases)
- [📖 &nbsp;Read the documentation](https://nuxt-kql.jhnn.dev)

## Features

- 🔒 Protect your Kirby credentials when fetching queries
- 🪢 Supports token-based authentication with [kirby-headless-starter](https://github.com/johannschopplich/kirby-headless-starter) (recommended)
- 🤹 No CORS issues!
- 🍱 Handle request just like with the [`useFetch`](https://v3.nuxtjs.org/guide/features/data-fetching/#usefetch) composable
- 🗃 Cached query responses
- 🦾 Strongly typed

## Setup

> [📖 Read the documentation](https://nuxt-kql.jhnn.dev)

```bash
# pnpm
pnpm add -D nuxt-kql

# npm
npm i -D nuxt-kql
```

## Basic Usage

> [📖 Read the documentation](https://nuxt-kql.jhnn.dev)

Add `nuxt-kql` to your Nuxt config:

```ts
// `nuxt.config.ts`
import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: ['nuxt-kql'],
})

```

And fetch queries in your template:

```vue
<script setup lang="ts">
const { data, pending, refresh, error } = await useQuery({
  query: 'site',
})
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
    <pre>{{ JSON.stringify(data?.result, undefined, 2) }}</pre>
  </div>
</template>
```

## 💻 Development

1. Clone this repository
2. Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
3. Install dependencies using `pnpm install`
4. Run `pnpm run dev:prepare`
5. Start development server using `pnpm run dev`

## License

[MIT](./LICENSE) License © 2022 [Johann Schopplich](https://github.com/johannschopplich)
