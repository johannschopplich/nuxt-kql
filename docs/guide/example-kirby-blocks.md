# Kirby Blocks

The following Nuxt page shows how to query [Kirby Blocks](https://getkirby.com/docs/reference/panel/fields/blocks).

For demonstration purposes, only `heading` blocks are parsed (like heading level and content). For every other block, existence of the `text` content key is assumed.

Typings are optional to use.

```vue
<script setup lang="ts">
import { KirbyBlock } from '#nuxt-kql'

const { data } = await useQuery({
  query: 'kirby.page("notes/across-the-ocean")',
  select: {
    id: 'page.id',
    title: 'page.title',
    text: 'page.text.toBlocks',
  },
})

// Tell the reactive variable that every block is possible
const text = computed<KirbyBlock<string>[]>(() => data.value?.result?.text ?? [])
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>

    <div class="prose">
      <template v-for="(block, index) in text" :key="index">
        <component :is="block.content.level" v-if="block.type === 'heading'">
          <!-- Type cast the block as heading for the correct `content` typings -->
          {{ (block as KirbyBlock<'heading'>).content.text }}
        </component>
        <div v-else v-html="block.content.text" />
      </template>
    </div>
  </div>
</template>
```
