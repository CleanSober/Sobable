import { useEffect } from "react";

/**
 * Global UX helper: lets the user "exit" any text field at any time.
 *
 * - Pressing Escape blurs the focused input/textarea/contenteditable.
 * - Tapping outside any input (on a non-interactive area) blurs it too,
 *   which on mobile dismisses the on-screen keyboard.
 */
export function useDismissibleInputs() {
  useEffect(() => {
    const isEditable = (el: Element | null): el is HTMLElement => {
      if (!el || !(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const active = document.activeElement;
      if (isEditable(active)) {
        active.blur();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const active = document.activeElement;
      if (!isEditable(active)) return;
      const target = e.target as Element | null;
      if (!target) return;
      // If the tap is inside the focused field or any interactive control, ignore.
      if (active.contains(target)) return;
      if (target.closest("input, textarea, select, [contenteditable=''], [contenteditable='true'], button, a, label, [role='button'], [role='menuitem'], [role='tab'], [role='option']")) {
        return;
      }
      active.blur();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, []);
}
