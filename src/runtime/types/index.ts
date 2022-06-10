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

// Not exported by Nuxt, so we need to declare it ourselves
// https://github.com/nuxt/framework/blob/main/packages/nuxt/src/app/composables/fetch.ts
export type _Transform<Input = any, Output = any> = (input: Input) => Output
export type PickFrom<T, K extends Array<string>> = T extends Array<any> ? T : T extends Record<string, any> ? Pick<T, K[number]> : T
export type KeysOf<T> = Array<keyof T extends string ? keyof T : string>
export type KeyOfRes<Transform extends _Transform> = KeysOf<ReturnType<Transform>>
