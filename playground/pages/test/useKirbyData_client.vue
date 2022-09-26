<script setup lang="ts">
const { data } = await useKirbyData('_site', { client: true })
</script>

<template>
  <pre>{{ JSON.stringify(data) }}</pre>
</template>
