import { CSSProperties } from 'react'
import { TransitionState } from '../types'

export const getTrasitionStyle = (state: TransitionState, transitionMap?: Record<TransitionState, CSSProperties>) => {
  const animation = transitionMap
    ? {
        ...transitionMap.exited,
        ...transitionMap[state],
      }
    : {
        entering: { opacity: 1, zIndex: 1 },
        entered: { opacity: 1, zIndex: 1 },
        exiting: { opacity: 0, zIndex: -99 },
        exited: { opacity: 0, zIndex: -99 },
      }[state]

  const common: CSSProperties = {
    pointerEvents: state === 'exited' || state === 'exiting' ? 'none' : 'auto',
  }

  return {
    ...animation,
    ...common,
  }
}
