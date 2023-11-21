import { ReferenceType } from '@floating-ui/react'
import React, { FC, ReactElement, ReactNode, createContext, useMemo, useState } from 'react'

interface TooltipProps {
  children: ReactNode
}

interface TooltipContextProps {
  getReferencePropsMap: {
    [key: string | number]: (userProps?: React.HTMLProps<Element> | undefined) => Record<string, unknown>
  }
  setGetReferencePropsMap: React.Dispatch<
    React.SetStateAction<{
      [key: string]: (userProps?: React.HTMLProps<Element> | undefined) => Record<string, unknown>
      [key: number]: (userProps?: React.HTMLProps<Element> | undefined) => Record<string, unknown>
    }>
  >
  referencesMap: {
    [key: string | number]: (node: ReferenceType | null) => void
  }
  setReferencesMap: React.Dispatch<
    React.SetStateAction<{
      [key: string]: (node: ReferenceType | null) => void
      [key: number]: (node: ReferenceType | null) => void
    }>
  >
}

export const TooltipContext = createContext<TooltipContextProps>({
  getReferencePropsMap: {},
  setGetReferencePropsMap: () => {},
  referencesMap: {},
  setReferencesMap: () => {},
})

export const Tooltip: FC<TooltipProps> = ({ children }): ReactElement => {
  const [getReferencePropsMap, setGetReferencePropsMap] = useState<{
    [key: string | number]: (userProps?: React.HTMLProps<Element> | undefined) => Record<string, unknown>
  }>({})
  const [referencesMap, setReferencesMap] = useState<{
    [key: string | number]: (node: ReferenceType | null) => void
  }>({})

  const providerValue = useMemo(
    () => ({
      getReferencePropsMap,
      setGetReferencePropsMap,
      referencesMap,
      setReferencesMap,
    }),
    [getReferencePropsMap, referencesMap]
  )

  return <TooltipContext.Provider value={providerValue}>{children}</TooltipContext.Provider>
}

export * from './TooltipContent'
export * from './TooltipTrigger'
