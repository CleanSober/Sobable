## Scope

Six distinct issues to address. I'll tackle them in priority order (blockers first), grouping related work.

### 1. Account Creation / Email Signup (BLOCKER)
- Investigate `Auth.tsx` and `AuthContext.signUp` flow — users stuck on "Welcome to…" screen
- Verify redirect logic after signup (likely `needsConfirmation` not handled, or splash/onboarding gate is blocking)
- Check Supabase auth config: confirm email enabled? Auth email hook deployed?
- Set up branded auth email templates via Lovable's auth email system so verification emails actually deliver (currently using default Supabase emails which may not deliver reliably without a verified sender domain)
- Surface clear UI state: "Check your email to verify" message instead of stuck screen

### 2. Premium Subscription Not Activating After Payment
- Add polling to post-checkout return flow: call `check-subscription` edge function repeatedly (up to ~20s) until `plan_type` flips off `free`
- Ensure `usePremiumStatus` / `useSubscription` refetches on window focus and after Stripe redirect
- Verify Stripe webhook → `subscriptions` table sync is wired (inspect `create-checkout` and `check-subscription` functions)

### 3. Profile Navigation Trap
- Inspect `/profile` route (`src/pages/Profile.tsx`) — add a back button / close affordance returning to `/`
- Ensure header back nav works on all sub-screens

### 4. Date Selection (Sober Date / DOB)
- Replace any native `<input type="date">` and any `new Date(str)` parsing with the Shadcn DatePicker + UTC-safe parsing
- Add year/month dropdowns (via `captionLayout="dropdown"` on `Calendar`) so users jump years quickly
- Fix off-by-one: store/display dates as `YYYY-MM-DD` UTC, never let local timezone shift them
- Audit: Onboarding sober-date step, Profile sober-date editor, any DOB field

### 5. Swipe & Sliders
- Review `useSwipeNavigation` — likely too sensitive, triggering page changes on slider drags
- Disable global swipe-to-navigate on screens that contain Radix Sliders, OR raise threshold + ignore touches that started on `[role="slider"]` / inputs
- Audit Slider usages for missing `onValueChange` wiring

### 6. Personalization by Recovery Type
- Audit `substanceConfig.ts` consumers — confirm motivational content, daily check-ins, recommendations, community filters use the user's selected substance
- Wire any unhooked surfaces (motivation banner, recommendations, community feed default filter) to read from `profiles.substances`
- Skip the "onboarding/tutorial flow" expansion for now — current onboarding already exists; deeper tutorial can be a follow-up

## Approach

I'll deliver these in two passes:

**Pass A (this turn):** Fixes 1–5 (the bugs that block users today).
**Pass B (next turn):** Personalization audit + any remaining polish.

This keeps each turn reviewable and avoids one huge unreadable diff.

## Question for you

Two things I want to confirm before starting:

1. **Email verification:** Do you want me to set up branded Lovable auth emails (requires picking a sender domain), or should I switch the project to **auto-confirm signups** so users skip email verification entirely? Auto-confirm is faster to ship but less secure.
2. **Swipe navigation:** Do you want me to (a) keep swipe nav but make it less sensitive and ignore slider areas, or (b) remove app-wide swipe navigation entirely?
