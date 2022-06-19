import type { UseFetchOptions } from 'nuxt/app'

export interface KirbyQueryRequest {
  /**
   * @example
   * kirby.page("about")
   */
  query: `${'kirby' | 'site' | 'page'}${string}`
  select?: Record<string, any> | string[]
  pagination?: {
    /** @default 100 */
    limit?: number
    page?: number
  }
}

export interface KirbyQueryResponse {
  code: number
  status: string
  result?: any
}

export type UseQueryOptions<T> = Omit<UseFetchOptions<T>, 'baseURL' | 'body' | 'params' | 'parseResponse' | 'responseType' | 'response'>
