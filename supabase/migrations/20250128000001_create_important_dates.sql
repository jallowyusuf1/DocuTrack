-- Create important_dates table
CREATE TABLE IF NOT EXISTS important_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Other',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  repeat_annually BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT false,
  reminder_days_before INTEGER DEFAULT 7,
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

-- Create date_document_links table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS date_document_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_id UUID NOT NULL REFERENCES important_dates(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date_id, document_id)
);

-- Add RLS policies for date_document_links
ALTER TABLE date_document_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own date document links"
  ON date_document_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM important_dates
      WHERE important_dates.id = date_document_links.date_id
      AND important_dates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own date document links"
  ON date_document_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM important_dates
      WHERE important_dates.id = date_document_links.date_id
      AND important_dates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own date document links"
  ON date_document_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM important_dates
      WHERE important_dates.id = date_document_links.date_id
      AND important_dates.user_id = auth.uid()
    )
  );

-- Create indexes for date_document_links
CREATE INDEX IF NOT EXISTS idx_date_document_links_date_id ON date_document_links(date_id);
CREATE INDEX IF NOT EXISTS idx_date_document_links_document_id ON date_document_links(document_id);

-- Create date_reminders table
CREATE TABLE IF NOT EXISTS date_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_id UUID NOT NULL REFERENCES important_dates(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('days_before', 'on_day', 'custom')),
  days_before INTEGER,
  time_of_day TIME DEFAULT '09:00',
  notification_methods JSONB DEFAULT '{"in_app": true, "push": true}'::jsonb,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for date_reminders
ALTER TABLE date_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own date reminders"
  ON date_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM important_dates
      WHERE important_dates.id = date_reminders.date_id
      AND important_dates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own date reminders"
  ON date_reminders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM important_dates
      WHERE important_dates.id = date_reminders.date_id
      AND important_dates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own date reminders"
  ON date_reminders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM important_dates
      WHERE important_dates.id = date_reminders.date_id
      AND important_dates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own date reminders"
  ON date_reminders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM important_dates
      WHERE important_dates.id = date_reminders.date_id
      AND important_dates.user_id = auth.uid()
    )
  );

-- Create indexes for date_reminders
CREATE INDEX IF NOT EXISTS idx_date_reminders_date_id ON date_reminders(date_id);
CREATE INDEX IF NOT EXISTS idx_date_reminders_remind_at ON date_reminders(remind_at);
CREATE INDEX IF NOT EXISTS idx_date_reminders_sent ON date_reminders(sent);
