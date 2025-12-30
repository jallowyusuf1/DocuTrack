-- Migration: Add Multi-Language OCR and Translation Support
-- Date: 2025-01-27
-- Description: Adds tables and columns for multi-language document support with translation

-- 1. Create document_languages table
-- Tracks detected/selected languages for each document
CREATE TABLE IF NOT EXISTS document_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL, -- ISO 639-1 code (e.g., 'en', 'es', 'ar')
    language_name VARCHAR(100) NOT NULL, -- Display name (e.g., 'English', 'Español')
    is_primary BOOLEAN DEFAULT true, -- Primary language of the document
    confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100), -- 0-100 detection confidence
    detection_method VARCHAR(50), -- 'auto' | 'manual' | 'mixed'
    detected_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Ensure only one primary language per document
    CONSTRAINT unique_primary_language UNIQUE (document_id, is_primary)
        DEFERRABLE INITIALLY DEFERRED
);

-- Index for faster language lookups
CREATE INDEX idx_document_languages_document_id ON document_languages(document_id);
CREATE INDEX idx_document_languages_code ON document_languages(language_code);

-- 2. Create document_translations table
-- Stores translated versions of document fields
CREATE TABLE IF NOT EXISTS document_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    source_language VARCHAR(10) NOT NULL, -- Original language code
    target_language VARCHAR(10) NOT NULL, -- Translated to language code

    -- Translated fields stored as JSONB for flexibility
    -- Example: {"documentName": "Pasaporte", "notes": "Documento importante"}
    translated_fields JSONB NOT NULL DEFAULT '{}',

    translation_service VARCHAR(50), -- 'google' | 'deepl' | 'manual' | 'azure'
    quality_score DECIMAL(5,2) CHECK (quality_score >= 0 AND quality_score <= 100), -- Translation confidence
    translated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Prevent duplicate translations for same language pair
    CONSTRAINT unique_translation_pair UNIQUE (document_id, source_language, target_language)
);

-- Indexes for translation lookups
CREATE INDEX idx_document_translations_document_id ON document_translations(document_id);
CREATE INDEX idx_document_translations_languages ON document_translations(source_language, target_language);

-- 3. Extend documents table with language-related fields
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS ocr_language VARCHAR(10), -- Language used for OCR processing
ADD COLUMN IF NOT EXISTS ocr_confidence DECIMAL(5,2) CHECK (ocr_confidence >= 0 AND ocr_confidence <= 100), -- Overall OCR accuracy
ADD COLUMN IF NOT EXISTS original_text JSONB DEFAULT '{}', -- Raw OCR extracted text by field
ADD COLUMN IF NOT EXISTS has_translation BOOLEAN DEFAULT false; -- Quick flag for translation existence

-- Index for language filtering
CREATE INDEX idx_documents_ocr_language ON documents(ocr_language) WHERE ocr_language IS NOT NULL;

-- 4. Create user language preferences table
CREATE TABLE IF NOT EXISTS user_language_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- OCR preferences
    preferred_ocr_languages VARCHAR(10)[] DEFAULT ARRAY['en'], -- Prioritized languages for detection
    auto_detect_language BOOLEAN DEFAULT true,
    auto_translate BOOLEAN DEFAULT false,
    default_translation_language VARCHAR(10) DEFAULT 'en',

    -- Display preferences
    use_eastern_arabic_numerals BOOLEAN DEFAULT false, -- For Arabic/Urdu users
    use_rtl_layout BOOLEAN DEFAULT true, -- Auto-flip layout for RTL documents

    -- Translation settings
    preferred_translation_service VARCHAR(50) DEFAULT 'google', -- 'google' | 'deepl'
    show_translation_confidence BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- One preference set per user
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Index for user preference lookups
CREATE INDEX idx_user_language_preferences_user_id ON user_language_preferences(user_id);

-- 5. Add Row Level Security (RLS) Policies

-- Enable RLS on new tables
ALTER TABLE document_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_language_preferences ENABLE ROW LEVEL SECURITY;

-- RLS for document_languages
CREATE POLICY "Users can view document languages for their own documents"
    ON document_languages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_languages.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert document languages for their own documents"
    ON document_languages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_languages.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update document languages for their own documents"
    ON document_languages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_languages.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete document languages for their own documents"
    ON document_languages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_languages.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- RLS for document_translations
CREATE POLICY "Users can view translations for their own documents"
    ON document_translations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_translations.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert translations for their own documents"
    ON document_translations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_translations.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update translations for their own documents"
    ON document_translations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_translations.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete translations for their own documents"
    ON document_translations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_translations.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- RLS for user_language_preferences
CREATE POLICY "Users can view their own language preferences"
    ON user_language_preferences FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own language preferences"
    ON user_language_preferences FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own language preferences"
    ON user_language_preferences FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own language preferences"
    ON user_language_preferences FOR DELETE
    USING (user_id = auth.uid());

-- 6. Create helper functions

-- Function to get primary language for a document
CREATE OR REPLACE FUNCTION get_document_primary_language(doc_id UUID)
RETURNS VARCHAR(10) AS $$
    SELECT language_code
    FROM document_languages
    WHERE document_id = doc_id AND is_primary = true
    LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to check if document has translation
CREATE OR REPLACE FUNCTION has_document_translation(doc_id UUID, target_lang VARCHAR(10))
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM document_translations
        WHERE document_id = doc_id AND target_language = target_lang
    );
$$ LANGUAGE SQL STABLE;

-- Function to update translation timestamp
CREATE OR REPLACE FUNCTION update_translation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for translation updates
CREATE TRIGGER update_document_translations_timestamp
    BEFORE UPDATE ON document_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_translation_timestamp();

-- Trigger for user preferences updates
CREATE TRIGGER update_user_language_preferences_timestamp
    BEFORE UPDATE ON user_language_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_translation_timestamp();

-- 7. Add comments for documentation
COMMENT ON TABLE document_languages IS 'Stores detected and manually selected languages for documents';
COMMENT ON TABLE document_translations IS 'Stores translated versions of document fields';
COMMENT ON TABLE user_language_preferences IS 'User preferences for OCR language detection and translation';
COMMENT ON COLUMN documents.ocr_language IS 'Primary language code used for OCR processing';
COMMENT ON COLUMN documents.ocr_confidence IS 'Overall OCR accuracy score (0-100)';
COMMENT ON COLUMN documents.original_text IS 'Raw extracted text from OCR before processing';
COMMENT ON COLUMN documents.has_translation IS 'Flag indicating if any translations exist for this document';
