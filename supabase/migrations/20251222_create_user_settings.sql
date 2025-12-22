-- Create user_settings table (Stage 1 defaults + Stage 4 persistence)

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Preferences
  language TEXT NOT NULL DEFAULT 'en',
  theme TEXT NOT NULL DEFAULT 'light',
  currency TEXT NOT NULL DEFAULT 'USD',
  text_size INTEGER NOT NULL DEFAULT 16,
  reduce_motion BOOLEAN NOT NULL DEFAULT false,

  -- Notifications (keep a flexible JSONB structure for existing UI)
  notification_preferences JSONB NOT NULL DEFAULT '{
    "master_enabled": true,
    "expiry_warnings": { "push": true, "email": true, "in_app": true },
    "renewal_reminders": { "push": true, "email": true, "in_app": true },
    "family_shares": { "push": true, "email": true, "in_app": true },
    "system_updates": { "push": true, "email": true, "in_app": true },
    "reminder_timing": [30, 7, 1]
  }'::jsonb,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  notifications_push BOOLEAN NOT NULL DEFAULT true,
  notifications_email BOOLEAN NOT NULL DEFAULT true,
  notifications_sms BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,

  -- Privacy
  analytics_enabled BOOLEAN NOT NULL DEFAULT true,
  face_detection_enabled BOOLEAN NOT NULL DEFAULT false,
  cloud_ocr_sync_enabled BOOLEAN NOT NULL DEFAULT false,

  -- MFA
  mfa_backup_codes JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Users can read their own settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can view their own user settings'
  ) THEN
    CREATE POLICY "Users can view their own user settings"
      ON public.user_settings
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- Users can insert their own settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can insert their own user settings'
  ) THEN
    CREATE POLICY "Users can insert their own user settings"
      ON public.user_settings
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can update their own settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users can update their own user settings'
  ) THEN
    CREATE POLICY "Users can update their own user settings"
      ON public.user_settings
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_user_settings_updated_at();

-- Create default settings row on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_user_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_user_settings
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_settings();

-- Backfill for existing users
INSERT INTO public.user_settings (user_id)
SELECT u.id
FROM auth.users u
LEFT JOIN public.user_settings s ON s.user_id = u.id
WHERE s.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;


