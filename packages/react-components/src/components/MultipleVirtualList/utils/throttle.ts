export const throttle = (fn: (...args: any[]) => void, interval: number) => {
  let time = Date.now();
  return (...args: any[]) => {
    let currentTime = Date.now();
    if (currentTime - time > interval) {
      fn(...args);
      time = currentTime;
    }
  };
};
