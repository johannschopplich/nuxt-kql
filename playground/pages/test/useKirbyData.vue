<script setup lang="ts">
const { data } = await useKirbyData('_site')
</script>

<template>
  <pre>{{ JSON.stringify(data) }}</pre>
</template>
