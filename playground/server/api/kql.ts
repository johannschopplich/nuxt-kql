// TODO: Why does tsc fail for `defineEventHandler`?
// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import { $kql, defineEventHandler } from '#imports'

export default defineEventHandler(() => {
  return $kql({
    query: 'site',
  })
})
