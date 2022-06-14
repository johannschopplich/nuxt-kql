import type { FetchOptions } from 'ohmyfetch'
import type { UseFetchOptions } from '#app'

export type KqlQuery = `${'kirby' | 'site' | 'page'}${string}`

export interface KqlQueryRequest {
  query: KqlQuery
  select?: Record<string, string | boolean> | string[]
}

export interface KqlQueryResponse {
  code: number
  status: string
  result?: any
}

export type KqlPublicFetchOptions = Pick<FetchOptions, 'headers' | 'retry' | 'signal' | 'onRequest' | 'onRequestError' | 'onResponse' | 'onResponseError'>

export interface KqlPrivateFetchOptions {
  /**
   * Cache result with same query for hydration
   *
   * @default true
   */
  cache?: boolean
}

// export type UseKqlOptions<T> = Omit<UseFetchOptions<T>, 'baseURL' | 'method' | 'body'>
export type UseKqlOptions<T> = Pick<UseFetchOptions<T>, 'onRequest' | 'onRequestError' | 'onResponse' | 'onResponseError'>

