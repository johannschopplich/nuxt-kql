import { fileURLToPath } from 'node:url'
import destr from 'destr'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'

describe('nuxt-kql', async () => {
  await setup({
    server: true,
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  })

  it('fetches queries with $kql', async () => {
    const html = await $fetch('/test/$kql')
    expect(getTestResult(html)).toMatchSnapshot()
  })

  it('fetches queries with $kql (client requests)', async () => {
    const html = await $fetch('/test/$kql_client')
    expect(getTestResult(html)).toMatchSnapshot()
  })

  it('fetches queries with useKql (client requests)', async () => {
    const html = await $fetch('/test/useKql_client')
    expect(getTestResult(html)).toMatchSnapshot()
  })

  it('fetches Kirby data useKirbyData', async () => {
    const html = await $fetch('/test/useKirbyData')
    expect(getTestResult(html)).toMatchSnapshot()
  })

  it('fetches Kirby data useKirbyData (client requests)', async () => {
    const html = await $fetch('/test/useKirbyData_client')
    expect(getTestResult(html)).toMatchSnapshot()
  })

  it('can prefetch KQL queries', async () => {
    const html = await $fetch('/test/prefetch')
    expect(getTestResult(html)).toMatchSnapshot()
  })
})

function getTestResult(html: string) {
  const content = html.match(/<script\s+type="text\/test-result">(.*?)<\/script>/s)?.[1]
  return destr(content)
}
