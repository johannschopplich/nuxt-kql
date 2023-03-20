<template>
  <header>
    <h2>nuxt-kql</h2>

    <NuxtLink to="/">
      Index
    </NuxtLink>
    /
    <NuxtLink to="/blocks">
      <span>Kirby Blocks</span>
    </NuxtLink>
    /
    <NuxtLink to="/prefetched-queries">
      <span>Prefetched Queries</span>
    </NuxtLink>
    /
    <NuxtLink to="/client-query">
      <span>Client-side Query</span>
    </NuxtLink>
  </header>

  <main>
    <slot />
  </main>
</template>
