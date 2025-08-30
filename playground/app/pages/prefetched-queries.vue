<script setup lang="ts">
import { site } from '#nuxt-kql'
</script>

<template>
  <div>
    <h1>Prefetched KQL Queries</h1>
    <p>Queries can be fetched at build-time to improve performance in production.</p>
    <hr>
    <h2>Prefetched site data</h2>
    <pre>{{ JSON.stringify(site, undefined, 2) }}</pre>
  </div>
</template>
