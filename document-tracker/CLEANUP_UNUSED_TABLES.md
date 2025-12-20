# Cleanup Unused Database Tables

## Issue

You're seeing tables in your Supabase database that don't belong to DocuTrack:
- `customers`
- `customer_addresses`
- `orders`
- `order_items`
- `products`
- `product_images`
- `product_variants`
- `categories`
- `gift_cards`
- `gift_card_redemptions`

These are likely leftover from:
- A Supabase template
- Another project using the same database
- Sample data

## ⚠️ WARNING: Backup First!

**Before deleting anything, make sure you have a backup!**

## Cleanup Steps

### Option 1: Delete via Supabase Dashboard (Safest)

1. Go to **Supabase Dashboard** → **Table Editor**
2. For each unused table:
   - Click on the table
   - Click **Delete Table** (trash icon)
   - Confirm deletion

### Option 2: Delete via SQL (Faster)

Run this SQL in your Supabase SQL Editor:

```sql
-- ⚠️ WARNING: This will permanently delete these tables and all their data!
-- Make sure you have a backup first!

-- Drop tables in correct order (respecting foreign keys)
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
```

### Option 3: Keep but Restrict (If unsure)

If you're not sure if these tables are needed, you can restrict access instead:

```sql
-- Revoke all access from these tables
REVOKE ALL ON customers FROM authenticated;
REVOKE ALL ON customer_addresses FROM authenticated;
REVOKE ALL ON orders FROM authenticated;
REVOKE ALL ON order_items FROM authenticated;
REVOKE ALL ON products FROM authenticated;
REVOKE ALL ON product_images FROM authenticated;
REVOKE ALL ON product_variants FROM authenticated;
REVOKE ALL ON categories FROM authenticated;
REVOKE ALL ON gift_cards FROM authenticated;
REVOKE ALL ON gift_card_redemptions FROM authenticated;
```

## DocuTrack Tables (DO NOT DELETE)

These are the tables your app actually uses:

- ✅ `documents` - Document storage
- ✅ `user_profiles` - User profile data
- ✅ `notifications` - Notification preferences
- ✅ `important_dates` - Important dates calendar
- ✅ `connections` - Family sharing connections
- ✅ `shared_documents` - Shared document permissions
- ✅ `document_history` - Document change history (if exists)

## Verification

After cleanup, verify your tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should only see DocuTrack-related tables.


