# Add Document Flow Diagnostic Test

## Steps to Test

1. **Open the Application**
   - Navigate to http://localhost:5174
   - Log in with a valid account

2. **Start Add Document Flow**
   - Click the "+" button to add a document
   - This should open Step 1: Upload Image

3. **Step 1: Upload Image**
   - Click "Take Photo" or "Upload Image"
   - Select/capture an image
   - **Expected**: Should move to Step 2 automatically
   - **Check Console**: Look for any errors related to file reading

4. **Step 2: Select Document Type**
   - Select a document type (e.g., Passport, Visa, ID Card)
   - **Expected**: Should move to Step 3 automatically
   - **Check**: Document type is selected

5. **Step 3: Document Details**
   - Fill in the form fields:
     - Document Name (required)
     - Document Number (optional)
     - Issue Date (optional)
     - Expiration Date (REQUIRED)
     - Notes (optional)
   - Click "Continue" or "Next"
   - **Expected**: Should move to Step 4
   - **Check Console**: Look for OCR/field extraction logs

6. **Step 4: Review & Save**
   - Review all entered information
   - Click "Save Document"
   - **Expected**: Should show success animation then navigate to documents list
   - **Check Console**: Look for:
     - Image upload progress
     - Database insert logs
     - Any errors

## Common Issues to Check

### Issue 1: Image Upload Fails
- Check browser console for storage errors
- Verify Supabase storage bucket exists
- Check RLS policies on storage

### Issue 2: Database Insert Fails
- Check console for PostgreSQL errors
- Common issues:
  - Missing required fields
  - RLS policy blocking insert
  - Invalid data types

### Issue 3: Navigation Doesn't Occur
- Check if success callback is being called
- Verify route exists in App.tsx
- Check browser console for navigation errors

## Manual Console Test

Run this in browser console while logged in:

```javascript
// Test 1: Check if user is authenticated
const { data: session } = await window.supabase.auth.getSession();
console.log('User ID:', session?.session?.user?.id);

// Test 2: Try to create a test document
const testDoc = {
  user_id: session?.session?.user?.id,
  scope: 'dashboard',
  document_type: 'Passport',
  document_name: 'Test Passport',
  document_number: 'TEST123',
  expiration_date: '2025-12-31',
  category: 'Passport',
  image_url: 'test/path.jpg',
  is_locked: false,
  deleted_at: null
};

const { data, error } = await window.supabase
  .from('documents')
  .insert([testDoc])
  .select()
  .single();

console.log('Insert result:', { data, error });
```

## Expected Console Output

When adding a document successfully, you should see:
```
Starting image upload... { fileName: "...", size: ... }
Image uploaded successfully: <path>
Image path stored successfully: <path>
Inserting document to Supabase: { userId: "...", documentName: "...", ... }
Document created and verified successfully: { id: "...", name: "...", userId: "..." }
```

## Fixes if Issues Found

### Fix 1: RLS Policy Issues
```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'documents';

-- Add missing policies if needed
CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Fix 2: Storage Bucket Issues
- Go to Supabase Dashboard > Storage
- Create `document-images` bucket if it doesn't exist
- Set it to private
- Add RLS policies for user access

### Fix 3: Missing Table
```sql
-- Create documents table if missing
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scope VARCHAR(20) DEFAULT 'dashboard',
  document_type VARCHAR(50) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_number VARCHAR(100),
  issue_date DATE,
  expiration_date DATE NOT NULL,
  category VARCHAR(100),
  notes TEXT,
  image_url TEXT NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
