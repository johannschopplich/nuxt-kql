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

export interface KirbyQueryResponse<Pagination extends boolean = false> {
  code: number
  status: string
  result?: Pagination extends true
    ? {
        data: any
        pagination: {
          page: number
          pages: number
          offset: number
          limit: number
          total: number
        }
      }
    : any
}

export type KirbyBlockType =
  | 'code'
  | 'gallery'
  | 'heading'
  | 'image'
  | 'line'
  | 'list'
  | 'markdown'
  | 'quote'
  | 'table'
  | 'text'
  | 'video'

export interface KirbyBlock<
  T extends string = KirbyBlockType,
  U = Record<string, any>,
> {
  content: T extends 'code'
    ? { code: string; language: string }
    : T extends 'gallery'
      ? { images: string[] }
      : T extends 'heading'
        ? { level: string; text: string }
        : T extends 'image'
          ? { location: string; image: string[]; src: string; alt: string; caption: string; link: string; ratio: string; crop: boolean }
          : T extends 'line'
            ? Record<string, never>
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

export interface KirbyLayoutColumn {
  id: string
  width: '1/1' | '1/2' | '1/3' | '1/4' | '1/6' | '1/12' | '2/2' | '2/3' | '2/4' | '2/6' | '2/12' | '3/3' | '3/4' | '3/6' | '3/12' | '4/4' | '4/6' | '4/12' | '5/6' | '5/12' | '6/6' | '6/12' | '7/12' | '8/12' | '9/12' | '10/12' | '11/12' | '12/12'
  blocks: KirbyBlock[]
}

export interface KirbyLayout {
  id: string
  attrs: string[]
  columns: KirbyLayoutColumn[]
}
