# Visual Regression Checklist

QA pass to run before each release across the 5 main tabs:
**Home, Check-In, Triggers, Progress, Profile.**

Run on these viewports: **320×568** (iPhone SE), **375×812** (iPhone 13),
**768×1024** (iPad), **1280×720** (desktop).

Live runner: `/dev/visual-qa` (automated checks + manual checklist).

---

## 1. Page heading row

Every tab must have a centered title row matching this layout:

```tsx
<motion.div className="text-center py-1">
  <h1 className="text-lg font-bold text-foreground mb-0.5">{title}</h1>
  <p className="text-xs text-muted-foreground">{subtitle}</p>
</motion.div>
```

| Tab       | Title              | Status |
| --------- | ------------------ | ------ |
| Home      | Home               | ☐      |
| Check-In  | Daily Check-In     | ☐      |
| Triggers  | Triggers & Coping  | ☐      |
| Progress  | Your Journey       | ☐      |
| Profile   | Profile            | ☐      |

---

## 2. Loading states

- ☐ Each tab renders its dedicated skeleton during Suspense (no spinners).
- ☐ Skeleton heights match the real component (verified via `/dev/skeletons`,
  shift = `0px` on every section, every viewport).
- ☐ Field-level placeholders used inside cards instead of generic blocks
  (`ChartLinePlaceholder`, `BadgeRailPlaceholder`, `ListPlaceholder`,
  `StatGridPlaceholder`, `CalendarGridPlaceholder`).
- ☐ All skeletons consume tokens from `src/components/skeletons/tokens.ts`.

## 3. Empty states

- ☐ Empty cards use the same icon + title + body pattern (no raw "No data").
- ☐ Empty CTA links to the action that creates the first entry.
- ☐ Premium-locked sections use `PremiumLockOverlay`, never a custom mask.

## 4. Toast styles

- ☐ All toasts use `sonner` (`import { toast } from "sonner"`).
- ☐ No new files import the legacy `@/hooks/use-toast`.
  (Known legacy: `src/components/AppStoreGuide.tsx`. Migrate when touched.)
- ☐ Severity verbs are consistent: `toast.success` for confirmations,
  `toast.error` for failures, plain `toast()` for neutral info.
- ☐ Toast copy is sentence case, ≤60 chars on the title line, optional
  `description` for context.

## 5. Spacing & rhythm

- ☐ Tab root container: `space-y-4`.
- ☐ Section subtitles: `text-[11px] font-semibold uppercase tracking-wider
  text-muted-foreground/80 px-1 pt-1`.
- ☐ Card padding: `p-3` (mobile) — never inline pixel values.
- ☐ Bottom nav clearance: tab content respects the `pb-24` safe area set
  in the layout — no card clipped by the nav.
- ☐ Top safe area: header uses `.top-safe` on Android 15 edge-to-edge.

## 6. Cross-cutting

- ☐ No horizontal scroll at 320 px on any tab.
- ☐ All interactive elements ≥44 px tap target.
- ☐ No hardcoded colors — only semantic tokens (`text-foreground`,
  `bg-card`, `text-muted-foreground`, etc.).
- ☐ Dark mode renders identically structured (no missing borders / glow).
- ☐ Colorblind mode (`html.colorblind`) preserves contrast on all charts.

---

## How to run

1. Open `/dev/visual-qa` in the preview.
2. Resize the preview to each target viewport.
3. Tick each section. Anything red → file an issue before release.
