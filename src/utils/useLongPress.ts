import { useRef, useCallback } from 'react';

export function useLongPress(
  onPress: () => void,
  delay: number = 400,
  interval: number = 100
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isTouchRef = useRef(false);

  const start = useCallback((e?: any) => {
    if (e?.type === 'mousedown' && isTouchRef.current) {
      setTimeout(() => { isTouchRef.current = false; }, 500);
      return;
    }
    if (e?.type === 'touchstart') {
      isTouchRef.current = true;
    }
    
    // Primera ejecución inmediata
    onPress();
    
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        onPress();
      }, interval);
    }, delay);
  }, [onPress, delay, interval]);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
}
