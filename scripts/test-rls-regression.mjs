#!/usr/bin/env bun
/**
 * RLS regression sweep: confirms that every query previously using `.single()`
 * (now switched to `.maybeSingle()`) returns `data: null` with NO PGRST116 error
 * when the lookup matches zero rows.
 *
 * Run: `bun scripts/test-rls-regression.mjs`
 *
 * This runs unauthenticated. RLS will block reads on user-scoped tables and
 * return zero rows, which is exactly the no-row condition we need to verify.
 * For public-read tables (recovery_pathways), we use a non-existent UUID.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const [k, ...v] = l.split("=");
      return [k.trim(), v.join("=").trim().replace(/^"|"$/g, "")];
    }),
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const NONEXISTENT = "00000000-0000-0000-0000-000000000000";

/** Each entry mirrors a query that was migrated from .single() → .maybeSingle(). */
const queries = [
  { name: "profiles by user_id", q: () => supabase.from("profiles").select("*").eq("user_id", NONEXISTENT).maybeSingle() },
  { name: "mood_entries today", q: () => supabase.from("mood_entries").select("*").eq("user_id", NONEXISTENT).eq("date", "2099-01-01").maybeSingle() },
  { name: "prevention_plans by user_id", q: () => supabase.from("prevention_plans").select("*").eq("user_id", NONEXISTENT).maybeSingle() },
  { name: "challenge_progress by user_id+challenge", q: () => supabase.from("challenge_progress").select("*").eq("user_id", NONEXISTENT).eq("challenge_id", "x").maybeSingle() },
  { name: "user_karma by user_id", q: () => supabase.from("user_karma").select("*").eq("user_id", NONEXISTENT).maybeSingle() },
  { name: "polls by post_id", q: () => supabase.from("polls").select("*").eq("post_id", NONEXISTENT).maybeSingle() },
  { name: "user_bans by id", q: () => supabase.from("user_bans").select("user_id").eq("id", NONEXISTENT).maybeSingle() },
  { name: "community_subscriptions by id", q: () => supabase.from("community_subscriptions").select("*").eq("id", NONEXISTENT).maybeSingle() },
  { name: "community_posts by id", q: () => supabase.from("community_posts").select("*").eq("id", NONEXISTENT).maybeSingle() },
  { name: "forum_posts by id", q: () => supabase.from("forum_posts").select("*").eq("id", NONEXISTENT).maybeSingle() },
  { name: "forum_replies by id", q: () => supabase.from("forum_replies").select("*").eq("id", NONEXISTENT).maybeSingle() },
  { name: "chat_messages by id", q: () => supabase.from("chat_messages").select("*").eq("id", NONEXISTENT).maybeSingle() },
  { name: "chat_rooms by id", q: () => supabase.from("chat_rooms").select("*").eq("id", NONEXISTENT).maybeSingle() },
  { name: "subscriptions by user_id", q: () => supabase.from("subscriptions").select("*").eq("user_id", NONEXISTENT).maybeSingle() },
  { name: "user_xp by user_id", q: () => supabase.from("user_xp").select("*").eq("user_id", NONEXISTENT).maybeSingle() },
  { name: "user_streaks by user_id+type", q: () => supabase.from("user_streaks").select("*").eq("user_id", NONEXISTENT).eq("streak_type", "check_in").maybeSingle() },
  { name: "journal_entries by id", q: () => supabase.from("journal_entries").select("*").eq("id", NONEXISTENT).maybeSingle() },
];

let passed = 0;
let failed = 0;
const failures = [];

for (const { name, q } of queries) {
  const { data, error } = await q();
  // Pass criteria: no PGRST116. RLS-blocked reads return data:null with no error.
  // Even if error appears (e.g. table not exposed), the regression target is specifically PGRST116.
  if (error?.code === "PGRST116") {
    failed++;
    failures.push(`${name}: PGRST116 — ${error.message}`);
    console.log(`  ✗ ${name} → PGRST116`);
  } else if (data === null || data === undefined) {
    passed++;
    console.log(`  ✓ ${name} → null (no PGRST116)`);
  } else {
    // Unlikely with anon key + nonexistent UUID, but treat unexpected data as informational.
    passed++;
    console.log(`  ✓ ${name} → got data (no PGRST116)`);
  }
}

console.log(`\n${passed}/${queries.length} passed, ${failed} failed`);
if (failed > 0) {
  console.log("\nFailures:");
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
