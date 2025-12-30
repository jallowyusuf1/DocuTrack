-- Create page_locks table for locking specific pages with PIN or password
CREATE TABLE IF NOT EXISTS page_locks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page TEXT NOT NULL CHECK (page IN ('dashboard', 'documents', 'profile', 'family', 'dates', 'notifications', 'settings')),
  lock_type TEXT NOT NULL CHECK (lock_type IN ('pin', 'password')),
  lock_value TEXT NOT NULL, -- Hashed PIN or password
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure only one lock per user per page
  UNIQUE(user_id, page)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_page_locks_user_id ON page_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_page_locks_page ON page_locks(page);
CREATE INDEX IF NOT EXISTS idx_page_locks_enabled ON page_locks(is_enabled);

-- Enable RLS
ALTER TABLE page_locks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only manage their own page locks
CREATE POLICY page_locks_user_policy ON page_locks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_page_locks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_page_locks_updated_at
  BEFORE UPDATE ON page_locks
  FOR EACH ROW
  EXECUTE FUNCTION update_page_locks_updated_at();

-- Grant permissions
GRANT ALL ON page_locks TO authenticated;
GRANT ALL ON page_locks TO service_role;
