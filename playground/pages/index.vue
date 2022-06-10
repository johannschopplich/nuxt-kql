<script setup lang="ts">
const query = ref({
  query: 'site',
  select: {
    title: 'site.title',
  },
})

const { data, refresh } = await useKql(query)

function updateQuery() {
  query.value.select = {
    title: 'site.title.upper',
  }
  refresh()
}
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
    <pre>{{ JSON.stringify(data?.result, undefined, 2) }}</pre>
    <button @click="updateQuery()">
      Change query and refresh
    </button>
  </div>
</template>
