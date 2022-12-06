import { CSSProperties, ReactElement, RefObject } from 'react';

export type RenderConfigItem = {
  dataLength: number;
  title?: string;
  fetchUrl?: string;
  fetchParams?: any;
  itemSize?: number;
  fetchMore?: () => void;
  renderTitle?: (ref: RefObject<any>) => ReactElement | HTMLElement;
  renderItem?: (
    index: number,
    style: CSSProperties,
  ) => ReactElement | HTMLElement;
  renderGap?: number;
};

export type RenderConfig = RenderConfigItem[];
