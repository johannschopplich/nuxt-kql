# How It Works

## tl;dr

With an internal `/api/__kql` server route proxying your query request.

## Detailed Answer

The [`useKql`](/api/use-kql) and [`$kql`](/api/kql) composables will initiate a POST request to the Nuxt server route `/api/__kql` defined by this module. The KQL query will be encoded in the request body.

The internal server route then fetches the actual data for a given query from the Kirby instance and passes the response back to the template/client. Thus, no KQL requests to the Kirby instance are initiated on the client-side. This proxy behavior has the benefit of omitting CORS issues, since data is sent from server to server.

During server-side rendering, calls to the Nuxt server route will directly call the relevant function (emulating the request), saving an additional API call. Thus, only the fetch request from Nuxt to Kirby would be performed.

::: info
Query responses are cached (with a key calculated by hashing the query) and hydrated to the client. Subsequent calls will return cached responses, saving duplicated requests.
:::
