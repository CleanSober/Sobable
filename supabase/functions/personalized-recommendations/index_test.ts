import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { call, drain } from "../_shared/test-helpers.ts";

const FN = "personalized-recommendations";

Deno.test(`${FN} - OPTIONS preflight`, async () => {
  const res = await call(FN, { method: "OPTIONS" });
  await drain(res);
  assert(res.ok || res.status === 204);
});

Deno.test(`${FN} - missing auth → 401`, async () => {
  const res = await call(FN, { method: "POST", body: "{}" });
  await drain(res);
  assertEquals(res.status, 401);
});

Deno.test(`${FN} - bogus token → 401`, async () => {
  const res = await call(FN, {
    method: "POST",
    headers: { Authorization: "Bearer xxx" },
    body: "{}",
  });
  await drain(res);
  assertEquals(res.status, 401);
});
