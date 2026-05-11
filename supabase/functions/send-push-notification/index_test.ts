import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { call, drain } from "../_shared/test-helpers.ts";

const FN = "send-push-notification";

Deno.test(`${FN} - OPTIONS preflight`, async () => {
  const res = await call(FN, { method: "OPTIONS" });
  await drain(res);
  assert(res.ok || res.status === 204);
});

// verify_jwt=false in this function — no caller auth required, so we test
// validation-required path (missing title/body returns 400).
Deno.test(`${FN} - missing title/body → 400`, async () => {
  const res = await call(FN, {
    method: "POST",
    body: JSON.stringify({ user_id: "00000000-0000-0000-0000-000000000000" }),
  });
  const json = await res.json();
  assertEquals(res.status, 400);
  assert(/title and body are required/i.test(json.error ?? ""));
});
