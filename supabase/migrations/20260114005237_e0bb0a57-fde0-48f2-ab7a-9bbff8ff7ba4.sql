-- Enable realtime for tables that need cross-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prevention_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sleep_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trigger_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_streaks;

-- Set replica identity for proper change tracking
ALTER TABLE public.challenge_progress REPLICA IDENTITY FULL;
ALTER TABLE public.prevention_plans REPLICA IDENTITY FULL;
ALTER TABLE public.sleep_entries REPLICA IDENTITY FULL;
ALTER TABLE public.mood_entries REPLICA IDENTITY FULL;
ALTER TABLE public.trigger_entries REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.daily_goals REPLICA IDENTITY FULL;
ALTER TABLE public.user_streaks REPLICA IDENTITY FULL;

-- Add unique constraint on sleep_entries for upsert to work correctly
ALTER TABLE public.sleep_entries ADD CONSTRAINT sleep_entries_user_date_unique UNIQUE (user_id, date);

-- Add unique constraint on mood_entries for upsert to work correctly  
ALTER TABLE public.mood_entries ADD CONSTRAINT mood_entries_user_date_unique UNIQUE (user_id, date);