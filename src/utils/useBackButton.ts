import { useEffect, useRef } from 'react';

/**
 * While `active`, Android's back gesture calls `onBack` instead of leaving
 * the app. The screen/modal gets its own history entry; closing it any other
 * way removes that entry again.
 */
export function useBackButton(active: boolean, onBack: () => void, key: string) {
  const backRef = useRef(onBack);
  useEffect(() => {
    backRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    if (!active) return undefined;
    history.pushState({ [key]: true }, '');
    let popped = false;
    const onPop = (e: PopStateEvent) => {
      // Still on one of our entries (StrictMode re-mount in dev): ignore.
      if ((e.state as Record<string, unknown> | null)?.[key]) return;
      popped = true;
      backRef.current();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (!popped && (history.state as Record<string, unknown> | null)?.[key]) history.back();
    };
  }, [active, key]);
}
