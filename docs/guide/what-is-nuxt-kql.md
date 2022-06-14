# What is nuxt-kql?

`nuxt-kql` is a lightweight module to fetch data with Kirby's Query Language API.

## Motivation

Kirby suits well for a headless CMS. Setting up KQL is easy, but fetching queries can be cumbersome at times. This module tries to solve this by providing simple to use composables.

With these composables, you get query caching, authorization handling etc. ouf of the box.

Most importantly, your Kirby credentials are protected when fetching data on the client. `nuxt-kql` handles that for you.

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
