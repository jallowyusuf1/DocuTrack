-- Create important_dates table
CREATE TABLE IF NOT EXISTS important_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  reminder_enabled BOOLEAN DEFAULT false,
  reminder_days_before INTEGER DEFAULT 7,
  category TEXT,
  recurring BOOLEAN DEFAULT false,
  recurring_interval TEXT, -- 'yearly', 'monthly', 'weekly'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;

-- Users can only view their own important dates
CREATE POLICY "Users can view their own important dates"
  ON important_dates FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own important dates
CREATE POLICY "Users can insert their own important dates"
  ON important_dates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own important dates
CREATE POLICY "Users can update their own important dates"
  ON important_dates FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own important dates
CREATE POLICY "Users can delete their own important dates"
  ON important_dates FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_important_dates_user_id ON important_dates(user_id);
CREATE INDEX IF NOT EXISTS idx_important_dates_date ON important_dates(date);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_important_dates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_important_dates_updated_at
  BEFORE UPDATE ON important_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_important_dates_updated_at();
