# Kirby Blocks

The following Nuxt page shows how to query [Kirby Blocks](https://getkirby.com/docs/reference/panel/fields/blocks).

For demonstration purposes, only `heading` blocks are parsed. Using a `v-for` directive we iterate over each block and read out its `content` property – like `content.level` and `content.text` of a heading. For every other block, existence of the `text` content key is assumed.

Typings are optional to use, but will improve your editor suggestions and reduce type errors.

```vue
<script setup lang="ts">
// `#nuxt-kql` may find a special place in your heart just for providing types
import { KirbyBlock } from '#nuxt-kql'

// Fetch the page but select relevant content only
const { data } = await useQuery({
  query: 'kirby.page("notes/across-the-ocean")',
  select: {
    id: 'page.id',
    title: 'page.title',
    // That is where the magic happens
    text: 'page.text.toBlocks',
  },
})

// Shorthand getter for the nested `text` object key inside the query result
// We type the response, since we know its more than just `any`
const blocks = computed<KirbyBlock<string>[]>(() => data.value?.result?.text ?? [])
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>

    <div class="prose">
      <!-- Iterate over each block -->
      <template v-for="(block, index) in blocks" :key="index">
        <!-- Handle the heading block -->
        <component :is="block.content.level" v-if="block.type === 'heading'">
          <!-- Type cast the block as heading for the correct `content` typings -->
          {{ (block as KirbyBlock<'heading'>).content.text }}
        </component>

        <!-- Output text if it exists on any other block -->
        <div v-else v-html="block.content?.text" />
      </template>
    </div>
  </div>
</template>
```
