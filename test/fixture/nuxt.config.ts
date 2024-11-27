import { defineNuxtConfig } from 'nuxt/config'
import NuxtKql from '../../src/module'

export default defineNuxtConfig({
  modules: [NuxtKql],

  compatibilityDate: '2024-04-03',

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
})
