import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'

describe('nuxt-kql', async () => {
  await setup({
    server: true,
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  })

  it('fetches KQL data with composables', async () => {
    const html = await $fetch('/test/composables')
    const content = html.match(/<pre>(.*)<\/pre>/s)?.[1]
    expect(content).toMatchSnapshot()
  })

  it('can prefetch KQL queries', async () => {
    const html = await $fetch('/test/prefetch')
    const content = html.match(/<pre>(.*)<\/pre>/s)?.[1]
    expect(content).toMatchSnapshot()
  })
})
