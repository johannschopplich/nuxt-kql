// TODO: Why does tsc fail in this file?
// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck

export default defineEventHandler(() => {
  return $kql({
    query: 'site',
  })
})
