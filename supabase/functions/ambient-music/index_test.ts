import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { call, drain } from "../_shared/test-helpers.ts";

const FN = "ambient-music";

Deno.test(`${FN} - OPTIONS preflight returns CORS headers`, async () => {
  const res = await call(FN, { method: "OPTIONS" });
  await drain(res);
  assert(res.status >= 200 && res.status < 300, `status ${res.status}`);
  assertEquals(res.headers.get("access-control-allow-origin"), "*");
});

Deno.test(`${FN} - POST without Authorization returns 401`, async () => {
  const res = await call(FN, { method: "POST", body: JSON.stringify({ type: "breathing" }) });
  const json = await res.json();
  assertEquals(res.status, 401);
  assertEquals(json.error, "Unauthorized");
});

Deno.test(`${FN} - POST with bogus Bearer token returns 401`, async () => {
  const res = await call(FN, {
    method: "POST",
    headers: { Authorization: "Bearer not-a-real-jwt" },
    body: JSON.stringify({ type: "breathing" }),
  });
  const json = await res.json();
  assertEquals(res.status, 401);
  assertEquals(json.error, "Unauthorized");
});
