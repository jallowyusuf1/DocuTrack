-- Intelligent Document Type System Migration
-- Creates tables for dynamic document types, field definitions, and field values

-- 1. Document Types Table - Template definitions
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'identity', 'travel', 'certificate', 'insurance', 'financial', 'professional', 'property', 'legal', 'medical', 'custom'
  icon VARCHAR(50),
  description TEXT,
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Document Field Definitions - Master field library
CREATE TABLE IF NOT EXISTS document_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_key VARCHAR(100) UNIQUE NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- 'text', 'date', 'number', 'dropdown', 'checkbox', 'radio', 'textarea', 'address', 'phone', 'email', 'currency', 'vin'
  label VARCHAR(200) NOT NULL,
  description TEXT,
  validation_rules JSONB,
  default_options JSONB, -- For dropdowns, checkboxes, etc.
  is_repeatable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Document Type Fields - Field mapping (which fields for which types)
CREATE TABLE IF NOT EXISTS document_type_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type_id UUID REFERENCES document_types(id) ON DELETE CASCADE NOT NULL,
  field_definition_id UUID REFERENCES document_field_definitions(id) ON DELETE CASCADE NOT NULL,
  is_required BOOLEAN DEFAULT false,
  section VARCHAR(100) NOT NULL, -- 'personal_info', 'document_details', 'additional_info', etc.
  display_order INTEGER NOT NULL,
  conditional_logic JSONB, -- Show/hide based on other fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_type_id, field_definition_id)
);

-- 4. Document Field Values - Actual field values for documents
CREATE TABLE IF NOT EXISTS document_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  field_definition_id UUID REFERENCES document_field_definitions(id) ON DELETE CASCADE NOT NULL,
  value TEXT, -- Stored as JSON string for complex values
  value_type VARCHAR(20) NOT NULL, -- 'string', 'number', 'date', 'json', 'boolean'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, field_definition_id)
);

-- 5. User Custom Templates - User-created document types
CREATE TABLE IF NOT EXISTS user_custom_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  field_config JSONB NOT NULL, -- Array of field definitions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_types_category ON document_types(category);
CREATE INDEX IF NOT EXISTS idx_document_types_type_key ON document_types(type_key);
CREATE INDEX IF NOT EXISTS idx_document_field_definitions_field_key ON document_field_definitions(field_key);
CREATE INDEX IF NOT EXISTS idx_document_type_fields_type_id ON document_type_fields(document_type_id);
CREATE INDEX IF NOT EXISTS idx_document_type_fields_field_id ON document_type_fields(field_definition_id);
CREATE INDEX IF NOT EXISTS idx_document_field_values_document_id ON document_field_values(document_id);
CREATE INDEX IF NOT EXISTS idx_document_field_values_field_id ON document_field_values(field_definition_id);
CREATE INDEX IF NOT EXISTS idx_document_field_values_composite ON document_field_values(document_id, field_definition_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_templates_user_id ON user_custom_templates(user_id);

-- Row Level Security Policies

-- Document Types (read-only for all authenticated users)
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document types are viewable by authenticated users"
  ON document_types FOR SELECT
  USING (auth.role() = 'authenticated');

-- Document Field Definitions (read-only for all authenticated users)
ALTER TABLE document_field_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Field definitions are viewable by authenticated users"
  ON document_field_definitions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Document Type Fields (read-only for all authenticated users)
ALTER TABLE document_type_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Type fields are viewable by authenticated users"
  ON document_type_fields FOR SELECT
  USING (auth.role() = 'authenticated');

-- Document Field Values (users can only access their own document fields)
ALTER TABLE document_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own document field values"
  ON document_field_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_field_values.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own document field values"
  ON document_field_values FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_field_values.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own document field values"
  ON document_field_values FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_field_values.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own document field values"
  ON document_field_values FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_field_values.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- User Custom Templates (users can only access their own templates)
ALTER TABLE user_custom_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom templates"
  ON user_custom_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom templates"
  ON user_custom_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom templates"
  ON user_custom_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom templates"
  ON user_custom_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Note: The actual data population (document types, field definitions, and mappings)
-- will be done via the application code or a separate data migration script
-- to keep this migration focused on schema creation


