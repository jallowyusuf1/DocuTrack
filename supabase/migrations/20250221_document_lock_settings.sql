-- Create document lock security settings table
CREATE TABLE IF NOT EXISTS user_security_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Lock settings
  lock_enabled BOOLEAN DEFAULT false,
  lock_password_hash TEXT,
  lock_trigger VARCHAR(50) DEFAULT 'always', -- 'always', 'idle', 'manual'
  idle_timeout_minutes INTEGER DEFAULT 15,

  -- Security settings
  max_attempts INTEGER DEFAULT 3,
  lockout_duration_minutes INTEGER DEFAULT 15,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own security settings"
  ON user_security_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings"
  ON user_security_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings"
  ON user_security_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_security_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_user_security_settings_timestamp
  BEFORE UPDATE ON user_security_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_security_settings_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_user_security_settings_user_id ON user_security_settings(user_id);
