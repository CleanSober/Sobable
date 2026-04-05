ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS ios_apns_token TEXT,
ADD COLUMN IF NOT EXISTS ios_fcm_token TEXT;