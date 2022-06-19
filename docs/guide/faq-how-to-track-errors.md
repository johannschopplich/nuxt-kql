# How to Track Errors?

Every composable returns a `KqlQueryResponse` typed response, which equals the response schema from [KQL](https://github.com/getkirby/kql).

```ts
interface KqlQueryResponse {
  code: number
  status: string
  result?: any
}
```

If the request to the Kirby backend is unauthenticated or another error has been thrown, you can inspect the `code` and `status` property:

```ts
// `data` will always be of type `KqlQueryResponse`
const { data } = await useKql({ query: 'site' })

console.log('Status code', data.code)
console.log('Status message', data.message)
```

When the internal server API fails, it will infer the same response type.
