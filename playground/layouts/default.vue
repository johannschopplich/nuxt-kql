<template>
  <header>
    <NuxtLink to="/">
      Index
    </NuxtLink>
    /
    <NuxtLink to="/client">
      <span>Client-side only</span>
    </NuxtLink>
  </header>

  <main>
    <slot />
  </main>
</template>
