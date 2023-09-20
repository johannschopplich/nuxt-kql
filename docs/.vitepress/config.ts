import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
import { description, name, version } from '../../package.json'
import {
  github,
  ogImage,
  ogUrl,
  releases,
} from './meta'

const url = new URL(ogUrl)

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
    // Plausible analytics
    ['script', { 'src': 'https://plausible.io/js/script.js', 'defer': '', 'data-domain': url.hostname }],
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
        { text: 'What is nuxt-kql?', link: '/guide/what-is-nuxt-kql' },
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'How It Works', link: '/guide/how-it-works' },
        { text: 'Playground', link: '/guide/playground' },
      ],
    },
    {
      text: 'Config',
      activeMatch: '^/config/',
      items: [
        { text: 'Module Configuration', link: '/config/' },
        { text: 'Authentication', link: '/config/authentication-methods' },
        { text: 'Caching', link: '/config/caching' },
        { text: 'Prefetching Queries', link: '/config/prefetching-queries' },
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
            { text: '$kql', link: '/api/kql' },
          ],
        },
      ],
    },
    { text: 'Starter Kits', link: '/guide/starters' },
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
        { text: 'What is nuxt-kql?', link: '/guide/what-is-nuxt-kql' },
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'How It Works', link: '/guide/how-it-works' },
        { text: 'Playground', link: '/guide/playground' },
      ],
    },
    {
      text: 'Configuration',
      items: [
        { text: 'Module Configuration', link: '/config/' },
        { text: 'Authentication', link: '/config/authentication-methods' },
        { text: 'Caching', link: '/config/caching' },
        { text: 'Prefetching Queries', link: '/config/prefetching-queries' },
      ],
    },
    {
      text: 'Cookbook',
      items: [
        { text: 'Kirby Blocks', link: '/guide/example-kirby-blocks' },
        { text: 'Typed Responses', link: '/guide/example-typed-query-results' },
        { text: 'Multi-Language Sites', link: '/guide/example-multi-language-sites' },
      ],
    },
    {
      text: 'FAQ',
      items: [
        { text: 'Are CORS Issues Possible?', link: '/guide/faq-are-cors-issues-possible' },
        { text: 'How to Track Errors?', link: '/guide/faq-how-to-track-errors' },
        { text: 'What Is KQL?', link: '/guide/faq-what-is-kql' },
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
        { text: '$kql', link: '/api/kql' },
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
