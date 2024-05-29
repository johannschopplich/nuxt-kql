<script setup lang="ts">
import { useServerHead } from '#imports'

useServerHead({
  title: 'nuxt-kql',
  link: [
    { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
