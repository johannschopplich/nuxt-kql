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
  <div>
    <pre>{{ JSON.stringify(data) }}</pre>
  </div>
</template>

