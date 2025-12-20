-- ============================================
-- CLEANUP UNUSED DATABASE TABLES
-- ============================================
-- ⚠️ WARNING: This will permanently delete tables and all their data!
-- Make sure you have a backup before running this!
-- ============================================
-- These tables are NOT part of DocuTrack and can be safely removed
-- if they're leftover from templates or other projects
-- ============================================

-- Drop tables in correct order (respecting foreign key constraints)
-- CASCADE will also drop dependent objects (foreign keys, indexes, etc.)

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

-- ============================================
-- VERIFICATION
-- ============================================
-- After running, verify with:
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- You should only see DocuTrack tables:
-- - documents
-- - user_profiles
-- - notifications
-- - important_dates
-- - connections
-- - shared_documents
-- - document_history (if exists)


