<script setup lang="ts">
import type { KirbyQueryRequest } from '#nuxt-kql'

const refreshIndex = ref(0)
const query = ref<KirbyQueryRequest>({
  query: 'site',
  select: {
    title: 'site.title',
    children: 'site.children',
  },
})

const { data, refresh } = await useQuery(query)

function updateQuery() {
  (query.value.select as Record<string, any>).title = 'site.title.upper'
  refresh()
}
</script>

<template>
  <div>
    <h1>Retrieve KQL Data</h1>
    <p>KQL Data is being fetched by a Nuxt server route.</p>
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
