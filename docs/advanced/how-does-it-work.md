# How It Works

::: info tl;dr
The internal `/api/__kirby__` server route serves as a proxy between your Nuxt app and the Kirby instance. This way, all requests to Kirby are made from the server-side, avoiding CORS issues.
:::

All [composables](/api/), such as [`useKql`](/api/use-kql) and [`$kql`](/api/kql), will initiate a POST request to the Nuxt server route `/api/__kirby__` defined by this module. The KQL query or any other request data is sent in the request body.

This internal server route then fetches the data from your Kirby instance using the provided configuration (e.g. `KIRBY_BASE_URL` and `KIRBY_API_TOKEN` environment variables). The response from Kirby is then passed back to the client. This way, every request is made server-side, protecting your API credentials and avoiding CORS issues.

During server-side rendering, calls to the Nuxt server route will directly call the relevant function (emulating the request), saving an additional API call. Thus, only the fetch request from Nuxt to Kirby is made.

::: info
Responses are cached client-side by default. Subsequent calls will return cached responses, saving duplicated requests. Read more in the [Caching Strategies guide](/guides/caching-strategies).
:::

::: tip
The proxy layer will not only pass through your API's response body to the client, but also HTTP status code, HTTP status message and headers. This way, you can handle errors just like you would when directly querying the Kirby API.
:::
