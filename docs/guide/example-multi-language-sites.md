# Multi-Language Sites

`nuxt-kql` comes with built-in support for multi-language Kirby sites. For this to work, you will have to use the [kirby-headless-starter](https://github.com/johannschopplich/kirby-headless-starter), which provides a custom KQL endpoint to retrieve translated content.

To fetch language-specific content from your Kirby instance, pass a `language` option with your query request. (It is technically needed for non-primary languages only, but you can pass it with every KQL query.)

```ts
// Get the German translation of the about page
const { data } = await useKql(
  { query: 'page("ueber-uns")' },
  { language: 'de' }
)
```

## Dynamic Routes

You will probably use some kind of dynamic routes in your Nuxt application. To make your life easier fetching translated content, create a `useLocaleSlug` composable to extract both a page's `slug` and its language code:

```ts
// `composables/language.ts`

// Extract language code and slug from path
export function useLocaleSlug(path: string, homePageId = 'home') {
  // Split path into segments and remove empty strings
  const [language, ...rest] = path.split('/').filter(Boolean)

  return {
    language,
    slug: rest.join('/') || homePageId
  }
}
```

Now you can simplify your templates. For example in `pages/[...id].vue`:

```vue
<script setup lang="ts">
// Route may be `en/about`
const route = useRoute()
// Get the language `en` as well as slug `about`
const { language, slug } = useLocaleSlug(route.path)

// Fetch the slug for the current language
const { data } = await useKql(
  { query: `page("${slug}")` },
  { language }
)
</script>
```

## Handle Redirects

Take the imaginary about page from above as an example:

- `en/about` – the default language's content
- `de/ueber-uns` – translated content with a custom slug

In a multi-language setup, Kirby's page helper will always resolve the default page ID (of the primary language). This behavior may be unintentional, because the default slug `about` can be accessed within the other language: `de/about`, where only `de/ueber-uns` should be applicable.

We can handle that in our frontend:

```ts
const route = useRoute()
const { language, slug } = useLocaleSlug(route.path)

const { data } = await useKql(
  {
    query: `page("${slug}")`,
    select: {
      // ...
      // Make sure to get the slug
      slug: true,
    },
  },
  { language }
)

// `en/ueber-uns` can't be found, since the translated slug
// isn't accessible by the default language
if (!data.value?.result)
  console.error('Page not found')

// `de/about` can be found, but should be redirected to `de/ueber-uns`
if (data.value.result && data.value.result?.slug !== slug) {
  // SSR redirect to the translated slug
  navigateTo(`/${language}/${data.value.result.slug}`)
}
```
