# Common Issues

Solutions to frequently encountered problems when using Nuxt Kirby.

## CORS Issues

### Can I Encounter CORS Issues?

**tl;dr**: No, since Nuxt will proxy requests to Kirby through its own server.

With the default module configuration, you will not have to deal with CORS issues. [`useKql`](/api/use-kql), [`useKirbyData`](/api/use-kirby-data), [`$kql`](/api/kql), and [`$kirby`](/api/kirby) pass a given request to the internal Nuxt server route `/api/__kirby__` set up by the module.

On the server, the request is forwarded to the Kirby instance, and the response is sent back to the client. Since the request is made server-side, CORS is not an issue.

### What if I Enable Client-Side Requests?

If you enable `client: true` in your configuration, requests go directly from the browser to Kirby, which may encounter CORS issues depending on your Kirby setup.

**Solution**: Configure CORS headers in your Kirby installation:

```php
// site/config/config.php
return [
    'api' => [
        'basicAuth' => true,
        'allowInsecure' => true // for development only
    ],
    'hooks' => [
        'route:before' => function ($route, $path, $method) {
            if ($method === 'OPTIONS') {
                header('Access-Control-Allow-Origin: *');
                header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
                header('Access-Control-Allow-Headers: Content-Type, Authorization');
                exit;
            }
        }
    ]
];
```

## Authentication Issues

**Check your environment variables**:

```bash
# Make sure these are set correctly
KIRBY_BASE_URL=https://your-kirby-site.com
KIRBY_API_TOKEN=your-secret-token

# Or for basic auth:
KIRBY_API_USERNAME=your-username
KIRBY_API_PASSWORD=your-password
```

**Check your Kirby setup**:

For **bearer token** authentication:
- Ensure the [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/) is installed
- Verify the token matches in both applications
- Check that the endpoint is `api/kql` not `api/query`

For **basic authentication**:
- Ensure `basicAuth` is enabled in Kirby's config
- Check that the endpoint is `api/query` not `api/kql`
- Verify username and password are correct
