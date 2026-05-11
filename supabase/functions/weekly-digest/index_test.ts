import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { call, drain } from "../_shared/test-helpers.ts";

const FN = "weekly-digest";

Deno.test(`${FN} - OPTIONS preflight`, async () => {
  const res = await call(FN, { method: "OPTIONS" });
  await drain(res);
  assert(res.ok || res.status === 204);
});

// weekly-digest accepts cron / unauth invocation but per-user paths require auth.
// We exercise the most predictable failure: invalid auth header for a user-scoped call.
Deno.test(`${FN} - bogus user token → 401 or 403`, async () => {
  const res = await call(FN, {
    method: "POST",
    headers: { Authorization: "Bearer not-real" },
    body: JSON.stringify({ userId: "00000000-0000-0000-0000-000000000000" }),
  });
  await drain(res);
  // Function may return 401 (auth fail) or 403 (mismatch); both prove the guard runs.
  assert([401, 403].includes(res.status), `unexpected status ${res.status}`);
});
