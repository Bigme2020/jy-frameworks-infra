import React, { useMemo, useState, cloneElement } from 'react';
import styled from 'styled-components';
import { useFloating } from '@floating-ui/react-dom';
import { createPortal } from 'react-dom';

// 存放容器与其portal容器的对应map：一个容器下至多一个portal容器
const containerMap = new Map();
// 当前取出的portal容器
let portalContainer;
const Portal = ({ children, container, }) => {
    const _container = useMemo(() => container || document.body, [container]);
    if (!containerMap.has(_container)) {
        portalContainer = document.createElement("div");
        portalContainer.style.position = "absolute";
        portalContainer.style.zIndex = "9999";
        portalContainer.style.top = "0";
        portalContainer.style.left = "0";
        containerMap.set(_container, portalContainer);
        _container.appendChild(portalContainer); // 所及之处都会留下一个portal容器
    }
    else {
        portalContainer = containerMap.get(_container);
    }
    return createPortal(children, portalContainer);
};

const StyledTooltip = styled.div `
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  white-space: nowrap;
  position: absolute;
  border-radius: 4px;
  background-color: #252627;
  border: 1px solid #494a4b;
  color: #bebebe;
  font-size: 12px;
  padding: 4px;
  user-select: none;
`;
const Tooltip = ({ title, children, placement, style: customStyle, }) => {
    const [render, setRender] = useState(false);
    const [visible, setVisible] = useState(false);
    const { x, y, strategy, reference, floating } = useFloating({
        placement,
    });
    const onHover = () => {
        setRender(true);
        setVisible(true);
    };
    const onLeave = () => {
        setVisible(false);
        setRender(false);
    };
    const el = useMemo(() => {
        const cloneEl = cloneElement(children, {
            onMouseEnter: onHover,
            onMouseLeave: onLeave,
            ref: reference,
        });
        return cloneEl;
    }, [children]);
    return (React.createElement(React.Fragment, null,
        render ? (React.createElement(Portal, null,
            React.createElement(StyledTooltip, { onMouseEnter: onHover, onMouseLeave: onLeave, visible: visible, style: Object.assign({ position: strategy, left: x || 0, top: y || 0 }, customStyle), ref: floating }, title))) : null,
        el));
};

const Silly = () => {
    return React.createElement("div", null, "\"sillyMan\"");
};

export { Silly, Tooltip };
