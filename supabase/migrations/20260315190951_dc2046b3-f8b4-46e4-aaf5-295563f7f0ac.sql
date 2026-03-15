ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS weekly_digest_enabled boolean NOT NULL DEFAULT true;