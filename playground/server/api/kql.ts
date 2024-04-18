// TODO: Why does tsc fail for `defineEventHandler`?
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { $kql, defineEventHandler } from '#imports'

export default defineEventHandler(() => {
  return $kql({
    query: 'site',
  })
})
