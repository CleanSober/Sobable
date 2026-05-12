import { useEffect, useRef, useState } from "react";
import {
  HomeSkeleton,
  CheckInSkeleton,
  TriggersSkeleton,
  ProgressSkeleton,
  ProfileSkeleton,
  PageSkeleton,
} from "@/components/skeletons/HomeSkeleton";
import {
  ChartBarPlaceholder,
  ChartLinePlaceholder,
  BadgeRailPlaceholder,
  ListPlaceholder,
  StatGridPlaceholder,
  CalendarGridPlaceholder,
} from "@/components/skeletons/FieldPlaceholders";

/**
 * Developer-only visual + layout-shift verification page for skeletons.
 *
 * Why this exists:
 *   When a real component swaps in for a skeleton, any size mismatch causes
 *   Cumulative Layout Shift. This page renders every skeleton + every field
 *   placeholder so we can:
 *     1. Screenshot them at mobile / tablet / desktop viewports.
 *     2. Measure each section's height with `getBoundingClientRect()` and
 *        verify it stays stable across two animation frames (i.e. nothing
 *        is shifting after first paint).
 *
 * Open `/dev/skeletons` and watch the report panel — every row should show
 * "shift: 0px". Any non-zero value indicates a skeleton that mutates after
 * mount and will cause CLS in production.
 */

type Section = { id: string; label: string; render: () => JSX.Element };

const sections: Section[] = [
  // Tab skeletons (rendered inside the standard tab body container so the
  // measurements match what users see in Index.tsx).
  { id: "home", label: "HomeSkeleton", render: () => <HomeSkeleton /> },
  { id: "checkin", label: "CheckInSkeleton", render: () => <CheckInSkeleton /> },
  { id: "triggers", label: "TriggersSkeleton", render: () => <TriggersSkeleton /> },
  { id: "progress", label: "ProgressSkeleton", render: () => <ProgressSkeleton /> },
  { id: "profile", label: "ProfileSkeleton", render: () => <ProfileSkeleton /> },
  { id: "page", label: "PageSkeleton (Suspense fallback)", render: () => <PageSkeleton /> },

  // Field-level placeholders.
  { id: "chart-bar", label: "ChartBarPlaceholder", render: () => <ChartBarPlaceholder /> },
  { id: "chart-line", label: "ChartLinePlaceholder", render: () => <ChartLinePlaceholder /> },
  { id: "badges", label: "BadgeRailPlaceholder", render: () => <BadgeRailPlaceholder /> },
  { id: "list", label: "ListPlaceholder", render: () => <ListPlaceholder rows={4} /> },
  { id: "stats", label: "StatGridPlaceholder", render: () => <StatGridPlaceholder /> },
  { id: "calendar", label: "CalendarGridPlaceholder", render: () => <CalendarGridPlaceholder /> },
];

type Measurement = { id: string; label: string; height: number; shift: number };

const SkeletonsDev = () => {
  const refs = useRef(new Map<string, HTMLDivElement | null>());
  const [report, setReport] = useState<Measurement[]>([]);

  useEffect(() => {
    // Capture height across two animation frames; any difference is a layout
    // shift after mount (= CLS in production).
    const first = new Map<string, number>();

    requestAnimationFrame(() => {
      sections.forEach((s) => {
        const el = refs.current.get(s.id);
        if (el) first.set(s.id, Math.round(el.getBoundingClientRect().height));
      });

      requestAnimationFrame(() => {
        const measurements: Measurement[] = sections.map((s) => {
          const el = refs.current.get(s.id);
          const h = el ? Math.round(el.getBoundingClientRect().height) : 0;
          const initial = first.get(s.id) ?? h;
          return { id: s.id, label: s.label, height: h, shift: h - initial };
        });
        setReport(measurements);

        // Also expose to the browser tool for non-DOM scraping.
        (window as unknown as { __skeletonReport?: Measurement[] }).__skeletonReport =
          measurements;
        // eslint-disable-next-line no-console
        console.table(measurements);
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky report panel */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <h1 className="text-base font-bold">Skeleton layout-shift check</h1>
          <p className="text-xs text-muted-foreground mb-2">
            Resize the browser to mobile (375), tablet (768), and desktop (1280) to
            verify every row stays at "shift: 0px".
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 text-[11px] font-mono">
            {report.length === 0 ? (
              <span className="text-muted-foreground">measuring…</span>
            ) : (
              report.map((m) => (
                <div
                  key={m.id}
                  className={`flex justify-between px-2 py-1 rounded ${
                    m.shift === 0
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-destructive/10 text-destructive"
                  }`}
                  data-testid={`report-${m.id}`}
                  data-height={m.height}
                  data-shift={m.shift}
                >
                  <span className="truncate">{m.label}</span>
                  <span>
                    {m.height}px · shift: {m.shift}px
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Each skeleton in its own framed section */}
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-8">
        {sections.map((s) => (
          <section key={s.id} className="space-y-2">
            <header className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">{s.label}</h2>
              <span className="text-[10px] font-mono text-muted-foreground">
                #{s.id}
              </span>
            </header>
            <div
              ref={(el) => {
                refs.current.set(s.id, el);
              }}
              data-skeleton-section={s.id}
              className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-3 overflow-hidden"
            >
              {s.render()}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default SkeletonsDev;
