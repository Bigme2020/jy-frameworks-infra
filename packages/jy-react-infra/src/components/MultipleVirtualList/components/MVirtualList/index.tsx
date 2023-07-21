/* eslint-disable react/jsx-no-useless-fragment */
import React, {
  FC,
  ReactElement,
  useState,
  useMemo,
  CSSProperties,
  Ref,
  useEffect,
  useRef,
  RefObject,
} from 'react'
import { Waypoint } from 'react-waypoint'

export type MVirtualListProps = {
  outerHeight: number
  scrollTop: number
  itemSize: number
  dataLength: number
  renderGap: number
  boundary: number
  renderPrefix?: (
    ref?: RefObject<HTMLElement>
  ) => ReactElement | HTMLElement | null
  renderSuffix?: (
    ref?: RefObject<HTMLElement>
  ) => ReactElement | HTMLElement | null
  onBottom?: (index?: number) => void
  onLeave?: () => void
  renderItem?: (
    index: number,
    style: CSSProperties
  ) => ReactElement | HTMLElement
}

const MVirtualList: FC<MVirtualListProps> = ({
  outerHeight,
  scrollTop,
  itemSize,
  dataLength,
  renderGap,
  boundary,
  renderPrefix,
  renderSuffix,
  onBottom,
  onLeave,
  renderItem,
}): ReactElement => {
  const listRef = useRef<HTMLElement>(null)
  const prefixRef = useRef<HTMLElement>(null)
  const suffixRef = useRef<HTMLElement>(null)

  const [offsetTop, setOffsetTop] = useState<number>(
    outerHeight + itemSize + renderGap
  ) // 初始值先让所有子列表都远离主视口 避免闪烁

  const currentListScrollTop = useMemo(
    () => scrollTop - offsetTop,
    [scrollTop, offsetTop]
  )

  const startIndex = useMemo(() => {
    if (dataLength === 0) return 0
    if (currentListScrollTop <= 0) {
      return 0
    }
    const _startIndex = Math.floor(
      currentListScrollTop / (itemSize + renderGap)
    )
    return _startIndex - boundary < 0 ? 0 : _startIndex - boundary
  }, [currentListScrollTop, renderGap, boundary, dataLength])

  const endIndex = useMemo(() => {
    const _endIndex =
      currentListScrollTop < 0
        ? Math.ceil(
            (outerHeight - Math.abs(currentListScrollTop)) /
              (itemSize + renderGap)
          )
        : Math.ceil(
            (outerHeight + currentListScrollTop) / (itemSize + renderGap)
          )
    if (dataLength === 0) return 0
    if (currentListScrollTop < 0) {
      if (Math.abs(currentListScrollTop) > outerHeight) return 0
      return _endIndex + boundary
    }

    return _endIndex + boundary > dataLength ? dataLength : _endIndex + boundary
  }, [currentListScrollTop, startIndex, boundary, dataLength])

  const paddingTop = useMemo(
    () =>
      dataLength * itemSize + (renderGap ? (dataLength - 1) * renderGap : 0),
    [dataLength, itemSize, renderGap, boundary]
  )

  useEffect(() => {
    setOffsetTop(listRef.current?.offsetTop || 0) // offsetTop不论何时都要更新
  })

  const renderData = () => {
    // TIP: 外面传入的renderItem需要传key，不然每次都会重新渲染
    const arr = []
    for (let i = startIndex; i < endIndex; i++) {
      const style = {
        position: 'absolute',
        top: `${itemSize * i + renderGap * i}px`,
        height: `${itemSize}px`,
      }
      arr.push(
        typeof renderItem === 'function'
          ? renderItem(i, style as CSSProperties)
          : null
      )
    }
    return arr
  }

  return (
    <div>
      <>
        {renderPrefix ? renderPrefix(prefixRef) : null}
        <div
          style={{ position: 'relative', height: `${paddingTop}px` }}
          ref={listRef as Ref<any>}
        >
          <>{renderData()}</>
        </div>
        {renderSuffix ? renderSuffix(suffixRef) : null}
        <Waypoint
          onEnter={({ previousPosition }) => {
            if (previousPosition && typeof onBottom === 'function') onBottom()
          }}
          onLeave={({ previousPosition }) => {
            if (previousPosition && typeof onLeave === 'function') onLeave()
          }}
        />
      </>
    </div>
  )
}

export default MVirtualList
