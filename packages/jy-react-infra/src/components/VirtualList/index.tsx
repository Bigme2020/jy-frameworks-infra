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
  parsePadding,
} from './utils'
import { useThrottle } from '../../hooks'

interface WaterfallProps {
  data: Array<any>
  itemHeight:
    | number
    | ((index: number) => number)
    | ((index: number) => Promise<number>)
  width?: number
  height?: number
  column?: number
  spaceX?: number
  spaceY?: number
  endOffset?: number
  padding?: string
  unit?: string
  renderItem: (index: number, style: CSSProperties) => ReactNode
  onEnd?: () => void
}

/**
 * @param data 必填 列表
 * @param itemHeight 必填 支持同步和异步
 * @param padding 可选 默认0
 * @param column 可选 默认1
 * @param width 可选 默认撑满父容器宽度
 * @param height 可选 默认撑满父容器高度
 * @param spaceX 可选 默认20 横坐标 物体之间的 间隔
 * @param spaceY 可选 默认20 纵坐标 物体之间的 间隔
 * @param endOffset 可选 默认150 触发 onEnd 时的 向上偏移量
 * @param padding 可选 内边距 注意！计量单位必须和unit相同！若计量单位不为px，则需要手动设置unit参数！
 * @param unit 可选 默认px
 * @param renderItem 必填 回调中的 style 必须设置到 item 上
 * @param onEnd 可选 触底事件
 */
export const Waterfall: FC<WaterfallProps> = ({
  data,
  width,
  height,
  itemHeight,
  column,
  spaceX = 20,
  spaceY = 20,
  endOffset = 150,
  padding = '',
  unit = 'px',
  renderItem,
  onEnd,
}): ReactElement => {
  // 自带容器滚动高度
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

  // padding解析
  const paddingInfo = useMemo(
    () => parsePadding(padding, unit),
    [padding, unit]
  )

  // lastColumn 用来记录上次的column，来监听column是否变化
  const lastColumn = useRef(column)

  const scrollBarWidth = useRef(0)

  const widthPerColumn = useMemo(
    () =>
      column
        ? (wrapperWidth -
            paddingInfo.paddingLeft -
            paddingInfo.paddingRight -
            (column - 1) * spaceX -
            scrollBarWidth.current) /
          column
        : wrapperWidth - paddingInfo.paddingLeft - paddingInfo.paddingRight,
    [wrapperWidth, column, spaceX, scrollBarWidth.current, paddingInfo]
  )

  // 用于实现 width,height 未传时，组件自身的宽高自适应
  const adaptiveLayoutRef = useRef<HTMLDivElement>(null)

  const itemCount = useMemo(() => data.length, [data])

  const getFullRowHeights = useCallback(() => {
    const rowHeights: number[] = []
    for (let i = 0; i < itemCount; i++) {
      if (rowHeights.length !== column) {
        // 长度不相等时说明数组刚刚初始化出来，先赋值个0
        rowHeights[i] = 0
        rowHeights[i] = itemHeightMap[i] + spaceY
      } else {
        const leftIndex = findIndexOfMinValue(rowHeights, 0)
        if (leftIndex === -1) return []
        rowHeights[leftIndex] =
          Number(rowHeights[leftIndex]) + Number(itemHeightMap[i]) + spaceY
      }
    }
    // spaceY是两元素间的距离，上面没有记录行数虽然方便了计算但是会导致最后多算一行spaceY，需要在最后的结果中减掉
    return rowHeights.map((h) => h - spaceY)
  }, [column, itemCount, itemHeightMap, spaceY])

  const listenScrollEnd = useThrottle((rowHeights: number[]) => {
    const minHeightIndex = findIndexOfMinValue(rowHeights, 0)
    const minHeight = rowHeights[minHeightIndex]

    if (
      scrollTop + wrapperHeight + endOffset >= Number(minHeight) &&
      typeof onEnd === 'function'
    ) {
      onEnd()
    }
  }, 25)

  // 内容高度
  const contentHeight = useMemo<number>(() => {
    if (!column || column === 1) {
      if (typeof itemHeight === 'number') {
        return itemCount * itemHeight
      }
      return new Array(itemCount).fill(0).reduce((pre, _, index) => {
        return pre +
          itemHeightMap[index] +
          (index === 0 || index === itemCount - 1)
          ? 0
          : spaceY
      }, 0)
    } else {
      const rowHeights = getFullRowHeights()
      const maxValueIndex = findIndexOfMaxValue(rowHeights, 0)

      return rowHeights[maxValueIndex]
    }
  }, [
    itemCount,
    itemHeight,
    itemHeightMap,
    column,
    spaceY,
    getFullRowHeights,
    paddingInfo,
  ])

  const computeRenderData = () => {
    const arr = []

    // TODO: 这里可以优化，无需重复计算？
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
          height: `${height}${unit}`,
          top: `${top}${unit}`,
          width: `${widthPerColumn}${unit}`,
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
          top = Number(rowHeights[leftIndex])
          rowHeights[leftIndex] =
            Number(rowHeights[leftIndex]) + Number(itemHeightMap[i]) + spaceY
        } else {
          // 当rowHeights长度和column不一样，说明时第一行，top直接0
          left = indexOfCurrentRow * widthPerColumn + indexOfCurrentRow * spaceX
          top = 0
          rowHeights[i] = Number(itemHeightMap[i]) + spaceY
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
          left: `${left}${unit}`,
          top: `${top}${unit}`,
          width: `${widthPerColumn}${unit}`,
          height: `${itemHeightMap[i]}${unit}`,
        }
        // 没在可视区中，下一个
        if (
          top > scrollTop + wrapperHeight ||
          top + Number(itemHeightMap[i]) < scrollTop
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

  // 计算每个元素的 itemHeight
  const computeItemHeight = () => {
    for (let i = 0; i < itemCount; i++) {
      // 由于目前没有碰到 元素中途高度变更的情况，所以这里做了元素的高度缓存（即已渲染出来过的元素，其高度不会再次计算），避免重复计算
      if (itemHeightMap[i]) continue
      if (typeof itemHeight === 'function') {
        if (itemHeight.constructor.name === 'AsyncFunction') {
          // async标记的函数: async () => {}
          ;(itemHeight(i) as Promise<number>).then((_itemHeight) => {
            setItemHeightMap((_itemHeightMap) => ({
              ..._itemHeightMap,
              [i]: _itemHeight,
            }))
          })
        } else {
          const heightRes = itemHeight(i)
          // 返回promise的函数
          if (heightRes instanceof Promise) {
            ;(itemHeight(i) as Promise<number>).then((_itemHeight) => {
              setItemHeightMap((_itemHeightMap) => ({
                ..._itemHeightMap,
                [i]: _itemHeight,
              }))
            })
          }
          // 返回number类型的函数
          setItemHeightMap((_itemHeightMap) => ({
            ..._itemHeightMap,
            [i]: heightRes as number,
          }))
        }
      } else {
        // number类型
        setItemHeightMap((_itemHeightMap) => ({
          ..._itemHeightMap,
          [i]: itemHeight as number,
        }))
      }
    }
  }

  // 计算每个元素的高度
  useEffect(() => {
    if (data.length === 0) {
      reset()
    } else {
      computeItemHeight()
    }
  }, [data, itemHeight, itemCount])

  // 排列渲染触发
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

  // 初始化设置 (包含了 宽高计算 以及 scrollbar 宽度测量)
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
          boxSizing: 'border-box',
          position: 'relative',
          display: 'flex',
          width: width ? `${width}${unit}` : '100%',
          height: height ? `${height}${unit}` : '100%',
          overflow: 'auto',
          padding,
        }}
        onScroll={onScroll}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: `${contentHeight}${unit}`,
          }}
        >
          <>{renderData}</>
        </div>
      </div>
    </>
  )
}
