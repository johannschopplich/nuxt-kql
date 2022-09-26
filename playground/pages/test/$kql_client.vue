<script setup lang="ts">
const data = await $kql({
  query: 'site',
  select: {
    title: true,
    children: {
      query: 'site.children',
      select: ['id', 'title', 'isListed'],
    },
  },
}, { client: true })
</script>

<template>
  <pre>{{ JSON.stringify(data) }}</pre>
</template>

