# What is Nuxt Kirby?

Nuxt Kirby is a comprehensive [Nuxt](https://nuxt.com) module that provides seamless integration with Kirby CMS. It offers multiple ways to fetch your content: use **KQL (Kirby Query Language)** for complex queries, or access the **Kirby API directly** for simpler data fetching. Your authentication credentials stay protected, and everything works on both server and client.

## Two Ways to Fetch Data

Nuxt Kirby offers flexibility in how you access your Kirby content:

### 1. KQL (Kirby Query Language)
Perfect for complex content queries with relationships and filtering:

```ts
const { data, error } = await useKql({
  query: 'site',
  select: ['title', 'children']
})
```

### 2. Direct Kirby API Access
Ideal for simple data fetching, file downloads, and custom endpoints:

```ts
const { data, error } = await useKirbyData('api/pages/blog')
```

Both methods provide caching, error handling, and credential protection out of the box.

## Kirby Headless Plugin

Setting up Kirby to support headless mode is a bit of a hassle. To make your life easier, you can use the [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/). It provides a custom KQL endpoint with token-based authentication and other useful features. You do not have to use it, but it is the best way to use Kirby as a headless CMS and avoids common pitfalls like CORS issues. This Nuxt module is designed to work perfectly with it.

With the Kirby Headless plugin you are ready to go:

- 🧩 Optional bearer token authentication for [KQL](https://kirby.tools/docs/headless/usage/kql) and custom API endpoints
- 🧱 Resolve fields in blocks: [UUIDs to file and page objects](https://kirby.tools/docs/headless/usage/field-methods) or [any other field](https://kirby.tools/docs/headless/usage/field-methods)
- ⚡️ Cached KQL queries
- 🌐 Multi-language support for KQL queries
- 😵 Built-in CORS handling
- 🍢 Express-esque [API builder](https://kirby.tools/docs/headless/advanced/api-builder) with middleware support
- 🗂 Return [JSON from templates](https://kirby.tools/docs/headless/usage/json-templates) instead of HTML

## Next Steps

- **New to Nuxt Kirby?** Start with the [Getting Started](/essentials/getting-started) guide.
- **Choose your approach:** Learn about [Data Fetching Methods](/essentials/data-fetching-methods).
- **Quick start:** Browse the [Starter Kits](/essentials/starter-kits) for ready-made templates.
