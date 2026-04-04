-- Remove the foreign key constraint on subscriptions that causes OAuth signup failures.
-- The user_id integrity is already enforced by the trigger chain (auth.users -> profiles -> subscriptions).
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;