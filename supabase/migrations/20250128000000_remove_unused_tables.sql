-- ============================================
-- REMOVE UNUSED DATABASE TABLES
-- ============================================
-- This migration removes tables that are NOT part of DocuTrack
-- These appear to be leftover from templates or other projects
-- ============================================
-- ⚠️ WARNING: This will permanently delete tables and all their data!
-- Make sure you have a backup before running this!
-- ============================================

-- Drop e-commerce related tables (not used in DocuTrack)
DROP TABLE IF EXISTS gift_card_redemptions CASCADE;
DROP TABLE IF EXISTS gift_cards CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop analytics/tutorial tables (not used)
DROP TABLE IF EXISTS tutorial_analytics CASCADE;

-- Note: app_settings is used by the onboarding-config edge function
-- Keep it for now, but can be removed if not needed
-- DROP TABLE IF EXISTS app_settings CASCADE;

-- Drop views if they exist (these are likely views, not tables)
DROP VIEW IF EXISTS active_documents_with_urgency CASCADE;
DROP VIEW IF EXISTS unread_notifications_count CASCADE;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running, verify with:
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;
--
-- You should only see DocuTrack tables:
-- - documents
-- - document_types
-- - document_field_definitions
-- - document_type_fields
-- - document_field_values
-- - document_history (if exists)
-- - user_profiles
-- - user_settings
-- - user_security_settings
-- - user_webauthn_credentials
-- - user_custom_templates
-- - notifications
-- - important_dates
-- - connections
-- - shared_documents
-- - family_invitations (if exists)
-- - households (if exists)
-- - household_members (if exists)
-- - security_audit_events
-- - terms_acceptance
-- - user_sessions (if exists)

