/* eslint-disable ts/prefer-ts-expect-error */
// @ts-ignore: CI fails to resolve the import
export default defineEventHandler(() => {
  // @ts-ignore: CI fails to resolve the import
  return $kql({
    query: 'site',
  })
})
