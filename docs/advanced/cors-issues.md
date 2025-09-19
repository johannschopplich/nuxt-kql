### Can I Encounter CORS Issues?

::: tip tl;dr:
No, since Nuxt will proxy requests to Kirby through its own server.
:::

With the default module configuration, you will not have to deal with CORS issues. [`useKql`](/api/use-kql), [`useKirbyData`](/api/use-kirby-data), [`$kql`](/api/kql), and [`$kirby`](/api/kirby) pass a given request to the internal Nuxt server route `/api/__kirby__` set up by the module.

On the server, the request is forwarded to the Kirby instance, and the response is sent back to the client. Since the request is made server-side, CORS is not an issue.

### What if I Enable Client-Side Requests?

When enabling `client: true` in your Nuxt Kirby configuration, requests are sent directly from the browser to Kirby, which may encounter CORS issues depending on your Kirby setup.

If you have followed the [Getting Started guide](/essentials/getting-started#step-3-set-up-your-kirby-backend), your Kirby instance should already be configured with the [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/). It includes default CORS settings that allow requests from any origin.

```php
// site/config/config.php
return [
    'headless' => [
        // https://kirby.tools/docs/headless/configuration/cors
        'cors' => [
            'allowOrigin' => '*',
            'allowMethods' => 'GET, POST, OPTIONS',
            'allowHeaders' => 'Accept, Content-Type, Authorization, X-Language',
            'maxAge' => '86400',
        ]
    ]
];
```

::: info
To improve security, you might want to restrict the `allowOrigin` parameter to your actual front-end domain in your production setup.
:::
