/**
 * Language Detection Service
 * Detects document language from OCR text using multiple strategies
 */

import { createWorker } from 'tesseract.js';
import {
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  getConfidenceLevel,
  getTesseractCode
} from '../constants/languages';
import type { LanguageDetectionResult, DetectionMethod } from '../types';

/**
 * Language patterns for basic text-based detection
 * Used as fallback or quick pre-check
 */
const LANGUAGE_PATTERNS = {
  // Arabic script languages
  ar: /[\u0600-\u06FF\u0750-\u077F]/,
  he: /[\u0590-\u05FF]/,
  ur: /[\u0600-\u06FF\u0750-\u077F]/,

  // CJK languages
  'zh-CN': /[\u4E00-\u9FFF]/,
  'zh-TW': /[\u4E00-\u9FFF]/,
  ja: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/,
  ko: /[\uAC00-\uD7AF\u1100-\u11FF]/,

  // Thai
  th: /[\u0E00-\u0E7F]/,

  // Devanagari (Hindi)
  hi: /[\u0900-\u097F]/,

  // Cyrillic (Russian)
  ru: /[\u0400-\u04FF]/,

  // Greek
  el: /[\u0370-\u03FF]/,

  // Latin-based languages (check for special characters)
  es: /[áéíóúñ¿¡]/i,
  fr: /[àâçéèêëîïôùûüÿœæ]/i,
  de: /[äöüß]/i,
  pt: /[ãáàâçéêíóôõú]/i,
  tr: /[çğıİöşü]/i,
  vi: /[ăâđêôơưàảãạáằẳẵặắầẩẫậấèẻẽẹéềểễệếìỉĩịíòỏõọóồổỗộốờởỡợớùủũụúừửữựứỳỷỹỵý]/i
} as const;

/**
 * Detects language from text using pattern matching
 * Fast but less accurate than OCR-based detection
 */
export async function detectLanguageFromText(text: string): Promise<LanguageDetectionResult | null> {
  if (!text || text.trim().length < 3) {
    return null;
  }

  // Check for each language pattern
  for (const [code, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(text)) {
      const language = getLanguageByCode(code);
      if (!language) continue;

      // Calculate confidence based on how much text matches
      const matchCount = (text.match(pattern) || []).length;
      const totalChars = text.length;
      const matchRatio = Math.min(matchCount / totalChars * 100, 100);

      // For script-based languages (non-Latin), high pattern match = high confidence
      const isScriptBased = ['arabic', 'cjk', 'thai', 'indic', 'cyrillic'].includes(language.script);
      const baseConfidence = isScriptBased ? matchRatio : Math.min(matchRatio * 1.5, 85);

      return {
        languageCode: code,
        languageName: language.name,
        confidence: Math.round(baseConfidence),
        confidenceLevel: getConfidenceLevel(baseConfidence),
        detectionMethod: 'auto'
      };
    }
  }

  // Default to English if no pattern matches (likely Latin script)
  const english = getLanguageByCode('en')!;
  return {
    languageCode: 'en',
    languageName: english.name,
    confidence: 50, // Low confidence for fallback
    confidenceLevel: 'low',
    detectionMethod: 'auto'
  };
}

/**
 * Detects language using Tesseract's built-in script detection
 * More accurate but slower than pattern matching
 */
export async function detectLanguageFromImage(
  imageData: string | File,
  preferredLanguages?: string[]
): Promise<LanguageDetectionResult> {
  try {
    console.log('[Language Detection] Starting OCR-based detection...');

    // Create Tesseract worker for script detection
    const worker = await createWorker();

    try {
      // Use 'script/Latin' for initial script detection
      await worker.loadLanguage('script/Latin+script/Arabic+script/Chinese+script/Cyrillic+script/Devanagari+script/Japanese+script/Korean');
      await worker.initialize('script/Latin+script/Arabic+script/Chinese+script/Cyrillic+script/Devanagari+script/Japanese+script/Korean');

      // Perform OCR to detect script
      const { data } = await worker.recognize(imageData);
      const detectedScript = data.text;

      console.log('[Language Detection] Detected text:', detectedScript.substring(0, 100));

      // Try pattern-based detection first
      const patternResult = await detectLanguageFromText(detectedScript);

      // If we have preferred languages and pattern detected one of them, boost confidence
      if (patternResult && preferredLanguages?.includes(patternResult.languageCode)) {
        patternResult.confidence = Math.min(patternResult.confidence + 15, 98);
        patternResult.confidenceLevel = getConfidenceLevel(patternResult.confidence);
      }

      if (patternResult && patternResult.confidence >= 70) {
        console.log('[Language Detection] Pattern detection successful:', patternResult);
        await worker.terminate();
        return patternResult;
      }

      // Fallback to English with medium confidence
      console.log('[Language Detection] Using fallback to English');
      await worker.terminate();

      return {
        languageCode: 'en',
        languageName: 'English',
        confidence: 65,
        confidenceLevel: 'medium',
        detectionMethod: 'auto'
      };
    } finally {
      await worker.terminate();
    }
  } catch (error) {
    console.error('[Language Detection] Error:', error);

    // Fallback to English on error
    return {
      languageCode: 'en',
      languageName: 'English',
      confidence: 50,
      confidenceLevel: 'low',
      detectionMethod: 'auto'
    };
  }
}

/**
 * Detects multiple languages in a document (for bilingual documents)
 */
export async function detectMixedLanguages(
  imageData: string | File
): Promise<LanguageDetectionResult[]> {
  try {
    console.log('[Language Detection] Detecting mixed languages...');

    const worker = await createWorker();
    await worker.loadLanguage('eng+spa+fra+deu+ara+chi_sim+jpn+kor');
    await worker.initialize('eng+spa+fra+deu+ara+chi_sim+jpn+kor');

    const { data } = await worker.recognize(imageData);
    const text = data.text;

    await worker.terminate();

    const detectedLanguages: LanguageDetectionResult[] = [];

    // Check for multiple language patterns
    for (const [code, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
      if (pattern.test(text)) {
        const language = getLanguageByCode(code);
        if (!language) continue;

        const matchCount = (text.match(pattern) || []).length;
        const confidence = Math.min(matchCount * 10, 90);

        if (confidence >= 30) {
          detectedLanguages.push({
            languageCode: code,
            languageName: language.name,
            confidence: Math.round(confidence),
            confidenceLevel: getConfidenceLevel(confidence),
            detectionMethod: 'mixed'
          });
        }
      }
    }

    // Sort by confidence
    detectedLanguages.sort((a, b) => b.confidence - a.confidence);

    // Return top 2 most confident languages
    return detectedLanguages.slice(0, 2);
  } catch (error) {
    console.error('[Language Detection] Mixed language detection error:', error);
    return [];
  }
}

/**
 * Smart language detection that tries multiple strategies
 */
export async function detectLanguageSmart(
  imageData: string | File,
  userPreferences?: {
    preferredLanguages?: string[];
    autoDetect?: boolean;
  }
): Promise<LanguageDetectionResult> {
  // If user has disabled auto-detection, use their first preferred language
  if (userPreferences?.autoDetect === false && userPreferences.preferredLanguages?.[0]) {
    const code = userPreferences.preferredLanguages[0];
    const language = getLanguageByCode(code);
    if (language) {
      return {
        languageCode: code,
        languageName: language.name,
        confidence: 100,
        confidenceLevel: 'high',
        detectionMethod: 'manual'
      };
    }
  }

  // Use image-based detection with user preferences
  return detectLanguageFromImage(imageData, userPreferences?.preferredLanguages);
}

/**
 * Validates if a language code is supported
 */
export function isLanguageSupported(languageCode: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode);
}

/**
 * Gets suggested languages based on user's preferred languages
 * Used to speed up detection by prioritizing likely languages
 */
export function getSuggestedLanguages(preferredLanguages: string[]): string[] {
  const suggested = new Set<string>();

  for (const code of preferredLanguages) {
    suggested.add(code);

    // Add related languages
    const language = getLanguageByCode(code);
    if (language) {
      // Add other languages from same region
      SUPPORTED_LANGUAGES
        .filter(l => l.region === language.region)
        .forEach(l => suggested.add(l.code));
    }
  }

  return Array.from(suggested);
}

/**
 * Confidence message helper
 */
export function getConfidenceMessage(confidence: number): string {
  const level = getConfidenceLevel(confidence);

  switch (level) {
    case 'high':
      return `🟢 ${confidence}% confident`;
    case 'medium':
      return `🟡 ${confidence}% confident - Please verify`;
    case 'low':
      return `⚠️ ${confidence}% confident - Please select language manually`;
  }
}
