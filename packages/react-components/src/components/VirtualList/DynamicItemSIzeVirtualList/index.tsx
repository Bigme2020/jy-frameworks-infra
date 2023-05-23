// import React, {
//   FC,
//   ReactElement,
//   useState,
//   useMemo,
//   UIEvent,
//   useCallback,
//   CSSProperties,
//   useRef,
// } from 'react'
// import { DynamicItemSize } from '../types'

// export interface VirtualListProps {
//   height: number
//   itemSize: number | DynamicItemSize
//   data: Array<any>
//   renderItem?: (
//     index: number,
//     style: CSSProperties
//   ) => ReactElement | HTMLElement
// }

// // FIXME: 用绝对定位时正常，关闭绝对定位并开启paddingTop后出现问题
// const VirtualList: FC<VirtualListProps> = ({
//   height,
//   itemSize,
//   renderItem,
//   data,
// }): ReactElement => {
//   const isDynamicItemSize = typeof itemSize === 'function'
//   const [startIndex, setStartIndex] = useState(0)

//   const { current: dynamicItemSizeCache } = useRef<number[]>([])

//   const itemCount = useMemo(() => data.length, [data])
//   const contentHeight = useMemo(async () => {
//     if (isDynamicItemSize) {
//       let _contentHeight = 0
//       // 可能是异步获取的高度，所以要用到promise
//       const itemSizePromises = []
//       for (let i = 0; i < itemCount; i++) {
//         itemSizePromises.push(itemSize(i))
//       }
//       const itemSizeResults = await Promise.allSettled(itemSizePromises)
//       itemSizeResults.forEach((itemSizeResult) => {
//         if (itemSizeResult.status === 'fulfilled') {
//           dynamicItemSizeCache.push(itemSizeResult.value)
//           _contentHeight += itemSizeResult.value
//         } else {
//           dynamicItemSizeCache.push(0) // 0作为默认height
//         }
//       })
//       return _contentHeight
//     } else {
//       return itemCount * itemSize
//     }
//   }, [data, itemSize, isDynamicItemSize])
//   const endIndex = useMemo(() => startIndex + height / itemSize, [startIndex])
//   const top = useMemo(() => startIndex * itemSize, [startIndex, itemSize])

//   const renderData = useCallback(() => {
//     const arr = []
//     for (let i = startIndex; i < endIndex; i++) {
//       const style = {
//         position: 'absolute',
//         height: `${itemSize}px`,
//         top: `${itemSize * i}px`,
//       }
//       if (typeof renderItem === 'function') {
//         arr.push(renderItem(i, style as CSSProperties))
//       } else {
//         arr.push(
//           <div style={style as CSSProperties}>
//             {i}-{data[i]}
//           </div>
//         )
//       }
//     }
//     return arr
//   }, [data, startIndex, endIndex, renderItem])

//   const onScroll = (e: UIEvent) => {
//     const scrollTop = e.currentTarget.scrollTop
//     setStartIndex(Math.floor(scrollTop / itemSize))
//   }

//   return (
//     <div
//       style={{ height, overflow: 'auto', position: 'relative' }}
//       onScroll={onScroll}
//     >
//       <div style={{ height: contentHeight }}>
//         <>
//           <div style={{ height: top }} />
//           {renderData()}
//         </>
//       </div>
//     </div>
//   )
// }

// export default VirtualList
