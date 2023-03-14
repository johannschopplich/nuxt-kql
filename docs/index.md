---
layout: home
sidebar: false

title: nuxt-kql
titleTemplate: Nuxt 3 module for Kirby's Query Language API

hero:
  name: nuxt-kql
  text: Nuxt 3 module for Kirby's Query Language API
  tagline: Retrieve data from Kirby CMS safely.
  image:
    src: /logo-shadow.svg
    alt: nuxt-kql
  actions:
    - theme: brand
      text: Get Started
      link: /guide/what-is-nuxt-kql
    - theme: alt
      text: API
      link: /api/
    - theme: alt
      text: View on GitHub
      link: https://github.com/johannschopplich/nuxt-kql

features:
  - title: Protect Your Kirby Credentials
    icon: 🔒
    details: A Nuxt server route proxies your queries. No CORS issues!
  - title: Various Authentication Methods
    icon: 🪢
    details: Basic or bearer authentication with <code>kirby-headless-starter</code>.
  - title: Familiar Data Handling
    icon: 🤹
    details: Handle query requests just like with Nuxt's <code>useFetch</code> composable. Caching included.
  - title: TypeScript
    icon: 🦾
    details: Bring your own query response typings. Otherwise, <code>nuxt-kql</code> will provide defaults for you.
---
