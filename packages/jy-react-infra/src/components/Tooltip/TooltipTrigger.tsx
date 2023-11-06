import {
  ForwardRefExoticComponent,
  MutableRefObject,
  ReactElement,
  ReactNode,
  cloneElement,
  forwardRef,
  useImperativeHandle,
} from 'react'

import { useTooltipContext } from './hooks/useTooltipContext'
import { TriggerAction } from './types'
import { ReferenceType } from '@floating-ui/react'

interface TooltipTriggerProps {
  children: ForwardRefExoticComponent<any> | ReactNode
  ref: MutableRefObject<ReferenceType>
}

export const TooltipTrigger = forwardRef<ReferenceType, TooltipTriggerProps>(
  ({ children }, ref): ReactElement => {
    const { refs, triggerActionOptions, getReferenceProps, setCurrentTrigger } =
      useTooltipContext()

    const isStopPropagation = (triggerActionType: TriggerAction) => {
      if (triggerActionOptions) {
        for (let option of triggerActionOptions) {
          if (typeof option === 'string' && option === triggerActionType)
            return false
          if (
            typeof option === 'object' &&
            option.action === triggerActionType &&
            option.options.stopPropagation
          )
            return true
        }
        return false
      }
      return false
    }

    useImperativeHandle(ref, () => refs.reference.current as any)

    return cloneElement(children as any, {
      ...getReferenceProps({
        ref: refs.setReference,
        onClick(e) {
          if (isStopPropagation('click')) {
            e.stopPropagation()
          }
          if (typeof getReferenceProps()['onClick'] === 'function') {
            ;(getReferenceProps()['onClick'] as Function)(e)
            setCurrentTrigger('click')
          }
        },
        onPointerEnter(e) {
          if (isStopPropagation('hover')) {
            e.stopPropagation()
          }
          if (typeof getReferenceProps()['onPointerEnter'] === 'function') {
            ;(getReferenceProps()['onPointerEnter'] as Function)(e)
            setCurrentTrigger('hover')
          }
        },
      }),
    })
  }
)
