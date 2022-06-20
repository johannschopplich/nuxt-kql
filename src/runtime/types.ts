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

export type KirbyBlockType = 'code' | 'gallery' | 'heading' | 'image' | 'line' | 'list' | 'markdown' | 'quote' | 'table' | 'text' | 'video'

export interface KirbyBlock<T extends string = KirbyBlockType, U = Record<string, any>> {
  content: T extends 'code'
    ? { code: string; language: string }
    : T extends 'gallery'
      ? { images: string[] }
      : T extends 'heading'
        ? { level: string; text: string }
        : T extends 'image'
          ? { location: string; image: string[]; src: string; alt: string; caption: string; link: string; ratio: string; crop: boolean }
          : T extends 'list'
            ? { text: string }
            : T extends 'markdown'
              ? { text: string }
              : T extends 'quote'
                ? { text: string; citation: string }
                : T extends 'text'
                  ? { text: string }
                  : T extends 'video'
                    ? { url: string; caption: string }
                    : U
  id: string
  isHidden: boolean
  type: T
}
