import { $kql, defineEventHandler } from '#imports'

export default defineEventHandler(() => {
  return $kql({
    query: 'site',
  })
})
