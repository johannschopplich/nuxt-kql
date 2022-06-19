import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
import { description, name, version } from '../../package.json'
import {
  github,
  ogImage,
  ogUrl,
  releases,
} from './meta'

export default defineConfig({
  lang: 'en-US',
  title: name,
  description: 'Nuxt 3 module for Kirby\'s Query Language API',
  head: [
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['meta', { property: 'og:title', content: name }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { name: 'twitter:title', content: name }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/johannschopplich/nuxt-kql/edit/main/docs/:path',
      text: 'Suggest changes to this page',
    },

    nav: nav(),

    sidebar: {
      '/guide/': sidebarGuide(),
      '/config/': sidebarConfig(),
      '/api/': sidebarApi(),
    },

    socialLinks: [
      { icon: 'github', link: github },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022-present Johann Schopplich',
    },
  },
})

function nav(): DefaultTheme.NavItem[] {
  return [
    { text: 'Guide', link: '/guide/what-is-nuxt-kql', activeMatch: '/guide/' },
    { text: 'Config', link: '/config/' },
    { text: 'API', link: '/api/', activeMatch: '/api/' },
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

function sidebarGuide(): DefaultTheme.SidebarGroup[] {
  return [
    {
      text: 'Introduction',
      collapsible: true,
      items: [
        { text: 'What is nuxt-kql?', link: '/guide/what-is-nuxt-kql' },
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'How It Works', link: '/guide/how-it-works' },
      ],
    },
    {
      text: 'Configuration',
      collapsible: true,
      items: [
        { text: 'Token-Based Authentication', link: '/guide/token-authentication' },
      ],
    },
    {
      text: 'Examples',
      items: [
        { text: 'Playground', link: '/guide/playground' },
      ],
    },
    {
      text: 'FAQ',
      collapsible: true,
      items: [
        { text: 'Are CORS Issues Possible?', link: '/guide/faq-are-cors-issues-possible' },
        { text: 'How to Track Errors?', link: '/guide/faq-how-to-track-errors' },
      ],
    },
  ]
}

function sidebarConfig(): DefaultTheme.SidebarGroup[] {
  return [
    {
      text: 'Config',
      items: [
        { text: 'Module Config', link: '/config/' },
      ],
    },
  ]
}

function sidebarApi(): DefaultTheme.SidebarGroup[] {
  return [
    {
      text: 'API Reference',
      items: [
        { text: 'Overview', link: '/api/' },
      ],
    },
    {
      text: 'Composables',
      items: [
        { text: 'useQuery', link: '/api/use-query' },
        { text: 'usePublicQuery', link: '/api/use-public-query' },
        { text: '$query', link: '/api/query' },
        { text: '$publicQuery', link: '/api/public-query' },
      ],
    },
  ]
}
