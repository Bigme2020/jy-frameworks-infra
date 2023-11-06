import React, {
  FC,
  ReactElement,
  ReactNode,
  createContext,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react'

import { UseFloatingOptions, ReferenceType } from '@floating-ui/react'

import { TriggerAction, TriggerActionOption } from './types'
import { useTooltipFloating } from './hooks'

type ContextType = ReturnType<typeof useTooltipFloating> & {
  triggerActionOptions?: TriggerActionOption[]
  currentTrigger: TriggerAction
  setCurrentTrigger: React.Dispatch<React.SetStateAction<TriggerAction>>
  resetCurrentTrigger: () => void
  registerdContent: string[]
  setRegisterdContent: React.Dispatch<React.SetStateAction<string[]>>
  setUseFloatingOptions: React.Dispatch<
    React.SetStateAction<Partial<UseFloatingOptions<ReferenceType>>>
  >
}

type TooltipProps = {
  triggerActionOptions?: TriggerActionOption[]
  children?: ReactNode
  floatingOptions?: Partial<UseFloatingOptions<ReferenceType>>
}

export const TooltipContext = createContext<ContextType | null>(null)

/**
 * 在原来 useFloating 设置的基础上，增加了如下设置
 *
 * 支持 trigger 和 content 一对一、一对多，不支持多对多
 *
 * @param triggerActionOptions 支持的 trigger 事件配置数组，可填写 click,hover,focus 字符 或 类似这样的对象 { action: 'click', options?: { stopPropagation?: boolean } }
 * @param floatingOptions 全局配置，若每个 tooltip 有自己的配置，这里的全局配置会被替换而非合并
 */
export const Tooltip: FC<TooltipProps> = memo(
  ({
    triggerActionOptions = ['click'],
    children,
    floatingOptions,
  }): ReactElement => {
    const [useFloatingOptions, setUseFloatingOptions] = useState<
      Partial<UseFloatingOptions<ReferenceType>>
    >(floatingOptions || {})
    const [currentTrigger, setCurrentTrigger] = useState<TriggerAction>('hover')

    const resetCurrentTrigger = useCallback(() => {
      setCurrentTrigger('hover')
    }, [triggerActionOptions])
    const [registerdContent, setRegisterdContent] = useState<string[]>([])

    const normalizedTriggerActions: TriggerAction[] = useMemo(
      () =>
        triggerActionOptions.map((actionOption) => {
          if (typeof actionOption === 'string') {
            return actionOption as TriggerAction
          } else {
            return actionOption.action
          }
        }),
      [triggerActionOptions]
    )

    const useTooltipFloatingData = useTooltipFloating({
      ...useFloatingOptions,
      triggerActions: normalizedTriggerActions,
      triggerActionOptions: triggerActionOptions as any,
      currentTrigger,
      resetCurrentTrigger,
      registerdContent,
    })

    const providerValue = {
      // 自定义值
      currentTrigger,
      setCurrentTrigger,
      resetCurrentTrigger,
      registerdContent,
      setRegisterdContent,
      triggerActionOptions: triggerActionOptions as TriggerActionOption[],
      setUseFloatingOptions,
      // useTooltip 返回的值
      ...useTooltipFloatingData,
    }

    return (
      <TooltipContext.Provider value={providerValue}>
        {children}
      </TooltipContext.Provider>
    )
  }
)

export * from './TooltipContent'
export * from './TooltipTrigger'
