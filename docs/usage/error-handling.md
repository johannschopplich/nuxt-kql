# Error Handling

While the idea of this Nuxt module is to mask your Kirby API (and credentials) inside the [server proxy](/faq/how-does-it-work), Nuxt KQL will minimize the hassle of handling errors by passing through the following properties to the response on the client:

- Response Body
- HTTP Status Code
- HTTP Status Message
- Headers

So if a request to Kirby fails, you can still handle the error response in your Nuxt application just as you would with a direct API call. In this case, both [`useKql`](/api/use-kql) and [`$kql`](/api/kql) will throw a `NuxtError`.

Logging the available error properties will give you insight into what went wrong:

```ts
// `data` will be of type `KirbyQueryResponse` if the request to Kirby itself succeeded
const { data, error } = await useKql({ query: 'site' })

// Log the error if the request to Kirby failed
console.log(
  'Request failed with:',
  error.value.statusCode,
  error.value.statusMessage,
  // Response body
  error.value.data
)
```

## `NuxtError` Type Declaration

```ts
interface NuxtError<DataT = unknown> extends H3Error<DataT> {}

// See https://github.com/unjs/h3
class H3Error<DataT = unknown> extends Error {
  static __h3_error__: boolean
  statusCode: number
  fatal: boolean
  unhandled: boolean
  statusMessage?: string
  data?: DataT
  cause?: unknown
  constructor(message: string, opts?: {
    cause?: unknown
  })
  toJSON(): Pick<H3Error<DataT>, 'data' | 'statusCode' | 'statusMessage' | 'message'>
}
```
