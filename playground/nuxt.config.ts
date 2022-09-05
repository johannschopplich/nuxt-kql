import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: ['nuxt-kql'],

  kql: {
    prefix: 'api/kql',
    auth: 'bearer',
    // Enable client-side query requests with `usePublicKql()` and `$publicKql()`
    clientRequests: true,
  },

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
  },
})
