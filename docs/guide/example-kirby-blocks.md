# Kirby Blocks

::: tip
The [Kirby Nuxt Starter Kit](https://github.com/johannschopplich/kirby-nuxt-starterkit) provides a `<KirbyBlocks />` component for you with a [set of blocks](https://github.com/johannschopplich/kirby-nuxt-starterkit/tree/main/components/Kirby/Block) which you can use as well.
:::

Consider the following Nuxt page below, illustrating how to query [Kirby Blocks](https://getkirby.com/docs/reference/panel/fields/blocks).

For demonstration purposes, only `heading`, `image` and `text` blocks are parsed. Using a `v-for` directive, we iterate over each block and read out its `content` property – i.e. `content.level` and `content.text` of a heading.

Typings are optional to use, but will improve your editor suggestions and reduce type errors.

```vue
<script setup lang="ts">
// `kirby-fest` may find a special place in your heart just for providing types
import { KirbyBlock } from 'kirby-fest'

// Select page content needed for a simple page
const { data } = await useKql({
  query: 'page("notes/across-the-ocean")',
  select: {
    id: true,
    title: true,
    // That is where the magic happens
    text: 'page.text.toBlocks'
  }
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

        <!-- Handle the image block -->
        <img
          v-else-if="block.type === 'image'"
          :src="(block as KirbyBlock<'image'>).content.url"
        >

        <!-- Handle the text block -->
        <div v-else-if="block.type === 'text'" v-html="block.content?.text" />

        <!-- Handle all other blocks -->
        <!-- … -->
      </template>
    </div>
  </div>
</template>
```
