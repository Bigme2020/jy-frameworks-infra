'use strict';

var react = require('react');
var reactDom = require('react-dom');

// 存放容器与其portal容器的对应map：一个容器下至多一个portal容器
const containerMap = new Map();
// 当前取出的portal容器
let portalContainer;
const Portal = ({ children, container, }) => {
    const _container = react.useMemo(() => container || document.body, [container]);
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
    return reactDom.createPortal(children, portalContainer);
};

exports.Portal = Portal;
