import React, {
  FC,
  ReactElement,
  useState,
  useMemo,
  UIEvent,
  useCallback,
  CSSProperties,
  useEffect,
  useRef,
  ReactNode,
} from 'react'
import {
  findIndexOfMaxValue,
  findIndexOfMinValue,
  getScrollBarWidth,
} from '../../utils'
import { useThrottle } from '../../hooks'

export interface VirtualListProps {
  width?: number
  height?: number
  itemHeight:
    | number
    | ((index: number) => number)
    | ((index: number) => Promise<number>)
  column?: number
  spaceX?: number
  spaceY?: number
  data: Array<any>
  renderItem: (index: number, style: CSSProperties) => ReactNode
  onEnd?: () => void
}

const VirtualList: FC<VirtualListProps> = ({
  data,
  width,
  height,
  itemHeight,
  column,
  spaceX = 20,
  spaceY = 20,
  renderItem,
  onEnd,
}): ReactElement => {
  const [scrollTop, setScrollTop] = useState(0)
  // 容器宽高取wrapperWidth和wrapperHeight, height和width只是外部传入
  const [wrapperHeight, setWrapperHeight] = useState(0)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  // renderData 用于表示当前需要渲染的列表
  const [renderData, setRenderData] = useState<ReactNode[]>([])
  // itemHeightMap 记录了所有item的高度 key为item索引 value为item高度
  const [itemHeightMap, setItemHeightMap] = useState<
    Record<string | number, number>
  >({})
  // lastColumn 用来记录上次的column，来监听column是否变化
  const lastColumn = useRef(column)

  const scrollBarWidth = useRef(0)

  const widthPerColumn = useMemo(
    () =>
      column
        ? (wrapperWidth - (column - 1) * spaceX - scrollBarWidth.current) /
          column
        : wrapperWidth,
    [wrapperWidth, column, spaceX, scrollBarWidth.current]
  )

  // 用于实现 width,height 未传时，组件自身的宽高自适应
  const adaptiveLayoutRef = useRef<HTMLDivElement>(null)

  const itemCount = useMemo(() => data.length, [data])

  const getFullRowHeights = useCallback(() => {
    // TODO: 这里可以优化，无需重复计算
    const rowHeights: number[] = []
    for (let i = 0; i < itemCount; i++) {
      if (rowHeights.length !== column) {
        rowHeights[i] = 0
      } else {
        const leftIndex = findIndexOfMinValue(rowHeights, 0)
        rowHeights[leftIndex] =
          rowHeights[leftIndex] + itemHeightMap[i] + spaceY
      }
    }
    return rowHeights
  }, [column, itemCount, itemHeightMap, spaceY])

  const listenScrollEnd = useThrottle((rowHeights: number[]) => {
    const minHeightIndex = findIndexOfMinValue(rowHeights, 0)
    const minHeight = rowHeights[minHeightIndex]

    if (
      scrollTop + wrapperHeight + 300 > minHeight &&
      typeof onEnd === 'function'
    ) {
      onEnd()
    }
  })

  // 内容高度
  const contentHeight = useMemo<number>(() => {
    if (!column || column === 1) {
      if (typeof itemHeight === 'number') {
        return itemCount * itemHeight
      }
      return new Array(itemCount).fill(0).reduce((pre, _, index) => {
        return pre + itemHeightMap[index]
      }, 0)
    } else {
      const rowHeights = getFullRowHeights()
      const maxValueIndex = findIndexOfMaxValue(rowHeights, 0)

      return rowHeights[maxValueIndex]
    }
  }, [itemCount, itemHeight, itemHeightMap, column, getFullRowHeights])

  const computeRenderData = () => {
    const arr = []

    // TODO: 这里可以优化，无需重复计算
    const rowHeights: number[] = []
    for (let i = 0; i < itemCount; i++) {
      if (!column || column === 1) {
        const top =
          i === 0
            ? 0
            : new Array(i)
                .fill(0)
                .reduce((pre, _, index) => pre + itemHeightMap[index], 0)

        const height = itemHeightMap[i]
        if (scrollTop > top + height || scrollTop + wrapperHeight < top)
          continue
        const style: CSSProperties = {
          boxSizing: 'border-box',
          position: 'absolute',
          height: `${height}px`,
          top: `${top}px`,
          width: `${widthPerColumn}px`,
        }
        arr.push(renderItem(i, style))
      } else {
        let left = 0,
          top = 0
        const indexOfCurrentRow = i % column

        if (rowHeights.length === column) {
          // 当rowHeights长度和column一样，说明已经不是第一行了，需要动态设置top值
          const leftIndex = findIndexOfMinValue(rowHeights, 0)
          left = leftIndex * widthPerColumn + leftIndex * spaceX
          top = rowHeights[leftIndex]
          rowHeights[leftIndex] =
            rowHeights[leftIndex] + itemHeightMap[i] + spaceY
        } else {
          // 当rowHeights长度和column不一样，说明时第一行，top直接0
          left = indexOfCurrentRow * widthPerColumn + indexOfCurrentRow * spaceX
          top = 0
          rowHeights[i] = itemHeightMap[i] + spaceY
        }

        let isTransition = false
        if (lastColumn.current !== column) {
          isTransition = true
          // setTimeout是为了防止100ms动画都还没加载好就开始滚动，导致下一次执行这个函数时transition=false，动画消失
          setTimeout(() => {
            lastColumn.current = column
          }, 100) // 实测动画时间100ms正正好好，能避免 改变行数执行动画时马上滚动导致动画时长过长而滚动也出现动画
        }

        const style: CSSProperties = {
          transition: isTransition ? 'left 0.1s linear' : '',
          boxSizing: 'border-box',
          position: 'absolute',
          left: `${left}px`,
          top: `${top}px`,
          width: `${widthPerColumn}px`,
          height: `${itemHeightMap[i]}px`,
        }
        // 没在可视区中，下一个
        if (
          top > scrollTop + wrapperHeight ||
          top + itemHeightMap[i] < scrollTop
        )
          continue
        // 在可视区中，推入
        arr.push(renderItem(i, style))
      }
    }

    // 监听是否触底
    listenScrollEnd(rowHeights)

    // 设置虚拟列表
    setRenderData(arr)
  }

  const onScroll = useCallback((e: UIEvent) => {
    const scrollTop = e.currentTarget.scrollTop
    setScrollTop(scrollTop)
  }, [])

  const reset = useCallback(() => {
    setItemHeightMap({})
  }, [])

  // 计算动态的 itemHeight
  const computeItemHeight = () => {
    for (let i = 0; i < itemCount; i++) {
      if (itemHeightMap[i]) continue
      if (typeof itemHeight === 'function') {
        if (itemHeight.constructor.name === 'AsyncFunction') {
          // async标记的函数
          ;(itemHeight(i) as Promise<number>).then((_itemHeight) => {
            console.log('异步计算获得', _itemHeight)
            setItemHeightMap((_itemHeightMap) => ({
              ..._itemHeightMap,
              [i]: _itemHeight,
            }))
          })
        } else {
          const heightRes = itemHeight(i)
          if (heightRes instanceof Promise) {
            ;(itemHeight(i) as Promise<number>).then((_itemHeight) => {
              console.log('异步计算获得', _itemHeight)
              setItemHeightMap((_itemHeightMap) => ({
                ..._itemHeightMap,
                [i]: _itemHeight,
              }))
            })
          }
          console.log('同步计算获得', itemHeight(i))
          setItemHeightMap((_itemHeightMap) => ({
            ..._itemHeightMap,
            [i]: heightRes as number,
          }))
        }
      }
    }
  }

  useEffect(() => {
    if (data.length === 0) {
      reset()
    } else {
      computeItemHeight()
    }
  }, [data, itemHeight, itemCount])

  useEffect(() => {
    computeRenderData()
  }, [
    data,
    wrapperHeight,
    itemHeightMap,
    widthPerColumn,
    itemCount,
    spaceX,
    spaceY,
    scrollTop,
    renderItem,
  ])

  useEffect(() => {
    const adaptHeight = () => {
      if (height) {
        setWrapperHeight(height)
      } else if (adaptiveLayoutRef.current) {
        setWrapperHeight(adaptiveLayoutRef.current.offsetHeight)
      }
    }
    const adaptWidth = () => {
      if (width) {
        setWrapperWidth(width)
      } else if (adaptiveLayoutRef.current) {
        setWrapperWidth(adaptiveLayoutRef.current.offsetWidth)
      }
    }
    const adapt = () => {
      adaptHeight()
      adaptWidth()
    }

    adapt()
    if (!scrollBarWidth.current) {
      scrollBarWidth.current = getScrollBarWidth()
    }

    window.addEventListener('resize', adapt)

    return () => {
      window.removeEventListener('resize', adapt)
    }
  }, [])

  return (
    <>
      <div
        ref={adaptiveLayoutRef}
        style={{
          position: 'relative',
          display: 'flex',
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '100%',
          overflow: 'auto',
        }}
        onScroll={onScroll}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: `${contentHeight}px`,
          }}
        >
          <>{renderData}</>
        </div>
      </div>
    </>
  )
}

export default VirtualList
