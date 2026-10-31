import { useCallback, useEffect, useRef, type MouseEvent, type PointerEvent } from 'react';

const MOVE_TOLERANCE = 10; // px: more than this and it's a scroll, not a press

/**
 * Tap = one step. Hold = repeat after `delay`, every `interval`.
 *
 * - The step runs on release, not on touch-down, so starting a scroll on a
 *   +/− button no longer changes the quantity.
 * - Moving the finger or the browser taking over the gesture cancels.
 * - The latest `onPress` is always used, so repeating keeps counting up
 *   instead of re-applying the value from when the press started.
 */
export function useLongPress(onPress: () => void, delay = 400, interval = 100) {
  const pressRef = useRef(onPress);
  useEffect(() => {
    pressRef.current = onPress;
  }, [onPress]);

  const s = useRef({ active: false, repeating: false, x: 0, y: 0, timer: 0, ticker: 0 });

  const clear = useCallback(() => {
    window.clearTimeout(s.current.timer);
    window.clearInterval(s.current.ticker);
  }, []);

  useEffect(() => clear, [clear]);

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const st = s.current;
      clear();
      st.active = true;
      st.repeating = false;
      st.x = e.clientX;
      st.y = e.clientY;
      st.timer = window.setTimeout(() => {
        st.repeating = true;
        pressRef.current();
        st.ticker = window.setInterval(() => pressRef.current(), interval);
      }, delay);
    },
    [clear, delay, interval]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const st = s.current;
      if (!st.active) return;
      if (Math.abs(e.clientX - st.x) > MOVE_TOLERANCE || Math.abs(e.clientY - st.y) > MOVE_TOLERANCE) {
        st.active = false;
        clear();
      }
    },
    [clear]
  );

  const onPointerUp = useCallback(() => {
    const st = s.current;
    if (!st.active) return;
    st.active = false;
    clear();
    if (!st.repeating) pressRef.current();
  }, [clear]);

  const cancel = useCallback(() => {
    s.current.active = false;
    clear();
  }, [clear]);

  // Keyboard (Enter/Space) produces a click with detail 0; pointer taps are
  // already handled above.
  const onClick = useCallback((e: MouseEvent) => {
    if (e.detail === 0) pressRef.current();
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onClick,
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
  };
}
