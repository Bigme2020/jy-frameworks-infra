import React, { ReactNode, cloneElement, forwardRef, useContext, useImperativeHandle, useMemo, useRef } from 'react'
import { ReferenceType, useMergeRefs } from '@floating-ui/react'
import { TooltipContext } from '.'

interface TooltipTriggerProps {
  children: ReactNode
}

interface RealTriggerProps {
  refs: ((node: ReferenceType | null) => void)[]
  children: ReactNode
  props: any
}

const RealTrigger = forwardRef<HTMLElement, RealTriggerProps>(({ refs, props, children }, ref) => {
  const refForUser = useRef<HTMLElement | null>(null)

  useImperativeHandle(ref, () => refForUser.current as any)

  const triggerRef = useMergeRefs(refs)

  return cloneElement(children as any, {
    ref: (instance: any) => {
      triggerRef && triggerRef(instance)
      refForUser.current = instance
    },
    ...props,
  })
})

export const TooltipTrigger = forwardRef<HTMLDivElement, TooltipTriggerProps>(({ children }, ref) => {
  const { getReferencePropsMap, referencesMap } = useContext(TooltipContext)

  const props = useMemo(
    () =>
      Object.keys(getReferencePropsMap).reduce((pre, curKey) => {
        const getReferenceProps = getReferencePropsMap[curKey]
        if (pre) {
          return getReferenceProps(pre)
        }
        return getReferenceProps()
      }, {}),
    [getReferencePropsMap]
  )

  const mergeSetReferences = useMemo(() => Object.values(referencesMap), [referencesMap])

  // 这里这么写是因为 useMergeRefs 不支持改变，它内部会监听和比较这次和上次渲染的值，如果不一样会报错
  // referencesMap 是 tooltipContent useEffect 时一个个推进去的，但是因为 react 的 batch setState 批量更新，这里的长度要么是 0，要么就是不会改变的值
  if (mergeSetReferences.length === 0) return cloneElement(children as any, { ref })
  return (
    <RealTrigger refs={mergeSetReferences} props={props} ref={ref}>
      {children}
    </RealTrigger>
  )
})
