import React, {
  FC,
  ReactElement,
  UIEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { RenderConfig } from './types';
import { MVirtualList } from './components';
import { throttle } from './utils';

interface MultipleVirtualListProps {
  renderConfig: RenderConfig;
  width?: number | string;
  height: number | string;
  boundary?: number;
  fetchOnScroll?: boolean;
  fetchOnBottom?: boolean;
}

/**
 * MultipleVirtualList是由多个动态高度的VirtualList组成的列表，滑动时内部的每个VirtualList会根据其处于MultipleVirtualList视口的位置来进行dom的增删; 性能与使用普通列表差别不大，但js实例内存与其相比占用减少了50%
 * @param renderConfig 核心参数，注意：传入的renderItem一定要写上key（不然每个item都会重新渲染）
 * @param height 列表固定高度，可以是100%
 * @param fetchOnScroll 滚动时加载
 * @param fetchOnBottom 触底加载
 * @param boundary 边界渲染数量，默认0（在快速滚动时可能会出现边界空白，建议酌情手动设置，一般多渲染1-2行就够了）
 * @returns
 */
export const MultipleVirtualList: FC<MultipleVirtualListProps> = ({
  renderConfig,
  width,
  height,
  fetchOnScroll = true,
  fetchOnBottom = false,
  boundary = 0,
}): ReactElement => {
  const [_height, setHeight] = useState(0); // 用于外部height传入100%时，内部等挂载后去获取高度
  const [scrollTop, setScrollTop] = useState(0);

  const divRef = useRef<HTMLDivElement>(null);
  const currentFetchIndex = useRef(0);
  const setCurrentFetchIndex = (val: number) => {
    currentFetchIndex.current = val;
  };

  const scrollFetch = useCallback(() => {
    if (fetchOnScroll) {
      if (
        renderConfig[currentFetchIndex.current]?.fetchMore &&
        typeof renderConfig[currentFetchIndex.current]?.fetchMore === 'function'
      ) {
        renderConfig[currentFetchIndex.current].fetchMore!();
      }
    }
  }, [fetchOnScroll]);

  const throttledScrollFetch = throttle(scrollFetch, 2000);
  
  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const _scrollTop = e.currentTarget.scrollTop;
    setScrollTop(_scrollTop);
    throttledScrollFetch();
  }, []);

  const onBottom = (index: number) => {
    if (fetchOnBottom) {
      return () => {
        if (
          renderConfig &&
          renderConfig[index] &&
          typeof renderConfig[index].fetchMore === 'function'
        ) {
          renderConfig[index].fetchMore!();
        }
      };
    }
    return () => setCurrentFetchIndex(index);
  };

  useEffect(() => {
    setHeight(divRef.current?.getBoundingClientRect().height || 0); // 若height传的100%，则需要在这边获取_height
  }, [divRef]);

  return (
    <div
      ref={divRef}
      style={{
        height: _height || height,
        width: width || '100%',
        position: 'relative',
        overflow: 'auto',
      }}
      onScroll={onScroll}>
      {_height
        ? renderConfig.map((dataItem, index) => {
            return (
              <MVirtualList
                outerHeight={_height}
                key={index}
                scrollTop={scrollTop}
                dataLength={dataItem.dataLength}
                onBottom={onBottom(index)}
                itemSize={dataItem.itemSize || 100}
                listIndex={index}
                renderTitle={dataItem?.renderTitle}
                renderItem={dataItem.renderItem}
                renderGap={dataItem?.renderGap || 0}
                boundary={boundary}
              />
            );
          })
        : null}
    </div>
  );
};
