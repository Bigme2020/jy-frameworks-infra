export const findIndexOfMinValue = (arr: number[], index: number) => {
  const _arr = arr.slice()
  _arr.sort((a, b) => a - b)
  return arr.findIndex((i) => i === _arr[index])
}

export const findIndexOfMaxValue = (arr: number[], index: number) => {
  const _arr = arr.slice()
  _arr.sort((a, b) => b - a)
  return arr.findIndex((i) => i === _arr[index])
}

export const getScrollBarWidth = () => {
  const scroller = document.createElement('div')
  const content = document.createElement('div')

  scroller.style.visibility = 'hidden'
  scroller.style.position = 'absolute'
  scroller.style.top = '0'
  scroller.style.left = '0'
  scroller.style.height = '10px'
  scroller.style.overflowY = 'scroll'
  content.style.height = '100px'

  scroller.appendChild(content)
  document.body.appendChild(scroller)

  const offsetWidth = scroller.offsetWidth
  const clientWidth = scroller.clientWidth

  console.log({
    offsetWidth,
    clientWidth,
  })

  return offsetWidth - clientWidth
}
