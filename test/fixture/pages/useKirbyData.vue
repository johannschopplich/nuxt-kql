<script setup lang="ts">
const { data } = await useKirbyData('api/__template__/__site__')

useTestResult(data.value)
</script>
