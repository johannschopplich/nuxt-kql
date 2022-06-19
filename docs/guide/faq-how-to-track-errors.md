# How to Track Errors?

Every composable returns a `KirbyQueryResponse` typed response, which equals the response schema from [KQL](https://github.com/getkirby/kql).

```ts
interface KirbyQueryResponse {
  code: number
  status: string
  result?: any
}
```

If the request to the Kirby backend is unauthenticated or another error has been thrown from within the [Nuxt server API](/guide/how-it-works), you can inspect the `code` and `status` property:

```ts
// `data` will always be of type `KirbyQueryResponse`
const { data } = await useQuery({ query: 'site' })

console.log('Code', data.code)
console.log('Status', data.status)

// Will include the error response of the fetch request to the Kirby backend
console.log('Message', data.message)
```
