<script setup lang="ts">
const refreshIndex = ref(0)
const query = ref({
  query: 'site',
  select: {
    title: 'site.title',
    children: 'site.children',
  },
})

const { data, refresh } = await usePublicKql(query)

function updateQuery() {
  query.value.select.title = 'site.title.upper'
  refresh()
}
</script>

<template>
  <div>
    <h1>Fetch Data in Client</h1>
    <p>
      Data is being fetched in the client only. This is faster, since the content is<br>
      fetched directly from your Kirby instance. But more unsafe depending on your usecase, because the authorization data is published in the frontend.
    </p>
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
