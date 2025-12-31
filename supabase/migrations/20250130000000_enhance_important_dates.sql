-- Enhance important_dates table with new fields
ALTER TABLE important_dates 
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS repeat_annually BOOLEAN DEFAULT false;

-- Create date_document_links table for linking dates to documents
CREATE TABLE IF NOT EXISTS date_document_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_id UUID NOT NULL REFERENCES important_dates(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_date_document UNIQUE(date_id, document_id)
);

-- Create date_reminders table for managing reminders
CREATE TABLE IF NOT EXISTS date_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_id UUID NOT NULL REFERENCES important_dates(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('days_before', 'on_day', 'custom')),
  days_before INTEGER,
  time_of_day TIME DEFAULT '09:00:00',
  notification_methods JSONB DEFAULT '["push", "in_app"]'::jsonb,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_date_document_links_date_id ON date_document_links(date_id);
CREATE INDEX IF NOT EXISTS idx_date_document_links_document_id ON date_document_links(document_id);
CREATE INDEX IF NOT EXISTS idx_date_reminders_date_id ON date_reminders(date_id);
CREATE INDEX IF NOT EXISTS idx_date_reminders_remind_at ON date_reminders(remind_at);
CREATE INDEX IF NOT EXISTS idx_date_reminders_sent ON date_reminders(sent) WHERE sent = false;

-- Add updated_at trigger for date_reminders
CREATE OR REPLACE FUNCTION update_date_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_date_reminders_updated_at
  BEFORE UPDATE ON date_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_date_reminders_updated_at();




