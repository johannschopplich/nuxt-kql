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
    <h1>Fetch Data Safely</h1>
    <p>Data is being fetched via a custom Nuxt server route for Kirby queries.</p>
    <hr>
    <h2>{{ data?.result?.title }}</h2>
    <h3>Query</h3>
    <pre>{{ JSON.stringify(query, undefined, 2) }}</pre>
    <h3>Response</h3>
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
