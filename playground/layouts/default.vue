<template>
  <header>
    <NuxtLink to="/">
      Index
    </NuxtLink>
    /
    <NuxtLink to="/client">
      <span>Client KQL</span>
    </NuxtLink>
  </header>

  <main>
    <slot />
  </main>
</template>
