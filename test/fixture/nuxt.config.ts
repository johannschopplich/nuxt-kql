export default defineNuxtConfig({
  modules: ['../src/module.ts'],

  kql: {
    // URL and token to the Kirby instance
    url: 'https://kirby-headless-starter.jhnn.dev',
    token: 'test',

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

  typescript: {
    shim: false,
  },
})
