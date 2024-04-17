# Starter Kits

To get started with Nuxt KQL, you may choose from one of the following starter kits:

## Kirby Nuxt Starter Kit

The [Kirby Nuxt Starter Kit](https://github.com/johannschopplich/kirby-nuxt-starterkit) is a rewrite of the official Kirby Starter Kit with Nuxt and Nuxt KQL. It's configured to use **token-based authentication**, but can be used with **basic authentication** as well.

## Cacao Kit

::: info
That's the one I use for my own projects.
:::

This kit provides a minimal but feature-rich Nuxt 3 starter kit. It fetches content from the [🍫 Cacao Kit backend](https://github.com/johannschopplich/cacao-kit-backend), a headless Kirby instance. It is the evolved version of the [Kirby Nuxt Starterkit](https://github.com/johannschopplich/kirby-nuxt-starterkit) and my best practice solution to build a Nuxt based frontend on top of Kirby CMS.

You can harness every feature Nuxt provides to build a server-side rendered application or even pre-render the content using [Nuxt's static generation](https://nuxt.com/docs/getting-started/deployment#static-hosting).

Key design decisions is a block-first approach. Meaning, you can use Kirby's page structure as the source of truth and don't have to replicate the page structure in Nuxt. All pages are rendered by the [catch-all route](https://github.com/johannschopplich/cacao-kit-frontend/blob/main/pages/%5B...id%5D.vue). Of course, you don't have to stick with the block-first architecture.
If it doesn't speak to you or if you need custom Kirby page blueprints with custom fields, you can always create Nuxt pages and query the content using KQL. See the [`pages/about.vue`](https://github.com/johannschopplich/cacao-kit-frontend/blob/main/pages/about.vue) page for an example.

### Playground

Technically not a starter, but a place where all features of this module are showcased and tested for development. A good place to start if you want to take a look at the code.

Check out the [playground](https://github.com/johannschopplich/nuxt-kql/tree/main/playground) of this module for an example Nuxt project setup. To spin up your Nuxt dev server quickly, you can duplicate the local `.env.example` file and rename it to `.env`.
