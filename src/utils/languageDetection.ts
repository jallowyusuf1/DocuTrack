/**
 * Language Detection Utilities for OCR
 * Simple language detection from text patterns
 */

export type TesseractLanguageCode = 
  | 'eng' | 'spa' | 'fra' | 'deu' | 'ita' | 'por' 
  | 'rus' | 'chi_sim' | 'chi_tra' | 'jpn' | 'kor' | 'ara';

/**
 * Language detection patterns
 */
const LANGUAGE_PATTERNS: Record<TesseractLanguageCode, RegExp[]> = {
  eng: [/the\s+/i, /\b(is|are|was|were)\b/i, /\b(and|or|but)\b/i],
  spa: [/[áéíóúñ¿¡]/i, /\b(es|son|está|están)\b/i, /\b(y|o|pero)\b/i],
  fra: [/[àâçéèêëîïôùûüÿœæ]/i, /\b(est|sont|être)\b/i, /\b(et|ou|mais)\b/i],
  deu: [/[äöüß]/i, /\b(ist|sind|sein)\b/i, /\b(und|oder|aber)\b/i],
  ita: [/[àèéìíîòóùú]/i, /\b(è|sono|essere)\b/i, /\b(e|o|ma)\b/i],
  por: [/[ãáàâçéêíóôõú]/i, /\b(é|são|ser)\b/i, /\b(e|ou|mas)\b/i],
  rus: [/[\u0400-\u04FF]/],
  chi_sim: [/[\u4E00-\u9FFF]/],
  chi_tra: [/[\u4E00-\u9FFF]/],
  jpn: [/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/],
  kor: [/[\uAC00-\uD7AF]/],
  ara: [/[\u0600-\u06FF]/],
};

/**
 * Detect language from text using pattern matching
 */
export function detectLanguage(text: string): TesseractLanguageCode {
  if (!text || text.trim().length < 3) {
    return 'eng'; // Default to English
  }

  const scores: Record<TesseractLanguageCode, number> = {
    eng: 0, spa: 0, fra: 0, deu: 0, ita: 0, por: 0,
    rus: 0, chi_sim: 0, chi_tra: 0, jpn: 0, kor: 0, ara: 0,
  };

  // Score each language based on pattern matches
  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        scores[lang as TesseractLanguageCode] += matches.length;
      }
    }
  }

  // Find language with highest score
  let maxScore = 0;
  let detectedLang: TesseractLanguageCode = 'eng';

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang as TesseractLanguageCode;
    }
  }

  // If no clear match, default to English
  return maxScore > 0 ? detectedLang : 'eng';
}

/**
 * Get Tesseract language code (maps to Tesseract's language codes)
 */
export function getTesseractLanguage(languageCode: string): TesseractLanguageCode {
  const codeMap: Record<string, TesseractLanguageCode> = {
    'en': 'eng',
    'es': 'spa',
    'fr': 'fra',
    'de': 'deu',
    'it': 'ita',
    'pt': 'por',
    'ru': 'rus',
    'zh-CN': 'chi_sim',
    'zh-TW': 'chi_tra',
    'ja': 'jpn',
    'ko': 'kor',
    'ar': 'ara',
  };

  return codeMap[languageCode] || 'eng';
}

/**
 * Combine multiple languages for Tesseract (e.g., 'eng+spa')
 */
export function combineTesseractLanguages(languages: TesseractLanguageCode[]): string {
  return languages.join('+');
}


