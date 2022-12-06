import React, { useState, useRef, useMemo, useEffect } from 'react';
import styled from 'styled-components';

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

export { VirtualList };
