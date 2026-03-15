
-- Recreate the view with SECURITY INVOKER so it respects RLS on subscriptions
DROP VIEW IF EXISTS public.subscriptions_safe;

CREATE VIEW public.subscriptions_safe
WITH (security_invoker = on)
AS
SELECT id, user_id, plan_type, status, current_period_start, current_period_end, created_at, updated_at
FROM public.subscriptions;
