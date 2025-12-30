/**
 * Google Translate API integration for app translations
 */

const GOOGLE_TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || '';
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

export type LanguageCode = 
  | 'en' // English
  | 'ar' // Arabic
  | 'fr' // French
  | 'es' // Spanish
  | 'de' // German
  | 'hif' // Fiji Hindi
  | 'it' // Italian
  | 'pt' // Portuguese
  | 'ru' // Russian
  | 'zh' // Chinese
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'hi' // Hindi
  | 'tr' // Turkish
  | 'pl' // Polish
  | 'nl' // Dutch
  | 'sv' // Swedish
  | 'da' // Danish
  | 'no' // Norwegian
  | 'fi' // Finnish
  | 'cs' // Czech
  | 'ro' // Romanian
  | 'hu' // Hungarian
  | 'el' // Greek
  | 'he' // Hebrew
  | 'th' // Thai
  | 'vi' // Vietnamese
  | 'id' // Indonesian
  | 'ms' // Malay
  | 'uk' // Ukrainian
  | 'bg' // Bulgarian
  | 'hr' // Croatian
  | 'sk' // Slovak
  | 'sl' // Slovenian
  | 'et' // Estonian
  | 'lv' // Latvian
  | 'lt' // Lithuanian
  | 'mt' // Maltese
  | 'ga' // Irish
  | 'cy' // Welsh
  | 'is' // Icelandic
  | 'mk' // Macedonian
  | 'sq' // Albanian
  | 'sr' // Serbian
  | 'bs' // Bosnian
  | 'me' // Montenegrin
  | 'ca' // Catalan
  | 'eu' // Basque
  | 'gl' // Galician
  | 'af' // Afrikaans
  | 'sw' // Swahili
  | 'zu' // Zulu
  | 'xh' // Xhosa
  | 'am' // Amharic
  | 'az' // Azerbaijani
  | 'be' // Belarusian
  | 'bn' // Bengali
  | 'my' // Burmese
  | 'ka' // Georgian
  | 'gu' // Gujarati
  | 'kk' // Kazakh
  | 'km' // Khmer
  | 'ky' // Kyrgyz
  | 'lo' // Lao
  | 'mn' // Mongolian
  | 'ne' // Nepali
  | 'si' // Sinhala
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'ur' // Urdu
  | 'uz' // Uzbek
  | 'yi' // Yiddish
  | 'yo' // Yoruba
  | 'zu' // Zulu
  | 'haw' // Hawaiian
  | 'co' // Corsican
  | 'ht' // Haitian Creole
  | 'jw' // Javanese
  | 'lb' // Luxembourgish
  | 'mg' // Malagasy
  | 'mi' // Maori
  | 'sm' // Samoan
  | 'gd' // Scottish Gaelic
  | 'sn' // Shona
  | 'so' // Somali
  | 'su' // Sundanese
  | 'tg' // Tajik
  | 'tk' // Turkmen
  | 'tt' // Tatar
  | 'ug' // Uyghur
  | 'fy' // Western Frisian
  | 'xh' // Xhosa
  | 'yi' // Yiddish
  | 'yo' // Yoruba
  | 'zu' // Zulu
  | 'haw' // Hawaiian
  | 'co' // Corsican
  | 'ht' // Haitian Creole
  | 'jw' // Javanese
  | 'lb' // Luxembourgish
  | 'mg' // Malagasy
  | 'mi' // Maori
  | 'sm' // Samoan
  | 'gd' // Scottish Gaelic
  | 'sn' // Shona
  | 'so' // Somali
  | 'su' // Sundanese
  | 'tg' // Tajik
  | 'tk' // Turkmen
  | 'tt' // Tatar
  | 'ug' // Uyghur
  | 'fy' // Western Frisian
  | 'xh' // Xhosa
  | 'yi' // Yiddish
  | 'yo' // Yoruba
  | 'zu' // Zulu
  | 'haw' // Hawaiian
  | 'co' // Corsican
  | 'ht' // Haitian Creole
  | 'jw' // Javanese
  | 'lb' // Luxembourgish
  | 'mg' // Malagasy
  | 'mi' // Maori
  | 'sm' // Samoan
  | 'gd' // Scottish Gaelic
  | 'sn' // Shona
  | 'so' // Somali
  | 'su' // Sundanese
  | 'tg' // Tajik
  | 'tk' // Turkmen
  | 'tt' // Tatar
  | 'ug' // Uyghur
  | 'fy'; // Western Frisian

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'hif', name: 'Fiji Hindi', nativeName: 'फ़िजी हिंदी' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'me', name: 'Montenegrin', nativeName: 'Crnogorski' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbek' },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi' },
  { code: 'co', name: 'Corsican', nativeName: 'Corsu' },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl ayisyen' },
  { code: 'jw', name: 'Javanese', nativeName: 'Basa Jawa' },
  { code: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy' },
  { code: 'mi', name: 'Maori', nativeName: 'Te Reo Māori' },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Samoa' },
  { code: 'gd', name: 'Scottish Gaelic', nativeName: 'Gàidhlig' },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ' },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmen' },
  { code: 'tt', name: 'Tatar', nativeName: 'Татар' },
  { code: 'ug', name: 'Uyghur', nativeName: 'ئۇيغۇرچە' },
  { code: 'fy', name: 'Western Frisian', nativeName: 'Frysk' },
];

// Translation cache
const translationCache = new Map<string, string>();

/**
 * Translate text using Google Translate API
 */
export async function translateText(
  text: string,
  targetLanguage: LanguageCode,
  sourceLanguage: LanguageCode = 'en'
): Promise<string> {
  // Return original text if target is same as source
  if (targetLanguage === sourceLanguage) {
    return text;
  }

  // Check cache
  const cacheKey = `${sourceLanguage}-${targetLanguage}-${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // If no API key, return original text
  if (!GOOGLE_TRANSLATE_API_KEY) {
    console.warn('Google Translate API key not configured. Returning original text.');
    return text;
  }

  // Handle Fiji Hindi - Google Translate uses 'hi' for Hindi
  const translateTarget = targetLanguage === 'hif' ? 'hi' : targetLanguage;

  try {
    const response = await fetch(
      `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: translateTarget,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.data.translations[0].translatedText;

    // Cache the translation
    translationCache.set(cacheKey, translatedText);

    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text on error
    return text;
  }
}

/**
 * Translate multiple texts in batch
 */
export async function translateBatch(
  texts: string[],
  targetLanguage: LanguageCode,
  sourceLanguage: LanguageCode = 'en'
): Promise<string[]> {
  if (targetLanguage === sourceLanguage) {
    return texts;
  }

  if (!GOOGLE_TRANSLATE_API_KEY) {
    console.warn('Google Translate API key not configured. Returning original texts.');
    return texts;
  }

  // Handle Fiji Hindi - Google Translate uses 'hi' for Hindi
  const translateTarget = targetLanguage === 'hif' ? 'hi' : targetLanguage;

  try {
    const response = await fetch(
      `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: texts,
          source: sourceLanguage,
          target: translateTarget,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.translations.map((t: any) => t.translatedText);
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts;
  }
}

/**
 * Get current language from localStorage
 */
export function getCurrentLanguage(): LanguageCode {
  const saved = localStorage.getItem('app_language');
  if (saved && SUPPORTED_LANGUAGES.some(lang => lang.code === saved)) {
    return saved as LanguageCode;
  }
  return 'en';
}

/**
 * Save language preference
 */
export function setCurrentLanguage(language: LanguageCode): void {
  localStorage.setItem('app_language', language);
}

// ===================================================================
// Document Translation Functions (for multi-language OCR)
// ===================================================================

import type { TranslationRequest, TranslationResult, TranslationService as DocTranslationService } from '../types';

/**
 * Translate document fields (for OCR multi-language support)
 */
export async function translateDocumentFields(
  request: TranslationRequest
): Promise<TranslationResult> {
  const { sourceLanguage, targetLanguage, fields, service = 'google' } = request;

  console.log('[Document Translation] Translating fields from', sourceLanguage, 'to', targetLanguage);

  const translatedFields: Record<string, string> = {};
  const errors: string[] = [];
  let successCount = 0;
  const totalFields = Object.keys(fields).length;

  // Translate each field
  for (const [key, value] of Object.entries(fields)) {
    if (!value || value.trim().length === 0) {
      translatedFields[key] = value;
      continue;
    }

    try {
      // Use existing translateText function
      const translated = await translateText(
        value,
        targetLanguage as LanguageCode,
        sourceLanguage as LanguageCode
      );
      translatedFields[key] = translated;

      if (translated !== value) {
        successCount++;
      }
    } catch (error) {
      console.error(`[Document Translation] Failed to translate ${key}:`, error);
      translatedFields[key] = value; // Keep original
      errors.push(`Failed to translate ${key}`);
    }
  }

  // Calculate quality score
  const qualityScore = totalFields > 0 ? (successCount / totalFields) * 100 : 0;

  console.log(`[Document Translation] Completed: ${successCount}/${totalFields} fields`);

  return {
    translatedFields,
    service: service as DocTranslationService,
    qualityScore: Math.round(qualityScore),
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Get translation quality level
 */
export function getTranslationQuality(
  qualityScore: number
): 'high' | 'medium' | 'low' {
  if (qualityScore >= 90) return 'high';
  if (qualityScore >= 75) return 'medium';
  return 'low';
}

/**
 * Get translation quality message
 */
export function getTranslationQualityMessage(qualityScore: number): string {
  const quality = getTranslationQuality(qualityScore);

  switch (quality) {
    case 'high':
      return '✓ High quality translation';
    case 'medium':
      return '⚠️ Medium quality - Please review';
    case 'low':
      return '⚠️ Low quality - Manual verification recommended';
  }
}

/**
 * Convert date format based on target language locale
 */
export function convertDateFormat(
  date: string,
  sourceLanguage: string,
  targetLanguage: string
): string {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return date;
    }

    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'pt': 'pt-BR',
      'it': 'it-IT',
      'ar': 'ar-SA',
      'zh': 'zh-CN',
      'zh-CN': 'zh-CN',
      'zh-TW': 'zh-TW',
      'ja': 'ja-JP',
      'ko': 'ko-KR'
    };

    const locale = localeMap[targetLanguage] || 'en-US';
    return dateObj.toLocaleDateString(locale);
  } catch (error) {
    console.error('[Date Format] Conversion failed:', error);
    return date;
  }
}

