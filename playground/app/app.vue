<script setup lang="ts">
import { useHead } from '#imports'

if (import.meta.server) {
  useHead({
    title: 'Nuxt Kirby',
    link: [
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css' },
    ],
  })
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
