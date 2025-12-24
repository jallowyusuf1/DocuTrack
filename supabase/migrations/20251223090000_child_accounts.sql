-- Parent-side supervised child accounts (13-17)

CREATE TABLE IF NOT EXISTS public.child_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age_years INTEGER GENERATED ALWAYS AS (date_part('year', age(date_of_birth))) STORED,
  relationship TEXT NOT NULL CHECK (relationship IN ('son', 'daughter', 'dependent', 'other')),

  oversight_level TEXT NOT NULL CHECK (oversight_level IN ('full_supervision', 'monitored_access', 'limited_independence')) DEFAULT 'full_supervision',
  permissions JSONB NOT NULL DEFAULT '{
    "view_family_documents": true,
    "add_new_documents": true,
    "edit_documents": false,
    "delete_documents": false,
    "share_documents_externally": false
  }'::jsonb,
  notification_preferences JSONB NOT NULL DEFAULT '{
    "activity_summary": "weekly",
    "alert_on_delete": true,
    "alert_on_share": true,
    "alert_on_account_changes": true
  }'::jsonb,

  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'deleted')) DEFAULT 'active',

  consented_at TIMESTAMPTZ NOT NULL,
  consent_ip TEXT,

  avatar_url TEXT,
  last_active_at TIMESTAMPTZ,
  document_count INTEGER NOT NULL DEFAULT 0,
  auto_convert_on_18 BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_child_accounts_parent_id ON public.child_accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_child_accounts_child_user_id ON public.child_accounts(child_user_id);

-- Requests from child -> parent
CREATE TABLE IF NOT EXISTS public.child_account_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_account_id UUID REFERENCES public.child_accounts(id) ON DELETE CASCADE NOT NULL,
  requested_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  request_type TEXT NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  message TEXT,

  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')) DEFAULT 'pending',
  denial_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_child_account_requests_child_account_id ON public.child_account_requests(child_account_id);
CREATE INDEX IF NOT EXISTS idx_child_account_requests_status ON public.child_account_requests(status);

-- Activity log (audit trail)
CREATE TABLE IF NOT EXISTS public.child_account_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_account_id UUID REFERENCES public.child_accounts(id) ON DELETE CASCADE NOT NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'pending', 'denied', 'failed')) DEFAULT 'success',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_child_account_activity_child_account_id ON public.child_account_activity(child_account_id);
CREATE INDEX IF NOT EXISTS idx_child_account_activity_created_at ON public.child_account_activity(created_at);

-- updated_at trigger (shared)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_child_accounts_updated_at ON public.child_accounts;
CREATE TRIGGER set_child_accounts_updated_at
BEFORE UPDATE ON public.child_accounts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.child_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_account_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_account_activity ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- child_accounts: parent or child can view
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_accounts' AND policyname = 'Parent or child can view child account'
  ) THEN
    CREATE POLICY "Parent or child can view child account"
      ON public.child_accounts
      FOR SELECT
      USING (auth.uid() = parent_id OR auth.uid() = child_user_id);
  END IF;

  -- child_accounts: parent can create
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_accounts' AND policyname = 'Parent can create child account'
  ) THEN
    CREATE POLICY "Parent can create child account"
      ON public.child_accounts
      FOR INSERT
      WITH CHECK (auth.uid() = parent_id);
  END IF;

  -- child_accounts: parent can update; child can update last_active/status-limited (kept broad for now)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_accounts' AND policyname = 'Parent or child can update child account'
  ) THEN
    CREATE POLICY "Parent or child can update child account"
      ON public.child_accounts
      FOR UPDATE
      USING (auth.uid() = parent_id OR auth.uid() = child_user_id);
  END IF;

  -- Requests: parent or child can view (if tied to their account)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_account_requests' AND policyname = 'Parent or child can view requests'
  ) THEN
    CREATE POLICY "Parent or child can view requests"
      ON public.child_account_requests
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.child_accounts ca
          WHERE ca.id = child_account_requests.child_account_id
            AND (ca.parent_id = auth.uid() OR ca.child_user_id = auth.uid())
        )
      );
  END IF;

  -- Requests: child can create requests for their own account
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_account_requests' AND policyname = 'Child can create requests'
  ) THEN
    CREATE POLICY "Child can create requests"
      ON public.child_account_requests
      FOR INSERT
      WITH CHECK (
        requested_by_user_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.child_accounts ca
          WHERE ca.id = child_account_requests.child_account_id
            AND ca.child_user_id = auth.uid()
        )
      );
  END IF;

  -- Requests: parent can update requests for their child accounts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_account_requests' AND policyname = 'Parent can update requests'
  ) THEN
    CREATE POLICY "Parent can update requests"
      ON public.child_account_requests
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.child_accounts ca
          WHERE ca.id = child_account_requests.child_account_id
            AND ca.parent_id = auth.uid()
        )
      );
  END IF;

  -- Requests: child can cancel their own pending requests
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_account_requests' AND policyname = 'Child can cancel their own requests'
  ) THEN
    CREATE POLICY "Child can cancel their own requests"
      ON public.child_account_requests
      FOR UPDATE
      USING (
        requested_by_user_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.child_accounts ca
          WHERE ca.id = child_account_requests.child_account_id
            AND ca.child_user_id = auth.uid()
        )
      );
  END IF;

  -- Activity: parent or child can view (scoped)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_account_activity' AND policyname = 'Parent or child can view activity'
  ) THEN
    CREATE POLICY "Parent or child can view activity"
      ON public.child_account_activity
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.child_accounts ca
          WHERE ca.id = child_account_activity.child_account_id
            AND (ca.parent_id = auth.uid() OR ca.child_user_id = auth.uid())
        )
      );
  END IF;

  -- Activity: child can insert their own actions; parent can also insert audit entries
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'child_account_activity' AND policyname = 'Parent or child can insert activity'
  ) THEN
    CREATE POLICY "Parent or child can insert activity"
      ON public.child_account_activity
      FOR INSERT
      WITH CHECK (
        actor_user_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.child_accounts ca
          WHERE ca.id = child_account_activity.child_account_id
            AND (ca.parent_id = auth.uid() OR ca.child_user_id = auth.uid())
        )
      );
  END IF;
END $$;


