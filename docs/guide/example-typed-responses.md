# Typed Responses

For the best TypeScript experience, you may want to define your own response types, which will help catch errors in your template.

Given the following query:

```json
{
  "query": "site",
  "select": {
    "title": "site.title",
    "children": {
      "query": "site.children",
      "select": {
        "id": true,
        "title": true,
        "isListed": "page.isListed"
      }
    }
  }
}
```

You can create a response interface by extending the `KirbyQueryResponse`, for example in your `types.ts`:

```ts
// `#nuxt-kql` may find a special place in your heart just for providing types
import type { KirbyQueryResponse } from '#nuxt-kql'

// Extend the default response type with the result we expect from the query response
export interface KirbySite extends KirbyQueryResponse {
  result?: {
    title: string
    children: {
      id: string
      title: string
      isListed: boolean
    }[]
  }
}
```

## Example

```vue
<script setup lang="ts">
import type { KirbySite } from './types'

// `data` will now be of `KirbySite` type
const { data } = await useQuery<KirbySite>({
  query: 'site',
  select: {
    title: true,
    children: {
      query: 'site.children',
      select: {
        id: true,
        title: true,
        isListed: true,
      },
    },
  },
})
</script>

<template>
  <div>
    <!-- The IDE will provide auto completion and error checking for nested keys -->
    <h1>{{ data?.result.title }}</h1>
  </div>
</template>
```
