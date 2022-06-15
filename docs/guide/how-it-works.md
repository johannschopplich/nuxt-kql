# How It Works

When passing a KQL query to either [`useKql`](/api/use-kql) or [`$kql`](/api/kql) as a parameter, the corresponsing composable will initiate a POST request to the Nuxt server route `/api/__kql__` defined by this module. The KQL query will be encoded in the request body.

The internal server-side API route then fetches the actual query data from the Kirby instance and passes the response back to the client. Thus, no KQL requests to the Kirby instance are initiated on the client-side.

This proxy behaviour has the benefit of omtting CORS issues, since data is sent from server to server.

During server-side rendering, calling [`useKql`](/api/use-kql) or [`$kql`](/api/kql) to fetch the `/api/__kql__` API route will directly call the relevant function (emulating the request), saving an additional API call. Thus, only the fetch request from Nuxt to Kirby would be performed.

::: info
Query responses are cached (with a key calculated by hashing the query). Subsequent calls will return cached responses, saving duplicated requests.
:::
