import { useRef } from "react";

type Callback = (...args: any[]) => any;

export const useThrottle = <T extends Callback>(
  callback: T,
  interval = 250
): T => {
  const lastTime = useRef(0);

  return ((...args) => {
    if (Date.now() - lastTime.current > interval) {
      callback(...args);
      lastTime.current = Date.now();
    }
  }) as T;
};
