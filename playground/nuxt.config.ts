export default defineNuxtConfig({
  modules: ['../src/module.ts'],

  kql: {
    // Enable token-based authentication
    auth: 'bearer',

    // Enable client-side query requests with `useKql({}, { client: true })`
    client: true,

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

  typescript: {
    typeCheck: true,
    shim: false,
  },
})
