export default defineNuxtConfig({
  modules: ['../src/module'],

  kql: {
    prefix: 'api/kql',
    auth: 'bearer',
    // Enable client-side query requests with `useKql({}, { client: true })`
    clientRequests: true,
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
  },

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
  },
})
