import { useRef, useCallback } from "react";
import { useDataRef } from "./useDataRef";

function useInterval(
  callback: () => Promise<any> | any,
  interval: number = 30 * 60 * 1000,
  key?: string,
) {
  const timer = useRef<any>(null);
  const savedCallback = useDataRef(callback);
  const prevTime = useRef(-1);
  const endFlag = useRef(false);

  const setTimer = useCallback(async () => {
    if (endFlag.current) {
      return;
    }
    await savedCallback.current();
    timer.current = setTimeout(async () => {
      timer.current !== null && clearTimeout(timer.current);
      timer.current = null;
      await setTimer();
    }, interval);
  }, [interval, savedCallback]);

  const clearTimer = useCallback((flag?: boolean) => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    timer.current = null;
    prevTime.current = -1;
    if (flag !== undefined) {
      endFlag.current = flag;
    } else {
      endFlag.current = true;
    }
  }, []);

  return { setTimer, clearTimer };
}

export default useInterval;
