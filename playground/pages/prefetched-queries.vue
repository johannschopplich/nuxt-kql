<script setup lang="ts">
// Import the query result following the query's given name in nuxt.config.ts
import { site } from '#build/kql'

// A type is added for each query result
import type { KirbySite } from '#build/kql'
</script>

<template>
  <div>
    <h1>Prefetched KQL Queries</h1>
    <p>Queries can be fetched on build-time to improve performance in production.</p>
    <hr>
    <h2>Prefetched site data</h2>
    <pre>{{ JSON.stringify(site, undefined, 2) }}</pre>
  </div>
</template>
