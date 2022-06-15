# What is nuxt-kql?

`nuxt-kql` is a lightweight module for Nuxt 3 to reliably fetch data of your Kirby instance using the Kirby Query Language API. It works on the server and client-side.

## Motivation

Kirby suits well for a headless CMS. Setting up KQL is fairly easy, but fetching queries can be cumbersome at times. This module tries to solve this by providing simple to use composables consuming KQL queries as parameter.

With these composables, your KQL response are cached and authorization is handled for you ouf of the box.

Most importantly, your Kirby authentication credentials are protected when fetching data, even on the client.

## Kirby Headless Starter

This module works best with the [kirby-headless-starter](https://github.com/johannschopplich/kirby-headless-starter). You don't have to use it, but it's suited best for using Kirby as a headless CMS and avoids common pitfalls like CORS issues.

With it, you will get out of the box:

- 🦭 Optional bearer token for authentication
- 🔒 **public** or **private** API
- 🧩 [KQL](https://github.com/getkirby/kql) with bearer token support via new `/api/kql` route
- ⚡️ Cached KQL queries
- 😵‍💫 No CORS issues!
- 🗂 [Templates](https://github.com/johannschopplich/kirby-headless-starter/tree/main/site/templates) present JSON instead of HTML
  - Fetch either `/example` or `/example.json`
  - You decide, which data you share
- 🦾 Express-esque [API builder](https://github.com/johannschopplich/kirby-headless-starter#api-builder) with middleware support
