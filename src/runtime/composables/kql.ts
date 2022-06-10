import type { NitroFetchRequest } from 'nitropack'
import type { Ref } from 'vue'
import { isRef } from 'vue'
import type { KqlQueryRequest, KqlQueryResponse } from '../types'
import type { AsyncData, UseFetchOptions } from '#app'
import { useFetch, useRuntimeConfig } from '#app'

export function useKql<ResT = KqlQueryResponse, ReqT = KqlQueryRequest>(
  query: Ref<ReqT> | ReqT | (() => ReqT),
  opts: Omit<UseFetchOptions<ResT>, 'baseURL' | 'method' | 'body' > = {},
) {
  const { public: { kql: { url, endpoint } } } = useRuntimeConfig()

  const _query = computed(() => {
    let q = query
    if (typeof q === 'function')
      q = (q as (() => ReqT))()

    return (isRef(q) ? q.value : q) as ReqT
  })

  const [headers, headersEntries] = getAuthHeaders()

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(endpoint, {
    ...opts,
    baseURL: url,
    method: 'POST',
    body: _query.value,
    headers: Array.isArray(opts.headers)
      ? [...opts.headers, ...headersEntries]
      : { ...opts.headers, ...headers },
  }) as AsyncData<ResT, true | Error>
}

function getAuthHeaders(): [Record<string, string>, string[][]] {
  const { public: { kql: { auth, credentials, token } } } = useRuntimeConfig()
  const headers: HeadersInit = {}

  if (auth === 'basic') {
    if (!credentials.username || !credentials.password)
      throw new Error('Missing KQL credentials for basic auth')

    const { username, password } = credentials

    headers.Authorization = Buffer.from(`${username}:${password}`).toString('base64')
  }

  if (auth === 'bearer') {
    if (!token)
      throw new Error('Missing KQL token for bearer auth')

    headers.Authorization = `Bearer ${token}`
  }

  return [
    headers,
    Object.entries(headers),
  ]
}
