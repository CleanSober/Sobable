
-- Fix 1: Profiles RLS - restrict SELECT to own profile only (sensitive data exposure)
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix 2: Add unique constraint on mood_entries(user_id, date) for upsert to work
CREATE UNIQUE INDEX IF NOT EXISTS mood_entries_user_id_date_unique ON public.mood_entries (user_id, date);

-- Fix 3: Add unique constraint on daily_goals(user_id, date) for upsert to work  
CREATE UNIQUE INDEX IF NOT EXISTS daily_goals_user_id_date_unique ON public.daily_goals (user_id, date);

-- Fix 4: Add unique constraint on sleep_entries(user_id, date) for upsert to work
CREATE UNIQUE INDEX IF NOT EXISTS sleep_entries_user_id_date_unique ON public.sleep_entries (user_id, date);
