-- Add account role to user_profiles: user | parent | child

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS account_role TEXT NOT NULL DEFAULT 'user'
  CHECK (account_role IN ('user', 'parent', 'child'));


