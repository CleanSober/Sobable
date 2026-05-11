import { useCallback } from "react";

interface SwipeConfig {
  threshold?: number;
  maxVerticalRatio?: number;
}

/**
 * App-wide swipe navigation has been disabled to prevent accidental
 * page changes (especially on screens with sliders, scroll areas, and
 * touch-sensitive controls). Users navigate via the bottom tab bar.
 *
 * The hook signature is preserved so existing call sites still compile,
 * but the returned handlers are no-ops.
 */
export const useSwipeNavigation = <T extends string>(
  _tabs: T[],
  _activeTab: T,
  _onTabChange: (tab: T) => void,
  _config: SwipeConfig = {}
) => {
  const onTouchStart = useCallback(() => {}, []);
  const onTouchEnd = useCallback(() => {}, []);
  return { onTouchStart, onTouchEnd };
};
