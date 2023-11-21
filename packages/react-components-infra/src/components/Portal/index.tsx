import { FC, ReactElement, ReactNode, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'

export interface PortalProps {
  container?: HTMLElement
  children: ReactNode
}

// 存放容器与其portal容器的对应map：一个容器下至多一个portal容器
const containerMap = new Map()
// 当前取出的portal容器
let portalContainer: HTMLElement
let realContainer: HTMLElement

export const Portal: FC<PortalProps> = ({ children, container }): ReactElement => {
  const _container = useMemo(() => container || document.body, [container])

  const initPortalContainer = useCallback(() => {
    // 这里创建两个 div，portalContainer 是外面一层，realContainer 是里边一层
    // 外层设置了 fixed 定位和宽高度来占满屏幕，由于占满了屏幕所以需要 pointerEvents: none 来解决事件无法穿透的问题
    // 由于外层设置了 pointerEvents: none 导致如果挂载在这里，里边的子元素都要手动设置 pointerEvents: auto 来解决事件，这是无法接受的
    // 所以又加了里层，仅设置 pointerEvents: auto 并将子元素挂载到这里来解决上面的问题（没有设置定位，因为这样挂载到内的子元素可以以 portalContainer 进行定位）
    // 总结：外层铺满来让里边能定位，里层加 pointerEvents:auto 避免手动解决外层导致的事件穿透问题
    portalContainer = document.createElement('div')
    realContainer = document.createElement('div')
    realContainer.style.pointerEvents = 'auto'
    portalContainer.appendChild(realContainer)
    portalContainer.style.position = 'absolute'
    portalContainer.style.zIndex = '999' // 999 是目前多次实践得出的最佳层级，比antd的弹出层低
    portalContainer.style.top = '0'
    portalContainer.style.left = '0'
    portalContainer.style.width = '100%'
    portalContainer.style.height = '100%'
    portalContainer.style.pointerEvents = 'none'
  }, [])

  if (!containerMap.has(_container)) {
    initPortalContainer()
    containerMap.set(_container, portalContainer)
    _container.appendChild(portalContainer) // 所及之处都会留下一个portal容器
  } else {
    portalContainer = containerMap.get(_container)
  }
  return createPortal(children as ReactNode, realContainer)
}
