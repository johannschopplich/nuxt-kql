# Can I Encounter CORS Issues?

## tl;dr

No.

## Detailed Answer

With the default module configuration, you will not have to deal with CORS issues. [`useKql`](/api/use-kql) and [`$kql`](/api/kql) pass given queries to the Nuxt server route `/api/__kirby__`. The query is fetched from the Kirby instance on the server-side and then passed back to the client. Thus, no data is fetched from the Kirby instance on the client-side. It is proxied by the Nuxt server and no CORS issues will occur.
