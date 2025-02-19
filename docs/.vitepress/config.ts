import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'
import { description, version } from '../../package.json'
import {
  github,
  name,
  ogImage,
  ogUrl,
  releases,
} from './meta'

export default defineConfig({
  lang: 'en-US',
  title: name,
  description,
  head: [
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'author', content: 'Johann Schopplich' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:title', content: name }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { name: 'twitter:title', content: name }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['meta', { name: 'twitter:site', content: '@jschopplich' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],

  lastUpdated: true,
  appearance: 'dark',

  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/johannschopplich/nuxt-kql/edit/main/docs/:path',
      text: 'Suggest changes to this page',
    },

    nav: nav(),

    sidebar: {
      '/guide/': sidebarGuide(),
      '/config/': sidebarGuide(),
      '/usage/': sidebarGuide(),
      '/faq/': sidebarGuide(),
      '/api/': sidebarApi(),
    },

    socialLinks: [
      { icon: 'github', link: github },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022-PRESENT Johann Schopplich',
    },

    search: {
      provider: 'local',
    },
  },
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Guide',
      activeMatch: '^/guide/',
      items: [
        { text: 'What is Nuxt KQL?', link: '/guide/what-is-nuxt-kql' },
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Starter Kits', link: '/guide/starters' },
      ],
    },
    {
      text: 'Configuration',
      link: '/config/',
    },
    {
      text: 'Usage',
      activeMatch: '^/usage/',
      items: [
        { text: 'Authentication', link: '/usage/authentication-methods' },
        { text: 'Caching', link: '/usage/caching' },
        { text: 'Error Handling', link: '/usage/error-handling' },
        { text: 'Typed Responses', link: '/usage/typed-query-results' },
        { text: 'Prefetching Queries', link: '/usage/prefetching-queries' },
        { text: 'Multi-Language Sites', link: '/usage/multi-language-sites' },
        { text: 'Batching Queries', link: '/usage/batching-queries' },
      ],
    },
    {
      text: 'API',
      activeMatch: '^/api/',
      items: [
        {
          text: 'Overview',
          link: '/api/',
        },
        {
          text: 'Composables',
          items: [
            { text: 'useKql', link: '/api/use-kql' },
            { text: 'useKirbyData', link: '/api/use-kirby-data' },
            { text: '$kql', link: '/api/kql' },
            { text: '$kirby', link: '/api/kirby' },
          ],
        },
      ],
    },
    {
      text: `v${version}`,
      items: [
        {
          text: 'Release Notes ',
          link: releases,
        },
      ],
    },
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Guides',
      items: [
        { text: 'What is Nuxt KQL?', link: '/guide/what-is-nuxt-kql' },
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Starter Kits', link: '/guide/starters' },
      ],
    },
    {
      text: 'Configuration',
      items: [
        { text: 'Module', link: '/config/' },
      ],
    },
    {
      text: 'Usage',
      items: [
        { text: 'Authentication', link: '/usage/authentication-methods' },
        { text: 'Caching', link: '/usage/caching' },
        { text: 'Error Handling', link: '/usage/error-handling' },
        { text: 'Typed Responses', link: '/usage/typed-query-results' },
        { text: 'Prefetching Queries', link: '/usage/prefetching-queries' },
        { text: 'Multi-Language Sites', link: '/usage/multi-language-sites' },
        { text: 'Batching Queries', link: '/usage/batching-queries' },
      ],
    },
    {
      text: 'FAQ',
      items: [
        { text: 'How Does It Work?', link: '/faq/how-does-it-work' },
        { text: 'What Is KQL?', link: '/faq/what-is-kql' },
        { text: 'Can I Encounter CORS Issues?', link: '/faq/cors-issues' },
      ],
    },
  ]
}

function sidebarApi(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Overview',
      link: '/api/',
    },
    {
      text: 'Composables',
      items: [
        { text: 'useKql', link: '/api/use-kql' },
        { text: 'useKirbyData', link: '/api/use-kirby-data' },
        { text: '$kql', link: '/api/kql' },
        { text: '$kirby', link: '/api/kirby' },
      ],
    },
    {
      text: 'Type Declarations',
      items: [
        { text: 'KirbyQueryRequest', link: '/api/types-query-request' },
        { text: 'KirbyQueryResponse', link: '/api/types-query-response' },
      ],
    },
  ]
}
