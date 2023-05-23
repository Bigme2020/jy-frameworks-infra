import React, {
  FC,
  ReactElement,
  useState,
  useMemo,
  UIEvent,
  useCallback,
  CSSProperties,
} from 'react'

export interface VirtualListProps {
  height: number
  itemSize: number
  data: Array<any>
  renderItem?: (
    index: number,
    style: CSSProperties
  ) => ReactElement | HTMLElement
}

// FIXME: 用绝对定位时正常，关闭绝对定位并开启paddingTop后出现问题
const VirtualList: FC<VirtualListProps> = ({
  height,
  itemSize,
  renderItem,
  data,
}): ReactElement => {
  const [startIndex, setStartIndex] = useState(0)

  const itemCount = useMemo(() => data.length, [data])
  const contentHeight = useMemo(
    () => itemCount * itemSize,
    [itemCount, itemSize]
  )
  const endIndex = useMemo(() => startIndex + height / itemSize, [startIndex])
  const top = useMemo(() => startIndex * itemSize, [startIndex, itemSize])

  const renderData = useCallback(() => {
    const arr = []
    for (let i = startIndex; i < endIndex; i++) {
      const style = {
        position: 'absolute',
        height: `${itemSize}px`,
        top: `${itemSize * i}px`,
      }
      if (typeof renderItem === 'function') {
        arr.push(renderItem(i, style as CSSProperties))
      } else {
        arr.push(
          <div style={style as CSSProperties}>
            {i}-{data[i]}
          </div>
        )
      }
    }
    return arr
  }, [data, startIndex, endIndex, renderItem])

  const onScroll = (e: UIEvent) => {
    const scrollTop = e.currentTarget.scrollTop
    setStartIndex(Math.floor(scrollTop / itemSize))
  }

  return (
    <div
      style={{ height, overflow: 'auto', position: 'relative' }}
      onScroll={onScroll}
    >
      <div style={{ height: contentHeight }}>
        <>
          <div style={{ height: top }} />
          {renderData()}
        </>
      </div>
    </div>
  )
}

export default VirtualList
