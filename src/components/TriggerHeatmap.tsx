import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// 4-hour buckets keep the grid readable on mobile (440px viewport)
const BUCKETS = [
  { label: "12a", start: 0 },
  { label: "4a", start: 4 },
  { label: "8a", start: 8 },
  { label: "12p", start: 12 },
  { label: "4p", start: 16 },
  { label: "8p", start: 20 },
];

interface TriggerRow {
  date: string;
  time: string;
  intensity: number;
}

export const TriggerHeatmap = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<TriggerRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 90);
      const { data } = await supabase
        .from("trigger_entries")
        .select("date, time, intensity")
        .eq("user_id", user.id)
        .gte("date", since.toISOString().slice(0, 10));
      if (!cancelled) setRows((data as TriggerRow[]) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const { grid, max, total, peak } = useMemo(() => {
    // grid[day 0..6 Mon..Sun][bucket 0..5] = sum of intensity
    const g: number[][] = Array.from({ length: 7 }, () => Array(BUCKETS.length).fill(0));
    const counts: number[][] = Array.from({ length: 7 }, () => Array(BUCKETS.length).fill(0));
    let m = 0;
    let t = 0;
    let peakInfo: { day: string; bucket: string; score: number } | null = null;

    (rows ?? []).forEach((r) => {
      if (!r.date || !r.time) return;
      const d = new Date(`${r.date}T${r.time}`);
      if (isNaN(d.getTime())) return;
      // JS getDay: 0=Sun..6=Sat. Convert to 0=Mon..6=Sun.
      const dow = (d.getDay() + 6) % 7;
      const hour = d.getHours();
      const bIdx = Math.min(BUCKETS.length - 1, Math.floor(hour / 4));
      const intensity = Math.max(1, Math.min(10, r.intensity ?? 1));
      g[dow][bIdx] += intensity;
      counts[dow][bIdx] += 1;
      t += 1;
      if (g[dow][bIdx] > m) {
        m = g[dow][bIdx];
        peakInfo = { day: DAYS[dow], bucket: BUCKETS[bIdx].label, score: g[dow][bIdx] };
      }
    });

    return { grid: g, counts, max: m, total: t, peak: peakInfo };
  }, [rows]);

  if (rows === null) {
    return (
      <Card className="p-4 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-destructive" />
            Risk Window Heatmap
          </h3>
          <p className="text-xs text-muted-foreground">
            When triggers tend to hit you (last 90 days)
          </p>
        </div>
      </div>

      {total === 0 ? (
        <div className="rounded-md bg-muted/40 p-4 text-center text-xs text-muted-foreground flex items-center gap-2 justify-center">
          <Info className="w-3.5 h-3.5" />
          Log a few triggers to see your risk windows.
        </div>
      ) : (
        <>
          <div className="overflow-hidden">
            {/* Header: time buckets */}
            <div className="grid grid-cols-[28px_repeat(6,1fr)] gap-1 mb-1">
              <div />
              {BUCKETS.map((b) => (
                <div key={b.label} className="text-[9px] text-muted-foreground text-center">
                  {b.label}
                </div>
              ))}
            </div>
            {/* Rows */}
            {DAYS.map((day, dIdx) => (
              <div key={day} className="grid grid-cols-[28px_repeat(6,1fr)] gap-1 mb-1">
                <div className="text-[10px] text-muted-foreground self-center">{day}</div>
                {BUCKETS.map((b, bIdx) => {
                  const score = grid[dIdx][bIdx];
                  const intensity = max > 0 ? score / max : 0;
                  const bg =
                    score === 0
                      ? "hsl(var(--muted) / 0.4)"
                      : `hsl(var(--destructive) / ${0.18 + intensity * 0.65})`;
                  return (
                    <div
                      key={b.label}
                      className="aspect-square rounded-sm flex items-center justify-center text-[9px] font-medium"
                      style={{ backgroundColor: bg }}
                      title={`${day} ${b.label}: ${score === 0 ? "no triggers" : `risk score ${score}`}`}
                    >
                      {score > 0 && intensity > 0.4 ? (
                        <span className="text-destructive-foreground">{score}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {peak && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs">
              <span className="font-medium text-destructive">Highest risk window: </span>
              <span className="text-foreground/80">
                {peak.day} around {peak.bucket}. Plan ahead with a coping strategy.
              </span>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default TriggerHeatmap;
