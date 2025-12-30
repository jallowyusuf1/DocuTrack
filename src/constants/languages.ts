/**
 * Language constants and configuration for multi-language OCR support
 * Supports 20+ languages across multiple scripts and regions
 */

export interface Language {
  code: string; // ISO 639-1 code
  name: string; // English name
  nativeName: string; // Native language name
  flag: string; // Flag emoji or icon identifier
  script: 'latin' | 'arabic' | 'cyrillic' | 'cjk' | 'indic' | 'thai';
  isRTL: boolean; // Right-to-left text direction
  tesseractCode: string; // Tesseract.js language code
  region: 'europe' | 'middle-east' | 'asia' | 'southeast-asia';
  ocrAccuracy: 'high' | 'good' | 'moderate'; // Expected OCR accuracy for printed text
}

/**
 * Comprehensive list of supported languages for OCR
 * Organized by region for better UX in language selector
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  // Europe
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    script: 'latin',
    isRTL: false,
    tesseractCode: 'eng',
    region: 'europe',
    ocrAccuracy: 'high'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    script: 'latin',
    isRTL: false,
    tesseractCode: 'spa',
    region: 'europe',
    ocrAccuracy: 'high'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    script: 'latin',
    isRTL: false,
    tesseractCode: 'fra',
    region: 'europe',
    ocrAccuracy: 'high'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    script: 'latin',
    isRTL: false,
    tesseractCode: 'deu',
    region: 'europe',
    ocrAccuracy: 'high'
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    script: 'latin',
    isRTL: false,
    tesseractCode: 'ita',
    region: 'europe',
    ocrAccuracy: 'high'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    script: 'latin',
    isRTL: false,
    tesseractCode: 'por',
    region: 'europe',
    ocrAccuracy: 'high'
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    script: 'latin',
    isRTL: false,
    tesseractCode: 'nld',
    region: 'europe',
    ocrAccuracy: 'high'
  },
  {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    script: 'latin',
    isRTL: false,
    tesseractCode: 'pol',
    region: 'europe',
    ocrAccuracy: 'good'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    script: 'cyrillic',
    isRTL: false,
    tesseractCode: 'rus',
    region: 'europe',
    ocrAccuracy: 'good'
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    script: 'latin',
    isRTL: false,
    tesseractCode: 'tur',
    region: 'europe',
    ocrAccuracy: 'good'
  },
  {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    flag: '🇬🇷',
    script: 'latin', // Greek uses its own script but handled similarly to latin
    isRTL: false,
    tesseractCode: 'ell',
    region: 'europe',
    ocrAccuracy: 'good'
  },

  // Middle East
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    script: 'arabic',
    isRTL: true,
    tesseractCode: 'ara',
    region: 'middle-east',
    ocrAccuracy: 'good'
  },
  {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
    script: 'arabic', // Hebrew script handled similarly to Arabic
    isRTL: true,
    tesseractCode: 'heb',
    region: 'middle-east',
    ocrAccuracy: 'good'
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    script: 'arabic',
    isRTL: true,
    tesseractCode: 'urd',
    region: 'middle-east',
    ocrAccuracy: 'moderate'
  },

  // Asia
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    script: 'cjk',
    isRTL: false,
    tesseractCode: 'chi_sim',
    region: 'asia',
    ocrAccuracy: 'good'
  },
  {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    script: 'cjk',
    isRTL: false,
    tesseractCode: 'chi_tra',
    region: 'asia',
    ocrAccuracy: 'moderate'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    script: 'cjk',
    isRTL: false,
    tesseractCode: 'jpn',
    region: 'asia',
    ocrAccuracy: 'moderate'
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    script: 'cjk',
    isRTL: false,
    tesseractCode: 'kor',
    region: 'asia',
    ocrAccuracy: 'moderate'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    script: 'indic',
    isRTL: false,
    tesseractCode: 'hin',
    region: 'asia',
    ocrAccuracy: 'moderate'
  },

  // Southeast Asia
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    script: 'thai',
    isRTL: false,
    tesseractCode: 'tha',
    region: 'southeast-asia',
    ocrAccuracy: 'moderate'
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    script: 'latin',
    isRTL: false,
    tesseractCode: 'vie',
    region: 'southeast-asia',
    ocrAccuracy: 'good'
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    script: 'latin',
    isRTL: false,
    tesseractCode: 'ind',
    region: 'southeast-asia',
    ocrAccuracy: 'high'
  },
  {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    flag: '🇲🇾',
    script: 'latin',
    isRTL: false,
    tesseractCode: 'msa',
    region: 'southeast-asia',
    ocrAccuracy: 'high'
  }
];

/**
 * Languages grouped by region for organized UI display
 */
export const LANGUAGES_BY_REGION = {
  europe: SUPPORTED_LANGUAGES.filter(l => l.region === 'europe'),
  'middle-east': SUPPORTED_LANGUAGES.filter(l => l.region === 'middle-east'),
  asia: SUPPORTED_LANGUAGES.filter(l => l.region === 'asia'),
  'southeast-asia': SUPPORTED_LANGUAGES.filter(l => l.region === 'southeast-asia')
};

/**
 * Region display names for UI
 */
export const REGION_NAMES = {
  europe: 'Europe',
  'middle-east': 'Middle East',
  asia: 'Asia',
  'southeast-asia': 'Southeast Asia'
} as const;

/**
 * Helper to get language by code
 */
export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(l => l.code === code);
};

/**
 * Helper to check if language is RTL
 */
export const isRTLLanguage = (code: string): boolean => {
  const language = getLanguageByCode(code);
  return language?.isRTL ?? false;
};

/**
 * Get Tesseract code for language
 */
export const getTesseractCode = (languageCode: string): string => {
  const language = getLanguageByCode(languageCode);
  return language?.tesseractCode ?? 'eng';
};

/**
 * Font families by script type
 * Used to ensure proper text rendering for different scripts
 */
export const FONT_FAMILIES = {
  latin: '"Inter", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  arabic: '"Noto Sans Arabic", "Noto Naskh Arabic", sans-serif',
  cyrillic: '"Inter", "SF Pro", sans-serif',
  cjk: '"Noto Sans CJK SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
  indic: '"Noto Sans Devanagari", sans-serif',
  thai: '"Noto Sans Thai", sans-serif'
} as const;

/**
 * Get appropriate font family for language
 */
export const getFontFamily = (languageCode: string): string => {
  const language = getLanguageByCode(languageCode);
  if (!language) return FONT_FAMILIES.latin;
  return FONT_FAMILIES[language.script];
};

/**
 * Expected OCR accuracy thresholds
 * Used to determine if OCR confidence is acceptable
 */
export const OCR_CONFIDENCE_THRESHOLDS = {
  high: 95, // 95%+ = High confidence
  medium: 70, // 70-95% = Medium confidence
  low: 0 // <70% = Low confidence (warning shown)
} as const;

/**
 * Get confidence level from score
 */
export const getConfidenceLevel = (score: number): 'high' | 'medium' | 'low' => {
  if (score >= OCR_CONFIDENCE_THRESHOLDS.high) return 'high';
  if (score >= OCR_CONFIDENCE_THRESHOLDS.medium) return 'medium';
  return 'low';
};

/**
 * Translation quality thresholds
 */
export const TRANSLATION_QUALITY_THRESHOLDS = {
  high: 90,
  medium: 75,
  low: 0
} as const;

/**
 * Supported translation services
 */
export const TRANSLATION_SERVICES = {
  google: 'Google Translate',
  deepl: 'DeepL',
  manual: 'Manual Translation'
} as const;

export type TranslationService = keyof typeof TRANSLATION_SERVICES;

/**
 * Default language preferences
 */
export const DEFAULT_LANGUAGE_PREFERENCES = {
  preferredOcrLanguages: ['en'],
  autoDetectLanguage: true,
  autoTranslate: false,
  defaultTranslationLanguage: 'en',
  useEasternArabicNumerals: false,
  useRtlLayout: true,
  preferredTranslationService: 'google' as TranslationService,
  showTranslationConfidence: true
};

/**
 * Language-specific date formats
 * Used to properly parse and display dates from different locales
 */
export const DATE_FORMATS_BY_LANGUAGE: Record<string, string[]> = {
  en: ['MM/DD/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY'],
  es: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD MMM YYYY'],
  fr: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD MMM YYYY'],
  de: ['DD.MM.YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'],
  it: ['DD/MM/YYYY', 'DD-MM-YYYY'],
  pt: ['DD/MM/YYYY', 'DD-MM-YYYY'],
  ru: ['DD.MM.YYYY', 'DD-MM-YYYY'],
  ar: ['DD/MM/YYYY', 'YYYY/MM/DD'],
  zh: ['YYYY年MM月DD日', 'YYYY-MM-DD', 'YYYY/MM/DD'],
  ja: ['YYYY年MM月DD日', 'YYYY/MM/DD'],
  ko: ['YYYY년 MM월 DD일', 'YYYY-MM-DD']
};
