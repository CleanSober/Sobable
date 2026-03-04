
-- Enable leaked password protection via auth config
-- This is done via Supabase dashboard/API, not SQL migration
-- Instead, let's fix the extension_in_public warning by moving pgcrypto
-- Actually, we can't move extensions via migration safely. 
-- Let's just ensure content_reports has proper admin-only access for review actions

-- Fix content_reports: only admins/moderators can update reports
DROP POLICY IF EXISTS "Admins can update reports" ON public.content_reports;

CREATE POLICY "Admins can update reports"
ON public.content_reports
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')
);

-- Fix user_bans: only admins can view/create/delete bans  
DROP POLICY IF EXISTS "Admins can view bans" ON public.user_bans;
DROP POLICY IF EXISTS "Anyone can view bans" ON public.user_bans;

CREATE POLICY "Admins can view bans"
ON public.user_bans
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')
);

DROP POLICY IF EXISTS "Admins can delete bans" ON public.user_bans;

CREATE POLICY "Admins can delete bans"
ON public.user_bans
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')
);
