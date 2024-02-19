export default defineNuxtConfig({
  modules: ['../src/module.ts'],

  kql: {
    url: 'https://kirby-headless-starter.jhnn.dev',
    token: 'test',
    auth: 'bearer',
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
    shim: false,
  },
})
