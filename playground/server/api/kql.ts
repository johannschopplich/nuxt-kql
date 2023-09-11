export default defineEventHandler(() => {
  return $kql({
    query: 'site',
  })
})
