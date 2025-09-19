# Migration Guide

## From Nuxt KQL v2 to Nuxt Kirby v3

[Matt Lenz](https://github.com/mattlenz) kindly provided the `nuxt-kirby` npm package name and has transferred the ownership of the package to me. Therefore, the module name has changed from `nuxt-kql` to `nuxt-kirby`. This better reflects the purpose of the module, which is to integrate [Kirby CMS](https://getkirby.com/) with Nuxt – not only for KQL queries.

Other than the module name change, there are no breaking changes in the module itself. However, you have to update the Nuxt module configuration key from `kql` to `kirby`.

Please follow these steps to migrate your existing Nuxt KQL v2 project to Nuxt Kirby v3:

1. Uninstall the `nuxt-kql` module and install the `nuxt-kirby` module instead:
   ```bash
   npm uninstall nuxt-kql && npm install nuxt-kirby

   # pnpm
   pnpm remove nuxt-kql && pnpm add nuxt-kirby

   # yarn
   yarn remove nuxt-kql && yarn add nuxt-kirby
   ```

2. Update your `nuxt.config.ts` file to replace all instances of `kql` with `kirby`. For example, change this:
   ```ts
   // `nuxt.config.ts`
   export default defineNuxtConfig({
     modules: ['nuxt-kql'], // [!code --]
     modules: ['nuxt-kirby'], // [!code ++]

     kql: { // [!code --]
       auth: 'bearer' // [!code --]
     }, // [!code --]
     kirby: { // [!code ++]
       auth: 'bearer' // [!code ++]
     }, // [!code ++]
   })
   ```

To keep breaking changes to a minimum, the import alias `#nuxt-kql` has been kept for now. If you are using it to import any Kirby types, you can keep using it. For future-proofing your code, please consider changing it to `#nuxt-kirby` instead. For example, change this:

```ts
import type { KirbyQueryRequest } from '#nuxt-kirby' // [!code ++]
import type { KirbyQueryRequest } from '#nuxt-kql' // [!code --]

const query = ref<KirbyQueryRequest>({
  query: 'page("notes/across-the-ocean")',
  select: {
    id: true,
    title: true,
    text: 'page.text.toBlocks',
  },
})
```
