# In-App Purchase QA Checklist (Apple & Google)

End-to-end manual QA pass to confirm Sober Club premium unlocks **instantly**
after a purchase or restore on iOS / Android, with **no flashing locked
content** anywhere in the app.

Run the full checklist on:
- [ ] iOS device (TestFlight build, real Sandbox tester, **not** Xcode StoreKit
      config — those transactions never reach Apple servers and bypass our
      validator)
- [ ] Android device (Internal testing track, license tester account)

---

## 0. Pre-flight

- [ ] App built from latest `main`, installed via TestFlight / Internal track
- [ ] Signed in as a test user with **no** active subscription
      (verify in DB: no `subscriptions` row with `plan_type IN ('premium','pro')`
      and `status IN ('active','trialing')` for this user)
- [ ] Network conditioner / Wi-Fi available — repeat key flows once on slow 3G
      to surface race conditions
- [ ] Console attached (Safari Web Inspector for iOS, `chrome://inspect` for
      Android) and filter for `[IAP]` and `[VALIDATE-IAP]`

---

## 1. Fresh purchase — Monthly

For each platform:

- [ ] Open Profile → "Upgrade" (or any locked feature → "Unlock with Sober Club")
- [ ] Tap **Monthly** plan
- [ ] Native purchase sheet appears within 2s — never spins indefinitely
- [ ] Complete purchase with sandbox / license-tester account
- [ ] Toast `Welcome to Sober Club! 🎉` appears
- [ ] **Lock overlays disappear immediately** on the same screen (no reload)
- [ ] Open AI Recovery Coach, Smart Risk Score, Predictive Insights, Weekly
      Recap, Guided Pathways, Accountability Partner, Premium Analytics —
      every section is unlocked **on first navigation** with no skeleton →
      lock → unlock flicker
- [ ] Profile card shows `Sober Club` plan name and renewal date
- [ ] DB check: `subscriptions` row exists with
      `stripe_subscription_id` starting `iap_ios_` or `iap_android_` and
      `current_period_end` ~1 month out

## 2. Fresh purchase — Yearly

- [ ] Repeat section 1, choose **Yearly**
- [ ] `current_period_end` is ~1 year out

## 3. Cancellation mid-flow

- [ ] Tap Monthly, dismiss the native sheet (Cancel)
- [ ] No error toast (cancellation is silent)
- [ ] Button returns to active state within 1s — never stuck on "Purchasing…"
- [ ] No `subscriptions` row created

## 4. Server timeout / failure

- [ ] Toggle airplane mode after dismissing the native sheet but before the
      validate call (or use Charles to fail `validate-iap-receipt`)
- [ ] Toast surfaces a clear error message (not a stack trace)
- [ ] Button recovers; user can retry
- [ ] Still no premium unlock until validation succeeds

## 5. Restore Purchases

Test each on a device that has an existing entitlement (use the same sandbox /
license-tester account that purchased above, then sign out + sign in, or
reinstall the app):

- [ ] Profile → "Restore Purchases"
- [ ] Toast: `Purchases restored! Premium access is active.`
- [ ] Lock overlays disappear immediately across every premium surface
- [ ] If no prior purchase exists: toast `No previous purchases found…`,
      premium stays locked

## 6. Fallback sync (event missed)

This validates the auto-heal path in `useInAppPurchases`:

- [ ] On a device with an active store subscription, manually delete the
      `subscriptions` row in the DB (admin)
- [ ] Force-quit the app and relaunch
- [ ] Within ~2s of mount, premium unlocks automatically (no user action)
- [ ] Console shows the validate call firing without a purchase being made

## 7. Retry re-dispatch (event delayed)

- [ ] In DevTools, listen for `premium-status-refresh` events on `window`
- [ ] Make a fresh purchase
- [ ] Verify the event fires immediately **and** at ~1.5s, ~4s, ~9s
      (matches the retry schedule)

## 8. No flashing locked content (regression)

For each premium surface, with a freshly-purchased account, hard-reload the
app and confirm:

- [ ] AI Recovery Coach — shows skeleton → unlocked content
      (never skeleton → lock → unlocked)
- [ ] Smart Risk Score — same
- [ ] Predictive Insights — same
- [ ] Weekly Recap — same
- [ ] Guided Pathways — same
- [ ] Accountability Partner — same
- [ ] Premium Analytics (Progress tab) — same
- [ ] Community Hub premium sections — same

The shared rule: while `usePremiumStatus().loading === true`, gated wrappers
render a neutral skeleton, **not** the lock CTA. Verified in
`PremiumFeatureSection.tsx` and `PremiumLockOverlay.tsx`.

## 9. Cross-tab / focus refresh

- [ ] Background the app (lock screen / app switcher)
- [ ] In another browser tab as admin, mark the subscription `cancelled`
- [ ] Foreground the app — within ~1s premium surfaces re-lock
      (driven by the `focus` listener)
- [ ] Reverse: re-activate the row, foreground again, premium unlocks

## 10. Sign-out / sign-in

- [ ] Sign out — premium state resets to free immediately
- [ ] Sign back in — premium re-applies on first auth event, no flash

---

## Pass criteria

All boxes checked on **both iOS and Android** with:
- Zero observed lock → unlock flickers
- Zero stuck "Purchasing…" buttons
- Zero cases where the DB has an active subscription but the UI still shows
  locked after a foreground / hard reload
