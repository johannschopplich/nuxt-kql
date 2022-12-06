<script setup lang="ts">
import type { KirbyQueryRequest } from '#nuxt-kql'

const refreshIndex = ref(0)
const query = ref<KirbyQueryRequest>({
  query: 'site',
  select: {
    title: true,
    children: true,
  },
})

const { data, refresh } = await useKql(query, { client: true })

function updateQuery() {
  query.value = {
    query: 'site',
    select: {
      title: 'site.title.upper',
      children: true,
    },
  }
}
</script>

<template>
  <div>
    <h1>Send KQL Queries Client-Side</h1>
    <p>
      Data is being fetched in the client only. This is faster, since the content is fetched directly from your Kirby instance. But more unsafe depending on your usecase, because the authorization data is published in the frontend.
    </p>
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
