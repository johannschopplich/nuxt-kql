# nuxt-kql

[![npm version][npm-version-src]][npm-version-href]

> Kirby [KQL](https://github.com/getkirby/kql) module for Nuxt 3.

## Features

- 🤹 Handles authentication
- 🪢 Supports token-based authentication with [headless-starter](https://github.com/johannschopplich/kirby-headless-starter) (recommended)
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
KIRBY_API_URL=https://kirby.example.com
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
    nuxtKql,
  ],

  kql: {
    // Enable the token-based authentication
    auth: 'bearer',
    // Needed for the kirby-headless-starter custom KQL endpoint
    endpoint: 'kql',
  },
})
```

Create a `.env` file in your project and add the following environment variables:

```env
KIRBY_API_URL=https://kirby.example.com
KIRBY_API_TOKEN=your-token
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
