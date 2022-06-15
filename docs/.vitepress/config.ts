import { defineConfig } from 'vitepress'
import { description, name, version } from '../../package.json'
import {
  github,
  ogImage,
  ogUrl,
  releases,
} from './meta'

export default defineConfig({
  lang: 'en-US',
  title: 'nuxt-kql',
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
      repo: 'johannschopplich/nuxt-kql',
      branch: 'main',
      dir: 'docs',
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

function nav() {
  return [
    { text: 'Guide', link: '/guide/what-is-nuxt-kql', activeMatch: '/guide/' },
    { text: 'Config', link: '/config/' },
    { text: 'API', link: '/api/' },
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

function sidebarGuide() {
  return [
    {
      text: 'Introduction',
      collapsible: true,
      items: [
        { text: 'What is nuxt-kql?', link: '/guide/what-is-nuxt-kql' },
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Token-Based Authentication', link: '/guide/token-authentication' },
      ],
    },
    {
      text: 'FAQ',
      collapsible: true,
      items: [
        { text: 'CORS', link: '/guide/faq-cors-issues' },
      ],
    },
  ]
}

function sidebarConfig() {
  return [
    {
      text: 'Config',
      items: [
        { text: 'Module Config', link: '/config/' },
      ],
    },
  ]
}

function sidebarApi() {
  return [
    {
      text: 'API',
      items: [
        { text: 'API Reference', link: '/api/' },
      ],
    },
  ]
}
