import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  useFloating,
  autoUpdate,
  useInteractions,
  useHover,
  useClick,
  useDismiss,
} from '@floating-ui/react'
import type { UseFloatingOptions, ReferenceType } from '@floating-ui/react'

import {
  TriggerAction,
  TriggerActionObjectOption,
  TriggerActionOption,
} from '../types'

type useTooltipFloatingProps = {
  triggerActions?: TriggerAction[]
  triggerActionOptions?: TriggerActionOption[]
  currentTrigger: TriggerAction
  resetCurrentTrigger: () => void
  registerdContent: string[]
} & Partial<UseFloatingOptions<ReferenceType>>

export const useTooltipFloating = ({
  triggerActions,
  triggerActionOptions,
  currentTrigger,
  resetCurrentTrigger,
  registerdContent,
  ...options
}: useTooltipFloatingProps) => {
  const [open, setIsOpen] = useState(false)

  /** 对外提供的手动关闭 */
  const isManualClosing = useRef(false)
  const manualClose = useCallback(() => {
    isManualClosing.current = true
    setIsOpen(false)
  }, [])

  // 由于这个组件的 reference 一对多 tooltip 的实现是通过判断当前 reference 触发的事件
  // 所以会遇到 hover 和 click 的事件冲突问题，详情见下方 useClick 的 ignoreMouse 设置解释
  // 1.
  const onOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        resetCurrentTrigger()
      }
      setIsOpen(isOpen)
    },
    [resetCurrentTrigger]
  )
  // 2.
  useEffect(() => {
    if (currentTrigger === 'click' && !open && !isManualClosing.current) {
      setIsOpen(true)
    }
    isManualClosing.current = false
  }, [currentTrigger, open])

  const data = useFloating({
    open,
    onOpenChange,
    whileElementsMounted: autoUpdate,
    ...options,
  })

  const getProps = useCallback(
    (action: TriggerAction) => {
      if (triggerActionOptions) {
        const normalized = triggerActionOptions.filter(
          (i) => typeof i === 'object'
        ) as TriggerActionObjectOption[]
        const finded = normalized.find((i) => i.action === action)
        if (finded) {
          return finded.options.props || {}
        }
      }
      return {}
    },
    [triggerActionOptions]
  )

  const hoverProps = getProps('hover')
  const hover = useHover(data.context, {
    enabled: triggerActions ? triggerActions.includes('hover') : false,
    move: false,
    ...hoverProps,
  })
  // useClick 的 ignoreMouse 开启后对 reference 进行 hover 并 click 不会触发关闭，会在 mouseleave 而不是 click 时触发关闭 tooltip
  // 关闭后 hover 时会打开，再次 click 会触发关闭，再 click 会打开，然后再 click 会触发关闭
  // 最佳实践：一对一绑定 tooltip 时开启，一对多时关闭(并利用 currentTrigger 和 setIsOpen 的判断处理多余点击问题，详情见上方)
  const clickProps = getProps('click')
  const click = useClick(data.context, {
    enabled: triggerActions ? triggerActions.includes('click') : false,
    ignoreMouse: !(registerdContent.length > 1),
    ...clickProps,
  })
  const dimiss = useDismiss(data.context)

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
    dimiss,
  ])

  const providerValue = useMemo(
    () => ({
      ...data,
      getReferenceProps,
      getFloatingProps,
      manualClose,
    }),
    [data, getReferenceProps, getFloatingProps, manualClose]
  )

  return providerValue
}
