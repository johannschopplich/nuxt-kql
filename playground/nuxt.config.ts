import { defineNuxtConfig } from 'nuxt'
import nuxtKql from '../src/module'

export default defineNuxtConfig({
  modules: [
    nuxtKql,
  ],

  kql: {
    kirbyEndpoint: 'api/kql',
    kirbyAuth: 'bearer',
    // Enable client-side query requests with `usePublicQuery()` and `$publicQuery()`
    clientRequests: true,
  },
})
