# How to Track Errors?

Every composable returns a [`KirbyQueryResponse`](/api/types-query-response) typed response, if the request to Kirby succeeded. Even if your request is not authenticated, a connection to the Kirby instance could be established.

Inspect the `code` and `status` property of your query response first to make sure the Kirby instance at least returns something:

```ts
// `data` will be of type `KirbyQueryResponse` if the request to Kirby itself succeeded
const { data } = await useKql({ query: 'site' })

// Log the code and status and get information on if the request was not authenticated
console.log('Status Code', data.code)
console.log('Status Message', data.status)
```

If that doesn't give you relevant insights, the request to the Kirby backend was probably faulty. The [Nuxt server route to proxy KQL requests](/guide/how-it-works) used by [`useKql`](/api/use-kql) and [`$kql`](/api/kql) will return a `NuxtError`:

```ts
// See https://github.com/unjs/h3 for the full error interface
interface NuxtError<DataT = unknown> extends H3Error<DataT> {}
```

To inspect the error thrown inside the server proxy, log its `error` variable:

```ts
// `error` will be of type `NuxtError` if the request to Kirby failed
const { data, error } = await useKql({ query: 'site' })

// Log the code and status and get information on if the request was not authenticated
console.log('Status Code', error.statusCode)
console.log('Status Message', error.statusMessage)
console.log('Data', error.data)
```
