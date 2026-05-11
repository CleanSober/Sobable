import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { call, drain } from "../_shared/test-helpers.ts";

const FN = "validate-iap-receipt";

Deno.test(`${FN} - OPTIONS preflight`, async () => {
  const res = await call(FN, { method: "OPTIONS" });
  await drain(res);
  assert(res.ok || res.status === 204);
});

// This function uses default verify_jwt=true, so the gateway rejects unauthed.
Deno.test(`${FN} - missing auth → 401`, async () => {
  const res = await call(FN, {
    method: "POST",
    headers: { Authorization: "" },
    body: JSON.stringify({}),
  });
  await drain(res);
  assertEquals(res.status, 401);
});
