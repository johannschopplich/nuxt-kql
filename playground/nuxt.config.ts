import { defineNuxtConfig } from 'nuxt/config'
import NuxtKql from '../src/module'

export default defineNuxtConfig({
  modules: [NuxtKql],

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
