
-- 1) Harden user_roles: block all client-side INSERT/UPDATE/DELETE with RESTRICTIVE policies.
-- Role grants must be performed via service-role migrations only, eliminating the
-- "first admin grabs role" bootstrap risk.
DROP POLICY IF EXISTS "Only admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can revoke roles" ON public.user_roles;

CREATE POLICY "Block client-side role inserts"
  ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "Block client-side role updates"
  ON public.user_roles AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "Block client-side role deletes"
  ON public.user_roles AS RESTRICTIVE FOR DELETE TO authenticated
  USING (false);

-- 2) Convert user_karma write-blocks from PERMISSIVE to RESTRICTIVE so future
-- permissive policies can never accidentally re-open writes.
DROP POLICY IF EXISTS "Block direct karma inserts" ON public.user_karma;
DROP POLICY IF EXISTS "Block direct karma updates" ON public.user_karma;
DROP POLICY IF EXISTS "Block direct karma deletes" ON public.user_karma;

CREATE POLICY "Block direct karma inserts"
  ON public.user_karma AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "Block direct karma updates"
  ON public.user_karma AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "Block direct karma deletes"
  ON public.user_karma AS RESTRICTIVE FOR DELETE TO authenticated
  USING (false);
