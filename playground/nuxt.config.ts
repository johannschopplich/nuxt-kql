import { existsSync } from 'node:fs'
import { resolve } from 'pathe'

export default defineNuxtConfig({
  modules: [
    existsSync(resolve(__dirname, '../dist/module.mjs')) ? 'nuxt-kql' : '../src/module',
  ],

  kql: {
    // Enable token-based authentication
    auth: 'bearer',

    // Send client-side query requests to Kirby instead of the KQL proxy
    // client: true,

    // Prefetch queries at build-time
    prefetch: {
      site: {
        query: 'site',
        select: {
          title: true,
          children: {
            query: 'site.children',
            select: {
              id: true,
              title: true,
              isListed: true,
            },
          },
        },
      },
    },

    server: {
      cache: true,
    },
  },
})
