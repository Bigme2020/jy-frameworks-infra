import React, { useEffect, useRef } from 'react'

export const useEffectWithoutFirstTime = (
  callback: () => void,
  deps: any[],
  isStrictMode = true
) => {
  const initialTime = useRef(0)

  const major = React.version.split('.')[0]
  const minor = React.version.split('.')[1]
  const hasStrictMode =
    Number(major) >= 16 || (Number(major) === 16 && Number(minor) >= 3)
  if (!hasStrictMode) isStrictMode = false

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' && isStrictMode
        ? initialTime.current < 2
        : initialTime.current < 1
    ) {
      initialTime.current++
      return
    }
    callback()
  }, deps)
}
