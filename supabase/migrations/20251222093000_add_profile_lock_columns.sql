-- Add missing Profile Lock columns used by Settings/Profile lock modals
-- (Fixes: "Could not find the 'profile_lock_enabled' column of 'user_profiles' in the schema cache")

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS profile_lock_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_lock_password_hash TEXT;

-- Safety backfill (in case of legacy nullable column state)
UPDATE public.user_profiles
SET profile_lock_enabled = COALESCE(profile_lock_enabled, false)
WHERE profile_lock_enabled IS NULL;


