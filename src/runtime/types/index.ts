export type KqlQuery = `${'kirby' | 'site' | 'page'}${string}`

export interface KqlQueryRequest {
  query: KqlQuery
  select?: Record<string, string | boolean> | string[]
}

export interface KqlQueryResponse {
  code: number
  status: string
  result: any
}
