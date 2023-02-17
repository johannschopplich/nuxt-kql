<script setup lang="ts">
const data = await $kql({
  query: 'site',
  select: {
    title: true,
    children: {
      query: 'site.children',
      select: ['id', 'title', 'isListed'],
    },
  },
})

useTestResult(data)
</script>
