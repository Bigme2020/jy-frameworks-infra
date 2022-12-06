import React, {
  FC,
  ReactElement,
  useState,
  CSSProperties,
  cloneElement,
  useMemo,
} from 'react'
import styled from 'styled-components'
import { useFloating } from '@floating-ui/react-dom'
import { Portal } from '../Portal'

type Placement = 'left' | 'right' | 'top' | 'bottom'

interface TooltipProp {
  title: string
  children: any
  placement?: Placement
  style?: CSSProperties
}

interface TooltipAttrs {
  visible: boolean
}

const StyledTooltip = styled.div<TooltipAttrs>`
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  white-space: nowrap;
  position: absolute;
  border-radius: 4px;
  background-color: #252627;
  border: 1px solid #494a4b;
  color: #bebebe;
  font-size: 12px;
  padding: 4px;
  user-select: none;
`

export const Tooltip: FC<TooltipProp> = ({
  title,
  children,
  placement,
  style: customStyle,
}): ReactElement => {
  const [render, setRender] = useState(false)
  const [visible, setVisible] = useState(false)
  const { x, y, strategy, reference, floating } = useFloating({
    placement,
  })

  const onHover = () => {
    setRender(true)
    setVisible(true)
  }
  const onLeave = () => {
    setVisible(false)
    setRender(false)
  }

  const el = useMemo(() => {
    const cloneEl = cloneElement(children, {
      onMouseEnter: onHover,
      onMouseLeave: onLeave,
      ref: reference,
    })
    return cloneEl
  }, [children])

  return (
    <>
      {render ? (
        <Portal>
          <StyledTooltip
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            visible={visible}
            style={{
              position: strategy,
              left: x || 0,
              top: y || 0,
              ...customStyle,
            }}
            ref={floating}
          >
            {title}
          </StyledTooltip>
        </Portal>
      ) : null}
      {el}
    </>
  )
}
