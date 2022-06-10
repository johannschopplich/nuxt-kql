import type { NitroFetchRequest } from 'nitropack'
import type { Ref } from 'vue'
import { isRef } from 'vue'
import type { KqlQueryRequest, KqlQueryResponse } from '../types'
import type { AsyncData } from '#app'
import { useFetch, useRuntimeConfig } from '#app'

export function useKql<ResT = KqlQueryResponse, ReqT = KqlQueryRequest>(
  query: Ref<ReqT> | ReqT | (() => ReqT),
) {
  const { public: { kql: { url, endpoint } } } = useRuntimeConfig()

  const _query = computed(() => {
    let q = query
    if (typeof q === 'function')
      q = (q as (() => ReqT))()

    return (isRef(q) ? q.value : q) as ReqT
  })

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(endpoint, {
    baseURL: url,
    method: 'POST',
    body: _query,
    headers: getAuthHeader(),
  }) as AsyncData<ResT, true | Error>
}

function getAuthHeader() {
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

  return headers
}
