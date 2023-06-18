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
} from 'react'
import { findIndexOfMinValue } from '../../utils'

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
  renderItem: (
    index: number,
    style: CSSProperties
  ) => ReactElement | HTMLElement
}

// FIXME: 用绝对定位时正常，关闭绝对定位并开启paddingTop后出现问题
const VirtualList: FC<VirtualListProps> = ({
  width,
  height,
  itemHeight,
  column,
  spaceX = 20,
  spaceY = 20,
  renderItem,
  data,
}): ReactElement => {
  const [scrollTop, setScrollTop] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [wrapperHeight, setWrapperHeight] = useState(0)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const [styleData, setStyleData] = useState<CSSProperties[]>([])
  const [itemHeightMap, setItemHeightMap] = useState<
    Record<string | number, number>
  >({})

  const rowHeights = useRef<number[]>([])
  const recordedRow = useRef<number>(-1)

  const widthPerColumn = useMemo(
    () => (column ? wrapperWidth / column : wrapperWidth),
    [wrapperWidth, column]
  )

  // 用于实现 width,height 未传时，组件自身的宽高自适应
  const adaptiveLayoutRef = useRef<HTMLDivElement>(null)

  const itemCount = useMemo(() => data.length, [data])

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
      const rows = Math.ceil(itemCount / column)
      if (typeof itemHeight === 'number') {
        return rows * itemHeight
      }
      let _contentHeight = 0
      for (let i = 0; i < itemCount; i += column) {
        let maxHeightOfRow = 0
        for (let j = i; j < i + column - 1; j++) {
          maxHeightOfRow = Math.max(
            itemHeightMap[j] || 0,
            itemHeightMap[j + 1] || 0
          )
        }
        _contentHeight += maxHeightOfRow
      }
      return _contentHeight
    }
  }, [itemCount, itemHeight, itemHeightMap, column])
  const endIndex = useMemo(
    () => startIndex + wrapperHeight / itemHeight,
    [startIndex, wrapperHeight]
  )

  const computeStyleData = useCallback(async () => {
    const arr = []

    // for (let i = startIndex; i < endIndex; i++) {

    //   const style = {
    //     position: 'absolute',
    //     height: `${itemHeight}px`,
    //     top: `${itemHeight * i}px`,
    //   }
    //   arr.push(renderItem(i, style as CSSProperties))
    // }
    // return arr
    for (let i = 0; i < itemCount; i++) {
      if (!column || column === 1) {
        const top =
          i === 0
            ? 0
            : new Array(i)
                .fill(0)
                .reduce((pre, _, index) => pre + itemHeightMap[index], 0)
        const height = itemHeightMap[i]
        if (scrollTop > top + height || scrollTop + contentHeight < top) {
          continue
        }
        const style = {
          position: 'absolute',
          height: `${height}px`,
          top: `${top}px`,
        }
        arr.push(style)
      } else {
        const currentRow = Math.floor(i / column)
        const indexOfCurrentRow = i % column

        // TODO: ...
        // if(scrollTop) {}
        let left = 0,
          top = 0
        if (rowHeights.current.length === column) {
          const leftIndex = findIndexOfMinValue(
            rowHeights.current,
            indexOfCurrentRow
          )
          left = leftIndex * widthPerColumn - leftIndex * spaceX
          top = rowHeights.current[leftIndex]
        } else {
          left = indexOfCurrentRow * widthPerColumn - indexOfCurrentRow * spaceX
          top = 0
        }
        // TODO: continue
        const style = {
          position: 'absolute',
          left: `${left}px`,
          top: `${top}px`,
        }
        if (currentRow >= recordedRow.current) {
          recordedRow.current = currentRow
          // 记录当前行每个元素的高度对应的横轴索引
          if (rowHeights.current.length === column) {
            const leftIndex = findIndexOfMinValue(
              rowHeights.current,
              indexOfCurrentRow
            )
            const itemHeight = itemHeightMap[i]
            rowHeights.current[leftIndex] =
              rowHeights.current[leftIndex] + itemHeight
          } else {
            rowHeights.current[i] = itemHeightMap[i] + spaceY
          }
        }
        arr.push()
      }
    }

    setStyleData(arr)
  }, [
    data,
    contentHeight,
    itemHeightMap,
    widthPerColumn,
    itemCount,
    startIndex,
    endIndex,
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

    window.addEventListener('resize', adapt)

    return () => {
      window.removeEventListener('resize', adapt)
    }
  }, [])

  const onScroll = useCallback((e: UIEvent) => {
    const scrollTop = e.currentTarget.scrollTop
    setStartIndex(Math.floor(scrollTop / itemHeight))
    setScrollTop(scrollTop)
  }, [])

  const renderData = useCallback(
    () => styleData.map((style, index) => renderItem(index, style)),
    [styleData, renderItem]
  )

  const reset = () => {
    console.log('reset')
    setItemHeightMap({})
  }

  useEffect(() => {
    // 计算动态的 itemHeight
    for (let i = 0; i < itemCount; i++) {
      if (itemHeightMap[i]) continue
      if (typeof itemHeight === 'function') {
        if (itemHeight.constructor.name === 'AsyncFunction') {
          ;(itemHeight(i) as Promise<number>).then((_itemHeight) => {
            setItemHeightMap({
              ...itemHeightMap,
              [i]: _itemHeight,
            })
          })
        } else {
          setItemHeightMap({
            ...itemHeightMap,
            [i]: itemHeight(i) as number,
          })
        }
      }
    }
  }, [data, itemHeight, itemCount])

  useEffect(() => {
    computeStyleData()
  }, [computeStyleData])

  useEffect(() => {
    if (data.length === 0) {
      reset()
    }
  }, [data])

  return (
    <>
      <div
        style={{
          display: 'flex',
          width: `${wrapperWidth}px`,
          height: `${wrapperHeight}px`,
          overflow: 'auto',
        }}
        onScroll={onScroll}
      >
        <div style={{ position: 'relative', height: `${contentHeight}px` }}>
          <>{renderData()}</>
        </div>
      </div>
      {!height || !width ? (
        <div
          ref={adaptiveLayoutRef}
          style={{ width: '100%', height: '100%' }}
        />
      ) : null}
    </>
  )
}

export default VirtualList
