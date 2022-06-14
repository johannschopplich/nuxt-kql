import { defineNuxtConfig } from 'nuxt'
import nuxtKql from '../src/module'

export default defineNuxtConfig({
  modules: [
    nuxtKql,
  ],

  kql: {
    kirbyEndpoint: 'api/kql',
    kirbyAuth: 'bearer',
    // Disable the following to prevent usage of `usePublicKql()` and `$publicKql()`
    clientRequests: true,
  },
})
