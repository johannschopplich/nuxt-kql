# Multi-Language Sites

`nuxt-kql` comes with built-in support for multi-language Kirby sites. For this to work, you will have to use the [kirby-headless-starter](https://github.com/johannschopplich/kirby-headless-starter), which provides a custom KQL endpoint to retrieve translated content.

To fetch language-specific content from your Kirby instance, pass a `language` option with your query request. It is needed for every language but the default one.

## Example

Take an imaginary about page as an example:

- `en/about` – the default language's content
- `de/ueber-uns` – translated content with a custom slug

Since `en` is the default language, the `language` option isn't needed:

```ts
const { data } = await useKql({
  query: 'kirby.page("about")'
})
```

For the `de` slug to be found, add the `language` option. Otherwise Kirby won't be able to resolve the custom slug.

```ts
const { data } = await useKql(
  {
    query: 'kirby.page("ueber-uns")'
  },
  {
    language: 'de'
  }
)
```

## Dynamic Routes

You will probably use some kind of dynamic routes in your Nuxt application. To make your life easier fetching translated content, you can create a `useLocaleSlug` composable to extract both a page's `slug` and its language code:

```ts
// `composables/language.ts`

// Extract language code and slug from path
export function useLocaleSlug(path: string, homePageId = 'home') {
  const [language, ...rest] = path.split('/').filter(i => i !== '')

  return {
    language,
    slug: rest.join('/') || homePageId,
  }
}
```

Now you can simplify your templates. For example in `pages/[...id].vue`:

```vue
<script setup lang="ts">
const route = useRoute()
const { language, slug } = useLocaleSlug(route.path)

const { data } = await useKql({
  query: `kirby.page("${slug}")`
}, { language })
</script>
```
