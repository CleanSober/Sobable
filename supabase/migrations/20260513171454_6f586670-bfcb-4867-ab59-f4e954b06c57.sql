
CREATE TABLE IF NOT EXISTS public.ambient_music_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'rewarded_ad',
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour'),
  consumed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ambient_music_passes_user_active
  ON public.ambient_music_passes (user_id, expires_at)
  WHERE consumed_at IS NULL;

ALTER TABLE public.ambient_music_passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ambient music passes"
  ON public.ambient_music_passes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
