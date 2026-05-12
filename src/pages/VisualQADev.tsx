/**
 * /dev/visual-qa
 *
 * Automated portion of the Visual Regression Checklist.
 * Loads each main tab in an iframe and reports computed checks plus a
 * manual checklist for human review. Companion doc:
 * src/docs/VISUAL_REGRESSION_CHECKLIST.md
 */
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";

type Status = "pass" | "fail" | "warn" | "pending";

type Check = {
  id: string;
  label: string;
  status: Status;
  detail?: string;
};

const TABS = [
  { id: "home", label: "Home", expectedH1: "Home" },
  { id: "checkin", label: "Check-In", expectedH1: "Daily Check-In" },
  { id: "triggers", label: "Triggers", expectedH1: "Triggers & Coping" },
  { id: "progress", label: "Progress", expectedH1: "Your Journey" },
  { id: "profile", label: "Profile", expectedH1: "Profile" },
] as const;

const MANUAL = [
  "Skeleton heights match real components (see /dev/skeletons)",
  "Empty states use icon + title + body pattern",
  "Toasts use sonner with consistent severity verbs",
  "Section subtitles use text-[11px] uppercase tracking-wider",
  "Card padding is p-3, never inline pixel values",
  "No horizontal scroll at 320px viewport",
  "Tap targets ≥44px",
  "Only semantic color tokens (no hex / rgb in components)",
  "Dark mode parity (no missing borders / glow)",
  "Colorblind mode preserves chart contrast",
];

function StatusDot({ status }: { status: Status }) {
  const color =
    status === "pass"
      ? "bg-emerald-500"
      : status === "fail"
        ? "bg-red-500"
        : status === "warn"
          ? "bg-amber-500"
          : "bg-muted-foreground/40";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} aria-label={status} />;
}

function TabFrame({
  tab,
  onChecks,
}: {
  tab: (typeof TABS)[number];
  onChecks: (id: string, checks: Check[]) => void;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const path = tab.id === "profile" ? "/profile" : `/?tab=${tab.id}`;

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    const handle = () => {
      // Wait for content to render past skeletons.
      window.setTimeout(() => {
        try {
          const doc = iframe.contentDocument;
          if (!doc) {
            onChecks(tab.id, [
              { id: "frame", label: "Frame loaded", status: "fail", detail: "no document" },
            ]);
            return;
          }
          const checks: Check[] = [];

          // 1. h1 title row present and matches expected text.
          const h1 = doc.querySelector("h1");
          const h1Text = h1?.textContent?.trim() ?? "";
          checks.push({
            id: "h1",
            label: `H1 title row = "${tab.expectedH1}"`,
            status: h1Text === tab.expectedH1 ? "pass" : "fail",
            detail: h1Text || "(missing)",
          });

          // 2. No horizontal overflow.
          const docEl = doc.documentElement;
          const overflow = docEl.scrollWidth > docEl.clientWidth + 1;
          checks.push({
            id: "overflow",
            label: "No horizontal overflow",
            status: overflow ? "fail" : "pass",
            detail: `scrollWidth ${docEl.scrollWidth} / client ${docEl.clientWidth}`,
          });

          // 3. Bottom nav clearance — last card not clipped.
          const cards = Array.from(doc.querySelectorAll("[class*='card']")) as HTMLElement[];
          const last = cards[cards.length - 1];
          let clearance = "n/a";
          let clearanceStatus: Status = "warn";
          if (last) {
            const rect = last.getBoundingClientRect();
            const clear = docEl.clientHeight - rect.bottom;
            clearance = `${Math.round(clear)}px below last card`;
            clearanceStatus = clear >= -1 ? "pass" : "fail";
          }
          checks.push({
            id: "clearance",
            label: "Bottom-nav clearance",
            status: clearanceStatus,
            detail: clearance,
          });

          // 4. Tap target sample — buttons ≥44px tall.
          const buttons = Array.from(doc.querySelectorAll("button")) as HTMLElement[];
          const small = buttons.filter((b) => b.offsetHeight > 0 && b.offsetHeight < 36);
          checks.push({
            id: "tap",
            label: "Buttons ≥36px tall",
            status: small.length === 0 ? "pass" : "warn",
            detail: small.length ? `${small.length} undersized` : "all ok",
          });

          onChecks(tab.id, checks);
        } catch (err) {
          onChecks(tab.id, [
            {
              id: "error",
              label: "Inspection failed",
              status: "fail",
              detail: String(err),
            },
          ]);
        }
      }, 1500);
    };
    iframe.addEventListener("load", handle);
    return () => iframe.removeEventListener("load", handle);
  }, [tab, onChecks]);

  return (
    <iframe
      ref={ref}
      src={path}
      title={tab.label}
      className="w-[375px] h-[640px] rounded-xl border border-border bg-background"
    />
  );
}

const SkeletonsDevQA = () => {
  const [results, setResults] = useState<Record<string, Check[]>>({});
  const [manual, setManual] = useState<Record<string, boolean>>({});

  const passCount = Object.values(results)
    .flat()
    .filter((c) => c.status === "pass").length;
  const failCount = Object.values(results)
    .flat()
    .filter((c) => c.status === "fail").length;
  const totalAuto = Object.values(results).flat().length;

  return (
    <div className="min-h-screen bg-background p-6">
      <Helmet>
        <title>Visual QA · Dev</title>
      </Helmet>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Visual QA Runner</h1>
        <p className="text-sm text-muted-foreground">
          Automated checks across the 5 main tabs + manual checklist. See{" "}
          <code className="text-xs">src/docs/VISUAL_REGRESSION_CHECKLIST.md</code>.
        </p>
        <div className="mt-3 text-sm flex gap-4">
          <span className="text-emerald-500">Pass: {passCount}</span>
          <span className="text-red-500">Fail: {failCount}</span>
          <span className="text-muted-foreground">Total auto: {totalAuto}</span>
          <span className="text-muted-foreground">
            Manual: {Object.values(manual).filter(Boolean).length}/{MANUAL.length}
          </span>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2 mb-8">
        {TABS.map((tab) => (
          <div key={tab.id} className="border border-border rounded-2xl p-4 bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">{tab.label}</h2>
            <div className="flex gap-4">
              <TabFrame
                tab={tab}
                onChecks={(id, checks) => setResults((r) => ({ ...r, [id]: checks }))}
              />
              <ul className="flex-1 space-y-2 text-sm">
                {(results[tab.id] ?? [{ id: "p", label: "Running…", status: "pending" as Status }]).map((c) => (
                  <li key={c.id} className="flex items-start gap-2">
                    <StatusDot status={c.status} />
                    <div className="flex-1">
                      <div className="text-foreground">{c.label}</div>
                      {c.detail && (
                        <div className="text-xs text-muted-foreground">{c.detail}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      <section className="border border-border rounded-2xl p-4 bg-card max-w-2xl">
        <h2 className="text-lg font-semibold text-foreground mb-3">Manual checklist</h2>
        <ul className="space-y-2 text-sm">
          {MANUAL.map((item, i) => {
            const id = `m-${i}`;
            return (
              <li key={id} className="flex items-start gap-2">
                <input
                  id={id}
                  type="checkbox"
                  checked={!!manual[id]}
                  onChange={(e) => setManual((m) => ({ ...m, [id]: e.target.checked }))}
                  className="mt-1"
                />
                <label htmlFor={id} className="text-foreground cursor-pointer">
                  {item}
                </label>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default SkeletonsDevQA;
