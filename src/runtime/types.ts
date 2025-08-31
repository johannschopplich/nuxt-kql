import type { KirbyQueryRequest } from 'kirby-types'
import type { NitroFetchOptions } from 'nitropack'

export interface ServerFetchOptions extends Pick<
  NitroFetchOptions<string>,
  'method' | 'headers' | 'query' | 'body'
> {
  // Either request a KQL query
  query?: Partial<KirbyQueryRequest>
  // … or a direct Kirby API path
  path?: string
  cache?: boolean
}
