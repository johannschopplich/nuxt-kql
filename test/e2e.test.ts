import { fileURLToPath } from 'node:url'
import { destr } from 'destr'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('nuxt-kql', async () => {
  await setup({
    server: true,
    rootDir: fileURLToPath(new URL('./fixture', import.meta.url)),
  })

  it('fetches queries with $kql', async () => {
    const html = await $fetch('/$kql')
    expect(getTestResult(html)).toMatchSnapshot()
  })

  it('fetches Kirby data useKirbyData', async () => {
    const html = await $fetch('/useKirbyData')
    expect(getTestResult(html)).toMatchSnapshot()
  })

  it('can prefetch KQL queries', async () => {
    const html = await $fetch('/prefetch')
    expect(getTestResult(html)).toMatchSnapshot()
  })
})

function getTestResult(html: string) {
  const content = html.match(/<script\s+type="text\/test-result">(.*?)<\/script>/s)?.[1]
  return destr(content)
}
