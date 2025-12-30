# Multi-Language OCR & Translation Implementation Guide

## Overview

This document outlines the comprehensive multi-language OCR system with translation support that has been added to DocuTrack. The system supports 20+ languages across multiple scripts (Latin, Arabic, Cyrillic, CJK, Thai, Indic) with automatic language detection and field-level translation.

---

## ✅ Completed Core Infrastructure

### 1. Database Schema (Migration)
**File:** `supabase/migrations/20250127000001_add_multilanguage_support.sql`

**New Tables:**
- `document_languages` - Stores detected/selected languages for documents
- `document_translations` - Stores translated versions of document fields
- `user_language_preferences` - User preferences for OCR & translation

**Extended Tables:**
- `documents` table now includes:
  - `ocr_language` - Language used for OCR
  - `ocr_confidence` - Overall OCR accuracy (0-100)
  - `original_text` - Raw OCR extracted text
  - `has_translation` - Quick translation existence flag

**To Apply:**
```bash
# Run the migration
supabase db push

# Or manually via SQL editor in Supabase dashboard
```

---

### 2. Language Configuration
**File:** `src/constants/languages.ts`

**Features:**
- 22 supported languages with full metadata
- Grouped by region: Europe, Middle East, Asia, Southeast Asia
- RTL language detection (Arabic, Hebrew, Urdu)
- Script-specific font families
- Tesseract.js language code mapping
- Expected OCR accuracy ratings per language
- Date format patterns by language

**Key Exports:**
```typescript
import {
  SUPPORTED_LANGUAGES,      // All 22 languages
  getLanguageByCode,         // Get language info
  isRTLLanguage,             // Check if RTL
  getFontFamily,             // Get appropriate font
  getConfidenceLevel,        // High/Medium/Low confidence
  getTesseractCode          // For OCR processing
} from '@/constants/languages';
```

---

### 3. TypeScript Types
**File:** `src/types/index.ts`

**New Types Added:**
```typescript
// Multi-language document support
interface DocumentLanguage {
  id: string;
  document_id: string;
  language_code: string;
  language_name: string;
  is_primary: boolean;
  confidence_score?: number;
  detection_method?: 'auto' | 'manual' | 'mixed';
}

interface DocumentTranslation {
  id: string;
  document_id: string;
  source_language: string;
  target_language: string;
  translated_fields: Record<string, string>;
  translation_service?: 'google' | 'deepl' | 'manual';
  quality_score?: number;
}

interface UserLanguagePreferences {
  preferred_ocr_languages: string[];
  auto_detect_language: boolean;
  auto_translate: boolean;
  default_translation_language: string;
  use_eastern_arabic_numerals: boolean;
  use_rtl_layout: boolean;
  preferred_translation_service: 'google' | 'deepl';
}

// OCR results now include language
interface OCRResult {
  text: string;
  confidence: number;
  language?: string;  // NEW
  fields?: { ... };
}
```

---

### 4. Language Detection Service
**File:** `src/services/languageDetection.ts`

**Functions:**

```typescript
// Pattern-based detection (fast)
detectLanguageFromText(text: string): Promise<LanguageDetectionResult>

// OCR-based detection (accurate)
detectLanguageFromImage(imageData: File, preferredLanguages?: string[]): Promise<LanguageDetectionResult>

// Detect multiple languages (bilingual documents)
detectMixedLanguages(imageData: File): Promise<LanguageDetectionResult[]>

// Smart detection with user preferences
detectLanguageSmart(imageData: File, userPreferences): Promise<LanguageDetectionResult>

// Helper functions
isLanguageSupported(languageCode: string): boolean
getConfidenceMessage(confidence: number): string
```

**How It Works:**
1. **Pattern Matching:** Checks text for script-specific characters (Arabic: [\u0600-\u06FF], CJK: [\u4E00-\u9FFF], etc.)
2. **OCR Script Detection:** Uses Tesseract's script detection for higher accuracy
3. **Confidence Scoring:** Returns 0-100 score with level (high/medium/low)
4. **Smart Fallback:** Uses preferred languages to boost confidence

---

### 5. Enhanced OCR Processing
**File:** `src/utils/ocr.ts`

**Updated Functions:**

```typescript
// Multi-language OCR (replaces old single-language version)
extractTextFromImage(
  file: File,
  options?: {
    language?: string;  // Language code (default: 'en')
    progressCallback?: (progress: number) => void;
  }
): Promise<OCRResult>

// NEW: Auto-detect language then OCR
extractTextWithAutoLanguage(
  file: File,
  preferredLanguages?: string[],
  progressCallback?: (progress: number) => void
): Promise<OCRResult & { detectedLanguage: string }>
```

**Language-Aware Field Extraction:**
- Keywords adapted per language (e.g., "exp" in English → "caduca" in Spanish)
- Supports expiry, issue date, name, and document number extraction in 9+ languages
- Smart date parsing for multiple formats

---

### 6. Translation Service
**File:** `src/services/translation.ts` (enhanced existing file)

**New Functions:**

```typescript
// Translate document fields
translateDocumentFields(
  request: {
    documentId: string;
    sourceLanguage: string;
    targetLanguage: string;
    fields: Record<string, string>;
    service?: 'google' | 'deepl';
  }
): Promise<TranslationResult>

// Quality assessment
getTranslationQuality(qualityScore: number): 'high' | 'medium' | 'low'
getTranslationQualityMessage(qualityScore: number): string

// Date format conversion
convertDateFormat(date: string, sourceLanguage: string, targetLanguage: string): string
```

**Translation Flow:**
1. Checks if source ≠ target language
2. Translates each field individually
3. Calculates quality score (success rate)
4. Returns translated fields with confidence

**Notes:**
- Currently uses existing Google Translate API integration
- Caches translations to reduce API calls
- Graceful fallback: returns original text on error

---

## 🚧 Next Steps: UI Components & Integration

### Priority 1: Update Document Upload Flow

**File to modify:** `src/components/documents/add/Step3DocumentDetails.tsx`

**Changes needed:**
1. **Add Language Detection UI**
   ```tsx
   // After OCR extraction, show detected language
   <LanguageDetectionBanner
     language={detectedLanguage}
     confidence={confidence}
     onChangeLanguage={() => setShowLanguageSelector(true)}
   />
   ```

2. **Update OCR Call**
   ```typescript
   // Replace old OCR call with auto-language version
   const result = await extractTextWithAutoLanguage(
     imageFile,
     userPreferences?.preferred_ocr_languages,
     setOcrProgress
   );

   // Store language info
   setDetectedLanguage(result.detectedLanguage);
   setOcrConfidence(result.confidence);
   ```

3. **Save Language on Document Creation**
   ```typescript
   // In document save handler
   await createDocumentWithLanguage({
     ...documentData,
     ocr_language: detectedLanguage,
     ocr_confidence: ocrConfidence,
     original_text: result.fields
   });
   ```

---

### Priority 2: Language Selector Modal

**Create:** `src/components/documents/LanguageSelectorModal.tsx`

**Features:**
- Search bar for filtering languages
- Grid layout (4 columns) with flag + native name
- Recently used languages at top
- Grouped by region

**Props:**
```typescript
interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage?: string;
  onSelectLanguage: (languageCode: string) => void;
  recentLanguages?: string[];
}
```

**Design:**
- 600px width modal
- Each language card: Flag 🇪🇸 + Native Name (Español) + English Name
- Highlight selected language
- "Confirm Language" button

---

### Priority 3: Translation Modal

**Create:** `src/components/documents/TranslationModal.tsx`

**Features:**
- Side-by-side view: Original (left) | Translation (right)
- Field-by-field comparison table
- Quality indicators per field
- "Save Translation" toggle
- Export both versions

**Props:**
```typescript
interface TranslationModalProps {
  document: Document;
  sourceLanguage: string;
  targetLanguage: string;
  onSave: (translation: DocumentTranslation) => void;
}
```

**Layout:**
```
| Original (Spanish)      | Translation (English)   |
|------------------------|-------------------------|
| Nombre: Juan García    | Name: Juan García       |
| Nacionalidad: España   | Nationality: Spain      |
| Fecha: 15/01/1990      | Date: 01/15/1990        |

[✓] Save translated values    [Translate] [Cancel]
```

---

### Priority 4: Document Detail Page Updates

**File:** `src/pages/documents/DocumentDetail.tsx` (or similar)

**Add:**
1. **Language Badge**
   ```tsx
   <LanguageBadge
     code={document.ocr_language}
     confidence={document.ocr_confidence}
   />
   ```

2. **Translation Button**
   ```tsx
   {document.ocr_language !== 'en' && (
     <Button onClick={() => setShowTranslation(true)}>
       🌐 Translate to English
     </Button>
   )}
   ```

3. **Confidence Warning**
   ```tsx
   {document.ocr_confidence && document.ocr_confidence < 70 && (
     <Alert variant="warning">
       ⚠️ OCR confidence is {document.ocr_confidence}%. Please review carefully.
     </Alert>
   )}
   ```

---

### Priority 5: Settings Page

**File:** `src/pages/settings/Settings.tsx` (or create new section)

**Add Section: "OCR & Languages"**

```tsx
<Section title="Multi-Language OCR">
  <Toggle
    label="Enable automatic language detection"
    checked={preferences.auto_detect_language}
    onChange={handleToggle}
  />

  <MultiSelect
    label="Preferred OCR Languages"
    options={SUPPORTED_LANGUAGES}
    selected={preferences.preferred_ocr_languages}
    onChange={handleLanguageChange}
  />

  <Select
    label="Default Translation Language"
    options={SUPPORTED_LANGUAGES}
    value={preferences.default_translation_language}
    onChange={handleDefaultLangChange}
  />

  <Toggle
    label="Automatically translate foreign documents"
    checked={preferences.auto_translate}
    onChange={handleAutoTranslate}
  />

  <Select
    label="Translation Service"
    options={[
      { value: 'google', label: 'Google Translate (Fast)' },
      { value: 'deepl', label: 'DeepL (Higher Quality)' }
    ]}
    value={preferences.preferred_translation_service}
  />
</Section>
```

---

## 📊 Database Service Integration

**Create:** `src/services/documentLanguages.ts`

```typescript
import { supabase } from '@/config/supabase';
import type { DocumentLanguage, DocumentTranslation } from '@/types';

// Save detected language
export async function saveDocumentLanguage(
  documentId: string,
  languageCode: string,
  confidence: number,
  isPrimary: boolean = true
): Promise<DocumentLanguage> {
  const { data, error } = await supabase
    .from('document_languages')
    .insert({
      document_id: documentId,
      language_code: languageCode,
      language_name: getLanguageByCode(languageCode)?.name,
      is_primary: isPrimary,
      confidence_score: confidence,
      detection_method: 'auto'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Save translation
export async function saveDocumentTranslation(
  documentId: string,
  sourceLanguage: string,
  targetLanguage: string,
  translatedFields: Record<string, string>,
  qualityScore: number
): Promise<DocumentTranslation> {
  const { data, error } = await supabase
    .from('document_translations')
    .insert({
      document_id: documentId,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      translated_fields: translatedFields,
      translation_service: 'google',
      quality_score: qualityScore
    })
    .select()
    .single();

  if (error) throw error;

  // Update document has_translation flag
  await supabase
    .from('documents')
    .update({ has_translation: true })
    .eq('id', documentId);

  return data;
}

// Get translations for document
export async function getDocumentTranslations(
  documentId: string
): Promise<DocumentTranslation[]> {
  const { data, error } = await supabase
    .from('document_translations')
    .select('*')
    .eq('document_id', documentId)
    .order('translated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get or create user preferences
export async function getUserLanguagePreferences(
  userId: string
): Promise<UserLanguagePreferences> {
  let { data, error } = await supabase
    .from('user_language_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Create default preferences
    const { data: newData, error: insertError } = await supabase
      .from('user_language_preferences')
      .insert({
        user_id: userId,
        preferred_ocr_languages: ['en'],
        auto_detect_language: true,
        auto_translate: false,
        default_translation_language: 'en',
        preferred_translation_service: 'google'
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newData;
  }

  if (error) throw error;
  return data;
}

// Update user preferences
export async function updateUserLanguagePreferences(
  userId: string,
  preferences: Partial<UserLanguagePreferences>
): Promise<void> {
  const { error } = await supabase
    .from('user_language_preferences')
    .update(preferences)
    .eq('user_id', userId);

  if (error) throw error;
}
```

---

## 🎨 Font Loading

**Add to:** `index.html` or create `src/styles/fonts.css`

```html
<!-- Add to <head> in index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+Thai:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
```

**Add CSS utility classes:**
```css
/* src/styles/fonts.css */
.font-arabic {
  font-family: 'Noto Sans Arabic', sans-serif;
  direction: rtl;
  text-align: right;
}

.font-cjk {
  font-family: 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif;
}

.font-thai {
  font-family: 'Noto Sans Thai', sans-serif;
}

.font-indic {
  font-family: 'Noto Sans Devanagari', sans-serif;
}

/* RTL layout for Arabic/Hebrew/Urdu */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}
```

---

## 🔄 Integration Checklist

- [ ] **Run Database Migration**
  - Apply `20250127000001_add_multilanguage_support.sql`
  - Verify tables created in Supabase

- [ ] **Update Document Upload Flow**
  - Modify `Step3DocumentDetails.tsx` to use new OCR functions
  - Add language detection banner
  - Save language info on document creation

- [ ] **Create UI Components**
  - [ ] `LanguageSelectorModal.tsx`
  - [ ] `TranslationModal.tsx`
  - [ ] `LanguageDetectionBanner.tsx`
  - [ ] `LanguageBadge.tsx`
  - [ ] `OCRConfidenceIndicator.tsx`

- [ ] **Create Database Service**
  - Implement `src/services/documentLanguages.ts`
  - Add CRUD operations for languages & translations
  - User preferences management

- [ ] **Update Settings Page**
  - Add "OCR & Languages" section
  - Language preferences UI
  - Translation settings

- [ ] **Update Document Detail Page**
  - Show detected language
  - Add translation button
  - Display confidence warnings

- [ ] **Add Fonts**
  - Load multi-script fonts in `index.html`
  - Add RTL CSS classes

- [ ] **Testing**
  - [ ] Test OCR with English document
  - [ ] Test OCR with Spanish document
  - [ ] Test OCR with Arabic document (RTL)
  - [ ] Test language detection accuracy
  - [ ] Test translation functionality
  - [ ] Test mixed-language documents
  - [ ] Test user preferences persistence

---

## 🌐 API Keys Required

For production translation support, you'll need:

### Google Cloud Translation API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Translation API
3. Create API key
4. Add to `.env`:
   ```
   VITE_GOOGLE_TRANSLATE_API_KEY=your_key_here
   ```

### DeepL API (Optional, higher quality)
1. Sign up at [DeepL API](https://www.deepl.com/pro-api)
2. Get API key
3. Add to `.env`:
   ```
   VITE_DEEPL_API_KEY=your_key_here
   ```

**Note:** Translation service currently has Google Translate integrated. DeepL integration is prepared but requires API key setup.

---

## 📚 Usage Examples

### Example 1: Upload Spanish Passport

```typescript
// User uploads Spanish passport image
const file = /* File from input */;

// Auto-detect language
const result = await extractTextWithAutoLanguage(file);
// result.detectedLanguage = 'es'
// result.confidence = 92
// result.fields = {
//   documentNumber: 'ESP123456789',
//   expirationDate: '2030-12-31',
//   name: 'Juan García'
// }

// Save document with language
await createDocument({
  ...formData,
  ocr_language: 'es',
  ocr_confidence: 92,
  original_text: result.fields
});

// Later: Translate to English
const translation = await translateDocumentFields({
  documentId: doc.id,
  sourceLanguage: 'es',
  targetLanguage: 'en',
  fields: {
    documentName: 'Pasaporte',
    documentNumber: 'ESP123456789',
    notes: 'Documento importante'
  }
});
// translation.translatedFields = {
//   documentName: 'Passport',
//   documentNumber: 'ESP123456789',
//   notes: 'Important document'
// }
```

### Example 2: Manual Language Selection

```typescript
// User clicks "Change Language" after low confidence detection
<LanguageSelectorModal
  isOpen={true}
  currentLanguage="en"
  onSelectLanguage={async (langCode) => {
    // Re-run OCR with selected language
    const result = await extractTextFromImage(file, {
      language: langCode
    });
    // Update form with new extraction
  }}
/>
```

### Example 3: Side-by-Side Translation View

```typescript
<TranslationModal
  document={document}
  sourceLanguage="es"
  targetLanguage="en"
  onSave={async (translation) => {
    await saveDocumentTranslation(
      document.id,
      'es',
      'en',
      translation.translatedFields,
      translation.qualityScore
    );
    toast.success('Translation saved!');
  }}
/>
```

---

## 🎯 Key Benefits

1. **20+ Language Support** - Covers major world languages
2. **Automatic Detection** - No manual language selection needed (unless desired)
3. **High Accuracy** - Language-aware keyword extraction
4. **RTL Support** - Proper handling of Arabic, Hebrew, Urdu
5. **Translation Built-in** - Instant field-level translation
6. **Confidence Indicators** - Users know when to verify OCR results
7. **User Preferences** - Remember preferred languages
8. **Bilingual Documents** - Detects multiple languages in one document
9. **Date Format Conversion** - Automatic locale-aware date formatting
10. **Scalable** - Easy to add more languages

---

## 🐛 Troubleshooting

### Issue: Language detection always returns English
**Solution:** Check that Tesseract.js is downloading language data. May need to add CDN for language files.

### Issue: Translation not working
**Solution:** Verify `VITE_GOOGLE_TRANSLATE_API_KEY` is set in `.env` and Google Translation API is enabled in Cloud Console.

### Issue: RTL text displaying incorrectly
**Solution:** Ensure `dir="rtl"` is applied to container elements and proper fonts are loaded.

### Issue: Low OCR confidence on good quality images
**Solution:** Try manually selecting the correct language. Auto-detection may misidentify similar scripts.

---

## 📖 Resources

- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [Google Cloud Translation API](https://cloud.google.com/translate/docs)
- [DeepL API Documentation](https://www.deepl.com/docs-api)
- [Unicode Character Ranges](https://www.unicode.org/charts/) - For script detection
- [RTL CSS Guidelines](https://rtlstyling.com/)

---

## 🚀 Future Enhancements

1. **MRZ (Machine Readable Zone) Parsing** - Specialized passport/ID parsing
2. **Handwriting Recognition** - Support for handwritten documents
3. **Batch OCR** - Process multiple documents at once
4. **Offline Mode** - Cache Tesseract language files locally
5. **Custom Dictionaries** - User-defined vocabulary for specialized documents
6. **Language Learning** - Improve detection based on user corrections
7. **OCR History** - Track and compare multiple OCR attempts
8. **Professional Translation** - Integration with human translation services
9. **Voice Input** - Speak document details in any language
10. **Export Translations** - PDF with side-by-side original and translation

---

## ✨ Summary

You now have a complete multi-language OCR system with:
- ✅ Database schema (ready to migrate)
- ✅ Language configuration (22 languages)
- ✅ Type definitions
- ✅ Language detection service
- ✅ Enhanced OCR with auto-language
- ✅ Translation service
- 📝 UI component specifications
- 📝 Integration guide
- 📝 Testing checklist

**Next Steps:**
1. Run the database migration
2. Create the UI components (Language Selector Modal, Translation Modal)
3. Update the document upload flow
4. Add settings page for language preferences
5. Test with documents in different languages

The foundation is solid - now it's time to build the user-facing components!
