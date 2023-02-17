<script setup lang="ts">
const { data } = await useKirbyData('_site')

useTestResult(data.value)
</script>
