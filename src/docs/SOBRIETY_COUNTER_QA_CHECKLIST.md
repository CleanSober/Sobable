# Sobriety Counter — QA Checklist

Goal: the counter renders Days, Months, and Years consistently — **never** showing Weeks, hidden units, or a flash of stale/incorrect values across reloads, resets, or mode toggles.

## Pre-flight
- Logged-in account with a valid `sobriety_start_date`.
- A second guest-mode session (localStorage start date) for parity testing.
- Browser DevTools open with React Profiler + Network tab.
- Test devices: web (desktop), iOS Safari, Android Chrome, native Capacitor build.

## Unit-rendering invariants (must always hold)
- [ ] Grid always renders **exactly 3 cells**: Days, Months, Years — in that order.
- [ ] **No "Weeks"** label appears anywhere in the counter at any moment, including initial paint and skeleton → data transition.
- [ ] No additional units (Hours, Minutes, Decades) ever render.
- [ ] When a unit value is `0`, the cell still renders with `0` — it is **not** hidden, removed from the grid, or replaced by a dash.
- [ ] Pluralization labels match the current value: `1 Day` / `2 Days`, `1 Month` / `0 Months`, `1 Year` / `5 Years`. Never `1 Days` or `2 Day`.
- [ ] Summary line under the ring matches the grid values exactly (no drift between ring text and grid numbers).

## No-flash guarantees
- [ ] On hard reload (Cmd+Shift+R), the counter shows skeleton → final values directly. No intermediate render with `0 / 0 / 0` if `daysSober > 0`.
- [ ] No transient render of the **approx** breakdown when the user has Exact mode toggled on (and vice versa).
- [ ] Toggling Approx ↔ Exact swaps all 3 cells in the same frame — no cell briefly shows the previous mode's value.
- [ ] Ring percentage and "% → next milestone" text update together with the day count, not on a separate tick.
- [ ] Switching between tabs / backgrounding the app and returning does **not** cause a Weeks label or stale value to appear during rehydration.

## Reset / start-date change flows
- [ ] Changing `sobriety_start_date` via Profile → Edit Date updates the counter within 1s with no intermediate "0 / 0 / 0" flash if the new date is in the past.
- [ ] Resetting to today shows `0 Days · 0 Months · 0 Years` with the day-zero milestone copy ("Day one — the bravest step.") — never blank, never Weeks.
- [ ] After reset, ring fills to `0%` smoothly; previous fill does not linger.
- [ ] Undoing a reset (within the 24h window) restores the prior breakdown without a Weeks flash.

## Cross-session consistency
- [ ] Sign out → sign in: counter restores identical Days/Months/Years on first paint after auth resolves.
- [ ] Guest → migrated account: post-migration counter matches the pre-migration values exactly.
- [ ] Two devices signed into the same account display the same Days/Months/Years (within clock skew of <1 day).
- [ ] Force-quit native app → relaunch: splash → counter direct, no Weeks flash, no `NaN`, no negative values.

## Edge cases
- [ ] Day 0: shows `0 / 0 / 0` and milestone copy. Ring at 0%.
- [ ] Day 1: `1 Day · 0 Months · 0 Years` with singular "Day".
- [ ] Day 365: Exact mode shows `0 Days · 0 Months · 1 Year`; Approx shows `0 / 0 / 1`.
- [ ] Day 10,000: shows e.g. `5 Days · 4 Months · 27 Years` (Approx) — values match the cascading math, no overflow.
- [ ] Leap-year start date in Exact mode: Feb 29 → next non-leap year does not produce negative days or NaN.
- [ ] Future-dated start (data error): counter clamps to `0 / 0 / 0` and does **not** render negative numbers.
- [ ] Timezone change on device: values recompute correctly on next mount; no Weeks flash mid-recompute.

## Regression scripts
- [ ] `rg -n "Week" src/components/SobrietyCounter.tsx` returns **no matches**.
- [ ] `rg -n "weeks" src/components/SobrietyCounter.tsx` returns **no matches**.
- [ ] Snapshot test: render at days = 0, 1, 7, 30, 365, 10000 — assert exactly 3 grid cells with labels matching `/^(Day|Days|Month|Months|Year|Years)$/`.
- [ ] Snapshot test: assert no rendered text matches `/week/i` for any of the above inputs.
- [ ] Toggle test: flip Exact ↔ Approx 10x rapidly; assert grid still has 3 cells and no "Week" text appears in any frame (use `act` + sequential renders).

## Pass criteria
- Zero observed "Weeks" labels in any state.
- Zero frames with fewer than 3 unit cells once data has loaded.
- Zero mismatches between ring summary text and grid values.
- Zero stale renders after reset, sign-out/in, or background → foreground.
