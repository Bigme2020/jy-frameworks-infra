import React, {
  CSSProperties,
  FC,
  ForwardRefExoticComponent,
  ReactNode,
  cloneElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  FloatingContext,
  ReferenceType,
  UseDismissProps,
  UseFloatingOptions,
  autoUpdate,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react'
import { Transition } from 'react-transition-group'

import { Portal } from '../Portal'
import { TransitionState, TriggerAction, TriggerActionOption } from './types'
import { getTrasitionStyle } from './utils/getTransitionStyle'
import { TooltipContext } from '.'

interface ChildProps {
  context: FloatingContext
  style: CSSProperties
  ref: any
  manualClose: () => void
}

interface TooltipContentProps extends Partial<UseFloatingOptions<ReferenceType>> {
  id: string | number
  children: ForwardRefExoticComponent<any> | ReactNode | ((props: ChildProps) => any)
  triggerActionOption: TriggerActionOption
  transitionMap?: Record<TransitionState, CSSProperties>
  enableDismiss?: boolean
  dissmissProps?: UseDismissProps
}

export const TooltipContent: FC<TooltipContentProps> = ({
  id,
  children,
  transitionMap,
  triggerActionOption,
  enableDismiss = true,
  dissmissProps,
  ...floatingOptions
}) => {
  const { setGetReferencePropsMap, setReferencesMap } = useContext(TooltipContext)
  const [open, setOpen] = useState(false)

  const normalizedTriggerAction = useMemo(() => {
    if (typeof triggerActionOption === 'string') {
      return triggerActionOption as TriggerAction
    } else {
      return triggerActionOption.action
    }
  }, [triggerActionOption])

  const hoverProps = useMemo(() => {
    const isAdvancedConfig = typeof triggerActionOption === 'object'
    if (isAdvancedConfig) {
      const isHover = triggerActionOption.action === 'hover'
      if (isHover) {
        return triggerActionOption.options
      } else {
        return {}
      }
    } else {
      return {}
    }
  }, [triggerActionOption])
  const clickProps = useMemo(() => {
    const isAdvancedConfig = typeof triggerActionOption === 'object'
    if (isAdvancedConfig) {
      const isHover = triggerActionOption.action === 'click'
      if (isHover) {
        return triggerActionOption.options
      } else {
        return {}
      }
    } else {
      return {}
    }
  }, [triggerActionOption])

  const manualClose = useCallback(() => setOpen(false), [])

  const { context, refs, floatingStyles } = useFloating({
    ...floatingOptions,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
  })

  const dismiss = useDismiss(context, {
    enabled: enableDismiss,
    ...dissmissProps,
  })
  const hover = useHover(context, {
    enabled: normalizedTriggerAction === 'hover',
    ...hoverProps,
  })
  const click = useClick(context, {
    enabled: normalizedTriggerAction === 'click',
    ...clickProps,
  })

  const { getFloatingProps, getReferenceProps } = useInteractions([hover, click, dismiss])

  useEffect(() => {
    setGetReferencePropsMap((map) => ({
      ...map,
      [id]: getReferenceProps,
    }))
  }, [getReferenceProps, id])

  useEffect(() => {
    setReferencesMap((map) => ({
      ...map,
      [id]: refs.setReference,
    }))
  }, [refs, id])

  return (
    <Portal>
      <Transition in={context.open} nodeRef={refs.floating} timeout={300}>
        {(state) => {
          return typeof children === 'function'
            ? children({
                context,
                style: {
                  ...floatingStyles,
                  ...getTrasitionStyle(state as TransitionState, transitionMap),
                },
                ref: refs.setFloating,
                manualClose,
              })
            : cloneElement(children as any, {
                ...getFloatingProps({
                  style: {
                    ...floatingStyles,
                    ...getTrasitionStyle(state as TransitionState, transitionMap),
                  },
                  ref: refs.setFloating,
                }),
              })
        }}
      </Transition>
    </Portal>
  )
}
