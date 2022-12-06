import { useMemo, useCallback } from 'react';
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

export { Portal };
