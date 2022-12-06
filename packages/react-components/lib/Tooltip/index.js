'use strict';

var React = require('react');
var styled = require('styled-components');
var reactDom$1 = require('@floating-ui/react-dom');
var reactDom = require('react-dom');

// 存放容器与其portal容器的对应map：一个容器下至多一个portal容器
const containerMap = new Map();
// 当前取出的portal容器
let portalContainer;
const Portal = ({ children, container, }) => {
    const _container = React.useMemo(() => container || document.body, [container]);
    const initPortalContainer = React.useCallback(() => {
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
    return reactDom.createPortal(children, portalContainer);
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
    const [render, setRender] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const { x, y, strategy, reference, floating } = reactDom$1.useFloating({
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
    const el = React.useMemo(() => {
        const cloneEl = React.cloneElement(children, {
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

exports.Tooltip = Tooltip;
