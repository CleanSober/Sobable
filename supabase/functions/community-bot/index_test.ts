import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { call, drain } from "../_shared/test-helpers.ts";

const FN = "community-bot";

Deno.test(`${FN} - OPTIONS preflight`, async () => {
  const res = await call(FN, { method: "OPTIONS" });
  await drain(res);
  assert(res.ok || res.status === 204);
  assertEquals(res.headers.get("access-control-allow-origin"), "*");
});

Deno.test(`${FN} - missing auth → 401`, async () => {
  const res = await call(FN, { method: "POST", body: JSON.stringify({}) });
  const json = await res.json();
  assertEquals(res.status, 401);
  assertEquals(json.error, "Unauthorized");
});

Deno.test(`${FN} - bogus token → 401`, async () => {
  const res = await call(FN, {
    method: "POST",
    headers: { Authorization: "Bearer junk.jwt.token" },
    body: JSON.stringify({ postId: "x", postContent: "y" }),
  });
  const json = await res.json();
  assertEquals(res.status, 401);
  assertEquals(json.error, "Unauthorized");
});
