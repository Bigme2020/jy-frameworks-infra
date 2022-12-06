import React, { useMemo, useCallback, useState, cloneElement, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useFloating } from '@floating-ui/react-dom';
import { createPortal } from 'react-dom';

// 存放容器与其portal容器的对应map：一个容器下至多一个portal容器
const containerMap = new Map();
// 当前取出的portal容器
let portalContainer;
const Portal = ({ children, container, }) => {
    const _container = useMemo(() => container || document.body, [container]);
    const initPortalContainer = useCallback(() => {
        portalContainer = document.createElement("div");
        portalContainer.style.position = "absolute";
        portalContainer.style.zIndex = "9999";
        portalContainer.style.top = "0";
        portalContainer.style.left = "0";
        portalContainer.style.width = "0";
        portalContainer.style.height = "0";
    }, []);
    if (!containerMap.has(_container)) {
        initPortalContainer();
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

const Wrapper = styled.div `
  overflow-y: auto;
  height: ${(props) => props.height};
`;

const PaddingTop = styled.div `
  height: ${(props) => `${props.paddingTop}px`};
`;

const PaddingBottom = styled.div `
  height: ${(props) => `${props.paddingBottom}px`};
`;

// const RenderZone = styled.div``;
const dynamicHeight = 100;
const VirtualList = ({ data, dependency, height, itemSize, }) => {
    const [scrollTop, setScrollTop] = useState(0);
    const wrapperRef = useRef(null);
    // const itemCount = useMemo(() => data.length, [data]);
    const renderCount = useMemo(() => ((height || 500) / itemSize) + 2, [height]); // 多渲染两个防止空白
    const renderStartIndex = useMemo(() => Math.floor(scrollTop / itemSize), [scrollTop]);
    const paddingTop = useMemo(() => scrollTop, [scrollTop]);
    useEffect(() => {
        var _a;
        const handleVirtualScroll = (e) => {
            setScrollTop(e.currentTarget.scrollTop);
        };
        (_a = wrapperRef.current) === null || _a === void 0 ? void 0 : _a.addEventListener('scroll', handleVirtualScroll);
        return () => {
            var _a;
            (_a = wrapperRef.current) === null || _a === void 0 ? void 0 : _a.removeEventListener('scroll', handleVirtualScroll);
        };
    }, []);
    return (React.createElement(Wrapper, { ref: wrapperRef, height: !dependency ? height || 500 : dynamicHeight },
        React.createElement(PaddingTop, { paddingTop: paddingTop }),
        data.slice(renderStartIndex, renderStartIndex + renderCount).map(item => {
            return item;
        }),
        React.createElement(PaddingBottom, null)));
};

export { Silly, Tooltip, VirtualList };
