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

  return offsetWidth - clientWidth || 0
}

export const parsePadding = (
  padding: string,
  unit: string
): {
  paddingLeft: number
  paddingRight: number
  paddingTop: number
  paddingBottom: number
} => {
  if (!padding)
    return {
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
    }
  const paddingParams = padding.split(' ')
  switch (paddingParams.length) {
    case 1:
      const p = Number(paddingParams[0].replace(unit, ''))
      return {
        paddingLeft: p,
        paddingRight: p,
        paddingTop: p,
        paddingBottom: p,
      }
    case 2:
      const ptb = Number(paddingParams[0].replace(unit, ''))
      const plr = Number(paddingParams[1].replace(unit, ''))
      return {
        paddingLeft: plr,
        paddingRight: plr,
        paddingTop: ptb,
        paddingBottom: ptb,
      }
    case 3:
      const pt = Number(paddingParams[0].replace(unit, ''))
      const _plr = Number(paddingParams[1].replace(unit, ''))
      const pb = Number(paddingParams[2].replace(unit, ''))

      return {
        paddingLeft: _plr,
        paddingRight: _plr,
        paddingTop: pt,
        paddingBottom: pb,
      }
    case 4:
      return {
        paddingLeft: Number(paddingParams[3].replace(unit, '')),
        paddingRight: Number(paddingParams[1].replace(unit, '')),
        paddingTop: Number(paddingParams[0].replace(unit, '')),
        paddingBottom: Number(paddingParams[2].replace(unit, '')),
      }
    default:
      return {
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }
  }
}
