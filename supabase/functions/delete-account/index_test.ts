import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { call, drain } from "../_shared/test-helpers.ts";

const FN = "delete-account";

Deno.test(`${FN} - OPTIONS preflight`, async () => {
  const res = await call(FN, { method: "OPTIONS" });
  await drain(res);
  assert(res.ok || res.status === 204);
});

Deno.test(`${FN} - missing auth header → 401`, async () => {
  const res = await call(FN, { method: "POST" });
  const json = await res.json();
  assertEquals(res.status, 401);
  assert(typeof json.error === "string");
});

Deno.test(`${FN} - invalid token → 401`, async () => {
  const res = await call(FN, {
    method: "POST",
    headers: { Authorization: "Bearer invalid" },
  });
  const json = await res.json();
  assertEquals(res.status, 401);
  assertEquals(json.error, "Unauthorized");
});
