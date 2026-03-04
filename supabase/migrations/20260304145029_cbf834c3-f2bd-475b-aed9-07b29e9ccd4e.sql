
-- Move pgcrypto extension from public to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pgcrypto SET SCHEMA extensions;

-- Update the friend_invitations default to use the new schema path
ALTER TABLE public.friend_invitations 
ALTER COLUMN invite_code SET DEFAULT encode(extensions.gen_random_bytes(6), 'hex'::text);
