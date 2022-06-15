# How It Works

When passing a KQL query to either [`useKql`](/api/use-kql) or [`$kql`](/api/kql) as a parameter, the corresponsing method will initiate a POST request with the query encoded to the Nuxt server route `/api/__kql__` defined by this module.

The internal server-side API route then fetches the actual query data from the Kirby instance and passes the response back to the client. Thus, no KQL requests to the Kirby instance are initiated on the client-side.

This proxy behaviour has the benefit of omtting CORS issues, since data is sent from server to server.

Query responses are cached (with a key calculated by hashing the query). Subsequent calls will return cached responses, saving duplicated requests.
