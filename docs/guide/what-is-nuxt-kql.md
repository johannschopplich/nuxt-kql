# What is Nuxt KQL?

Nuxt KQL is a lightweight [Nuxt](https://nuxt.com) module to reliably retrieve data from your Kirby instance using the **Kirby Query Language API**. It keeps your authentication credentials safe and works on the server and client.

## Motivation

Kirby lends itself well to a headless CMS. Setting up [KQL](https://github.com/getkirby/kql) is fairly easy, but fetching queries can be cumbersome at times. Not to mention CORS issues. This module solves these common problems by providing easy-to-use composables to query your Kirby instance with KQL.

With provided composables like [`useKql`](/api/use-kql), your KQL responses are cached and authorization is handled for you right out of the box.

Most importantly, your Kirby authentication credentials are protected when fetching data, even on the client.

## Kirby Headless Plugin

Setting up Kirby to support headless mode is a bit of a hassle. To make your life easier, you can use the [Kirby Headless plugin](https://github.com/johannschopplich/kirby-headless). It provides a custom KQL endpoint with token-based authentication and other useful features. You do not have to use it, but it is the best way to use Kirby as a headless CMS and avoids common pitfalls like CORS issues. This Nuxt module is designed to work with it.

With the Kirby Headless plugin you are ready to go:

- 🧩 Optional bearer token authentication for [KQL](https://kirby.tools/docs/headless/usage#kirby-query-language-kql) and custom API endpoints
- 🧱 Resolve fields in blocks: [UUIDs to file and page objects](https://kirby.tools/docs/headless/field-methods) or [any other field](https://kirby.tools/docs/headless/field-methods)
- ⚡️ Cached KQL queries
- 🌐 Multi-language support for KQL queries
- 😵 Built-in CORS handling
- 🍢 Express-esque [API builder](https://kirby.tools/docs/headless/api-builder) with middleware support
- 🗂 Return [JSON from templates](https://kirby.tools/docs/headless/usage#json-templates) instead of HTML

## Nuxt Starter Kits

Instead of building your Nuxt project from scratch, you can use one of the provided [starter kits](/guide/starters) to get up and running quickly. Choose the one that best suits your needs.
