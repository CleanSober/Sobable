import { useRef, useCallback } from "react";

interface SwipeConfig {
  threshold?: number;
  maxVerticalRatio?: number;
}

export const useSwipeNavigation = <T extends string>(
  tabs: T[],
  activeTab: T,
  onTabChange: (tab: T) => void,
  config: SwipeConfig = {}
) => {
  const { threshold = 50, maxVerticalRatio = 0.75 } = config;
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiping = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    swiping.current = false;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;

      // Ignore if vertical movement dominates (user is scrolling)
      if (Math.abs(deltaY) > Math.abs(deltaX) * maxVerticalRatio) {
        touchStart.current = null;
        return;
      }

      if (Math.abs(deltaX) > threshold) {
        const currentIndex = tabs.indexOf(activeTab);

        if (deltaX < 0 && currentIndex < tabs.length - 1) {
          // Swipe left → next tab
          onTabChange(tabs[currentIndex + 1]);
        } else if (deltaX > 0 && currentIndex > 0) {
          // Swipe right → previous tab
          onTabChange(tabs[currentIndex - 1]);
        }
      }

      touchStart.current = null;
    },
    [tabs, activeTab, onTabChange, threshold, maxVerticalRatio]
  );

  return { onTouchStart, onTouchEnd };
};
