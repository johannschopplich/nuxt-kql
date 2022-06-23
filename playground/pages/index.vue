<script setup lang="ts">
import type { KirbyQueryRequest, KirbyQueryResponse } from '#nuxt-kql'

// Typed response
interface KirbySite extends KirbyQueryResponse {
  result?: {
    title: string
    children: {
      id: string
      title: string
      isListed: boolean
    }[]
  }
}

const refreshIndex = ref(0)
const query = ref<KirbyQueryRequest>({
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

const { data, refresh } = await useKql<KirbySite>(query)

function updateQuery() {
  (query.value.select as Record<string, any>).title = 'site.title.upper'
  refresh()
}
</script>

<template>
  <div>
    <h1>Send KQL Queries</h1>
    <p>KQL Data is being proxied by a Nuxt server route and passed back to the client.</p>
    <hr>
    <h2>Query</h2>
    <pre>{{ JSON.stringify(query, undefined, 2) }}</pre>
    <h2>Response</h2>
    <pre>{{ JSON.stringify(data?.result, undefined, 2) }}</pre>
    <p>Refreshed: {{ refreshIndex }} times</p>
    <button @click="refresh(), refreshIndex++">
      Refresh
    </button>
    <button @click="updateQuery()">
      Change query and refresh
    </button>
  </div>
</template>
