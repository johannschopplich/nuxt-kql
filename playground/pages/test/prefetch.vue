<script setup lang="ts">
const { data } = await useKql({
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
  <pre>{{ JSON.stringify(data) }}</pre>
</template>
