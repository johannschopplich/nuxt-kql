<script setup lang="ts">
const { data } = await useKirbyData('_site', { client: true })

useTestResult(data.value)
</script>
