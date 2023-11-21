import { useRef } from 'react'

type Callback = (...args: any[]) => any
type DebounceType = 'front' | 'behind'
interface UseDebounceProps {
  interval?: number
  type?: DebounceType
}

const DEFAULT_PROPS = {
  interval: 250,
  type: 'behind',
}

export const useDebounce = <T extends Callback>(callback: T, props: UseDebounceProps) => {
  const { interval, type } = Object.assign(DEFAULT_PROPS, props)
  const timeout = useRef<number | null>(null)

  return ((...args) => {
    if (type === 'front') {
      if (timeout.current) {
        clearTimeout(timeout.current)
      } else {
        callback(...args)
      }
      timeout.current = window.setTimeout(() => {
        timeout.current = null
      }, interval)
    }
    if (type === 'behind') {
      timeout.current = window.setTimeout(() => {
        timeout.current = null
      }, interval)
      if (timeout.current) {
        clearTimeout(timeout.current)
      } else {
        callback(...args)
      }
    }
  }) as T
}
