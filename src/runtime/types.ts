import type { FetchOptions } from 'ohmyfetch'
import type { UseFetchOptions } from '#app'

export type KqlQuery = `${'kirby' | 'site' | 'page'}${string}`

export interface KqlQueryRequest {
  query: KqlQuery
  select?: Record<string, string | boolean> | string[]
  pagination?: {
    /** @default 100 */
    limit?: number
    page?: number
  }
}

export interface KqlQueryResponse {
  code: number
  status: string
  result?: any
}

export interface KqlPrivateFetchOptions {
  /**
   * Cache result with same query for hydration
   *
   * @default true
   */
  cache?: boolean
}

export type KqlPublicFetchOptions = Omit<FetchOptions, 'baseURL' | 'body' | 'params' | 'parseResponse' | 'responseType' | 'response'>

export type UseKqlOptions<T> = Omit<UseFetchOptions<T>, 'baseURL' | 'body' | 'params' | 'parseResponse' | 'responseType' | 'response'>
