
-- Revoke EXECUTE from anon AND authenticated for internal/admin/trigger functions
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_subscription() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_content_length() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_level_from_xp(integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_user_xp(uuid, integer, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_user_karma(uuid, integer, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_badge(uuid, text, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_forum_reply_count(uuid, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_forum_post_likes(uuid, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.count_recent_actions(uuid, text, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_count_users() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated;

-- Revoke EXECUTE from anon only (keep authenticated access) for user-facing functions
REVOKE EXECUTE ON FUNCTION public.is_premium_user(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_public_profile(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_poll_vote_counts(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_user_blocked(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.find_partner_candidates(uuid, uuid[], integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.initialize_user_xp(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.initialize_user_karma(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.toggle_leaderboard_visibility(uuid, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.claim_daily_login_reward(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.redeem_invite_code(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_use_streak_freeze(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.use_streak_freeze(uuid, text, date) FROM anon;
