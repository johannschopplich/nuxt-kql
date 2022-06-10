import type { NitroFetchRequest } from 'nitropack'
import type { Ref } from 'vue'
import type { KeyOfRes, KqlQueryRequest, KqlQueryResponse, PickFrom } from '../types'
import type { AsyncData } from '#app'
import { useFetch, useRuntimeConfig } from '#app'

export function useKql<ResT = KqlQueryResponse, ReqT = KqlQueryRequest>(
  body: Ref<ReqT> | ReqT | (() => ReqT),
): AsyncData<PickFrom<ResT, KeyOfRes<(res: ResT) => ResT>>, true | Error> {
  const { public: { kql: { url, endpoint } } } = useRuntimeConfig()

  return useFetch<ResT, Error, NitroFetchRequest, ResT>(endpoint, {
    baseURL: url,
    method: 'POST',
    body,
    headers: getAuthHeader(),
  })
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
