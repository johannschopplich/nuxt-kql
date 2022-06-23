import { defineNuxtConfig } from 'nuxt'
import nuxtKql from '../src/module'

export default defineNuxtConfig({
  modules: [
    nuxtKql,
  ],

  kql: {
    prefix: 'api/kql',
    auth: 'bearer',
    // Enable client-side query requests with `usePublicKql()` and `$publicKql()`
    clientRequests: true,
  },
})
