-- Drop the problematic trigger on auth.users that causes FK violations during OAuth signup
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;