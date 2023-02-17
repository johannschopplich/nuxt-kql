<script setup lang="ts">
const { data } = await useKql({
  query: 'site',
  select: {
    title: true,
    children: {
      query: 'site.children',
      select: ['id', 'title', 'isListed'],
    },
  },
})

useTestResult(data.value)
</script>
