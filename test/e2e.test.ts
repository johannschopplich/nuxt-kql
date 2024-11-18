import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { destr } from 'destr'
import { describe, expect, it } from 'vitest'

describe('nuxt-kql', async () => {
  await setup({
    server: true,
    rootDir: fileURLToPath(new URL('./fixture', import.meta.url)),
  })

  it('fetches queries with $kql', async () => {
    const html = await $fetch<string>('/$kql')
    expect(getTestResult(html)).toMatchSnapshot()
  })

  it('fetches Kirby data useKirbyData', async () => {
    const html = await $fetch<string>('/useKirbyData')
    expect(getTestResult(html)).toMatchSnapshot()
  })

  it('can prefetch KQL queries', async () => {
    const html = await $fetch<string>('/prefetch')
    expect(getTestResult(html)).toMatchSnapshot()
  })
})

function getTestResult(html: string) {
  const content = html.match(/<script\s+type="text\/test-result">(.*?)<\/script>/s)?.[1]
  return destr(content)
}
