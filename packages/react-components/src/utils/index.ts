export const findIndexOfMinValue = (arr: number[], index: number) => {
  const _arr = arr.slice()
  _arr.sort((a, b) => a - b)
  return arr.findIndex((i) => i === _arr[index])
}
