import { describe, expect, it } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

describe('nuxt-kql', async () => {


  it('fetches queries with $kql', async () => {
    const html = await $fetch('/test/$kql')
    const content = html.match(/<pre>(.*)<\/pre>/s)?.[1]
    expect(content).toMatchSnapshot()
  })

  it('fetches queries with $kql (client requests)', async () => {
    const html = await $fetch('/test/$kql_client')
    const content = html.match(/<pre>(.*)<\/pre>/s)?.[1]
    expect(content).toMatchSnapshot()
  })

  it('fetches queries with useKql (client requests)', async () => {
    const html = await $fetch('/test/useKql_client')
    const content = html.match(/<pre>(.*)<\/pre>/s)?.[1]
    expect(content).toMatchSnapshot()
  })

  it('fetches Kirby data useKirbyData', async () => {
    const html = await $fetch('/test/useKirbyData')
    const content = html.match(/<pre>(.*)<\/pre>/s)?.[1]
    expect(content).toMatchSnapshot()
  })

  it('fetches Kirby data useKirbyData (client requests)', async () => {
    const html = await $fetch('/test/useKirbyData_client')
    const content = html.match(/<pre>(.*)<\/pre>/s)?.[1]
    expect(content).toMatchSnapshot()
  })

  it('can prefetch KQL queries', async () => {
    const html = await $fetch('/test/prefetch')
    const content = html.match(/<pre>(.*)<\/pre>/s)?.[1]
    expect(content).toMatchSnapshot()
  })
})
