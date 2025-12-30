/**
 * OCR Utility - Extract text from document images
 * Uses Tesseract.js for client-side OCR processing
 * Enhanced with multi-language support
 */

import { getTesseractCode, DATE_FORMATS_BY_LANGUAGE } from '../constants/languages';
import type { OCRResult } from '../types';

interface OCROptions {
  language?: string; // Language code (e.g., 'en', 'es', 'ar')
  progressCallback?: (progress: number) => void;
}

/**
 * Extract text from an image file using OCR with multi-language support
 */
export async function extractTextFromImage(
  file: File,
  options: OCROptions = {}
): Promise<OCRResult> {
  try {
    const { language = 'en', progressCallback } = options;

    // Get Tesseract language code
    const tesseractLang = getTesseractCode(language);

    console.log(`[OCR] Starting extraction with language: ${language} (Tesseract: ${tesseractLang})`);

    // Dynamically import Tesseract to avoid loading it if not needed
    const Tesseract = await import('tesseract.js');

    const worker = await Tesseract.createWorker(tesseractLang, 1, {
      logger: (m) => {
        // Log and report progress
        if (m.status === 'recognizing text') {
          const progress = Math.round(m.progress * 100);
          console.log(`[OCR] Progress: ${progress}%`);
          progressCallback?.(progress);
        }
      },
    });

    // Perform OCR
    console.log('[OCR] Recognizing text...');
    const { data } = await worker.recognize(file);

    // Terminate worker
    await worker.terminate();

    console.log(`[OCR] Extraction complete. Confidence: ${data.confidence}%`);

    // Extract structured fields from OCR text (language-aware)
    const fields = extractFieldsFromText(data.text, language);

    return {
      text: data.text,
      confidence: data.confidence || 0,
      language,
      fields,
    };
  } catch (error) {
    console.error('[OCR] Extraction failed:', error);
    throw new Error('Failed to extract text from image. Please try again or enter details manually.');
  }
}

/**
 * Extract text with automatic language detection
 * First detects language, then performs OCR with correct language
 */
export async function extractTextWithAutoLanguage(
  file: File,
  preferredLanguages?: string[],
  progressCallback?: (progress: number) => void
): Promise<OCRResult & { detectedLanguage: string }> {
  try {
    console.log('[OCR] Auto-language extraction starting...');

    // Import language detection
    const { detectLanguageSmart } = await import('../services/languageDetection');

    // Step 1: Detect language (0-30% progress)
    progressCallback?.(10);
    const detection = await detectLanguageSmart(file, {
      preferredLanguages,
      autoDetect: true
    });

    console.log(`[OCR] Detected language: ${detection.languageName} (${detection.confidence}%)`);
    progressCallback?.(30);

    // Step 2: Perform OCR with detected language (30-100% progress)
    const result = await extractTextFromImage(file, {
      language: detection.languageCode,
      progressCallback: (ocrProgress) => {
        // Map OCR progress from 30-100%
        const totalProgress = 30 + (ocrProgress * 0.7);
        progressCallback?.(Math.round(totalProgress));
      }
    });

    return {
      ...result,
      detectedLanguage: detection.languageCode,
      confidence: Math.min(result.confidence, detection.confidence) // Use lower confidence
    };
  } catch (error) {
    console.error('[OCR] Auto-language extraction failed:', error);
    throw new Error('Failed to extract text with automatic language detection.');
  }
}

/**
 * Extract structured fields from OCR text
 * Attempts to identify document number, dates, and names
 * Language-aware extraction
 */
function extractFieldsFromText(text: string, language: string = 'en'): NonNullable<OCRResult['fields']> {
  const fields: NonNullable<OCRResult['fields']> = {};
  
  // Clean text
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // Extract document number (usually alphanumeric, 6-20 chars)
  const docNumberMatch = cleanText.match(/\b([A-Z0-9]{6,20})\b/);
  if (docNumberMatch) {
    fields.documentNumber = docNumberMatch[1];
  }

  // Extract dates (various formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, etc.)
  const datePatterns = [
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/g, // MM/DD/YYYY or DD/MM/YYYY
    /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g, // YYYY-MM-DD
    /\b(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/gi, // DD Month YYYY
  ];

  const dates: string[] = [];
  datePatterns.forEach(pattern => {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        dates.push(match[1]);
      }
    }
  });

  // Try to identify expiration date (language-aware keywords)
  const expiryKeywords = getExpiryKeywords(language);
  const expirySection = cleanText.split('\n').find(line => expiryKeywords.test(line));
  
  if (expirySection && dates.length > 0) {
    // Find date near expiry keywords
    const dateInSection = expirySection.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);
    if (dateInSection) {
      fields.expirationDate = normalizeDate(dateInSection[1]);
    }
  } else if (dates.length > 0) {
    // Use the latest date as expiration (heuristic)
    fields.expirationDate = normalizeDate(dates[dates.length - 1]);
  }

  // Extract issue date (language-aware keywords)
  const issueKeywords = getIssueKeywords(language);
  const issueSection = cleanText.split('\n').find(line => issueKeywords.test(line));
  
  if (issueSection && dates.length > 0) {
    const dateInSection = issueSection.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);
    if (dateInSection) {
      fields.issueDate = normalizeDate(dateInSection[1]);
    }
  } else if (dates.length > 1) {
    // Use the earliest date as issue date
    fields.issueDate = normalizeDate(dates[0]);
  }

  // Extract name (language-aware keywords)
  const nameKeywords = getNameKeywords(language);
  const nameSection = cleanText.split('\n').find(line => nameKeywords.test(line));
  
  if (nameSection) {
    // Extract text after name keywords (usually 2-4 words)
    const nameMatch = nameSection.match(/(?:name|full name|holder|bearer)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);
    if (nameMatch && nameMatch[1]) {
      fields.name = nameMatch[1].trim();
    }
  }

  return fields;
}

/**
 * Normalize date string to YYYY-MM-DD format
 */
function normalizeDate(dateStr: string): string {
  try {
    // Try to parse various date formats
    const cleaned = dateStr.replace(/[^\d\/\-]/g, '');
    const parts = cleaned.split(/[\/\-]/);
    
    if (parts.length === 3) {
      let year: number, month: number, day: number;
      
      // Determine format (MM/DD/YYYY vs DD/MM/YYYY vs YYYY-MM-DD)
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
      } else if (parseInt(parts[0]) > 12) {
        // DD/MM/YYYY
        day = parseInt(parts[0]);
        month = parseInt(parts[1]);
        year = parseInt(parts[2]);
        if (year < 100) year += 2000; // Convert 2-digit year
      } else {
        // MM/DD/YYYY (US format)
        month = parseInt(parts[0]);
        day = parseInt(parts[1]);
        year = parseInt(parts[2]);
        if (year < 100) year += 2000;
      }
      
      // Validate and format
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  } catch (error) {
    console.warn('Date normalization failed:', error);
  }
  
  return dateStr; // Return original if normalization fails
}

/**
 * Language-aware keyword patterns for field extraction
 */
function getExpiryKeywords(language: string): RegExp {
  const keywords: Record<string, string[]> = {
    en: ['exp', 'expiry', 'expires', 'valid until', 'valid thru', 'expiration'],
    es: ['exp', 'caduca', 'caducidad', 'válido hasta', 'vence', 'vencimiento'],
    fr: ['exp', 'expire', 'expiration', 'valable jusqu', 'validité'],
    de: ['gültig bis', 'ablauf', 'verfällt', 'gültigkeit'],
    ar: ['انتهاء', 'صلاحية', 'تاريخ الانتهاء'],
    pt: ['exp', 'validade', 'expira', 'válido até'],
    it: ['scad', 'scadenza', 'valido fino'],
    ru: ['срок действия', 'действителен до'],
    zh: ['有效期', '到期', '失效']
  };

  const langKeywords = keywords[language] || keywords['en'];
  return new RegExp(`(${langKeywords.join('|')})`, 'i');
}

function getIssueKeywords(language: string): RegExp {
  const keywords: Record<string, string[]> = {
    en: ['issue', 'issued', 'date of issue', 'issued on'],
    es: ['emisión', 'fecha de emisión', 'expedición'],
    fr: ['émission', 'date d\'émission', 'délivré'],
    de: ['ausgestellt', 'ausgabe', 'ausstellungsdatum'],
    ar: ['إصدار', 'تاريخ الإصدار'],
    pt: ['emissão', 'data de emissão', 'emitido'],
    it: ['emissione', 'data di emissione', 'rilascio'],
    ru: ['выдан', 'дата выдачи'],
    zh: ['签发', '颁发日期']
  };

  const langKeywords = keywords[language] || keywords['en'];
  return new RegExp(`(${langKeywords.join('|')})`, 'i');
}

function getNameKeywords(language: string): RegExp {
  const keywords: Record<string, string[]> = {
    en: ['name', 'full name', 'holder', 'bearer', 'surname', 'given name'],
    es: ['nombre', 'apellidos', 'titular', 'portador'],
    fr: ['nom', 'prénom', 'titulaire', 'porteur'],
    de: ['name', 'nachname', 'vorname', 'inhaber'],
    ar: ['الاسم', 'اسم', 'حامل'],
    pt: ['nome', 'sobrenome', 'titular', 'portador'],
    it: ['nome', 'cognome', 'titolare', 'portatore'],
    ru: ['имя', 'фамилия', 'владелец'],
    zh: ['姓名', '名', '持有人']
  };

  const langKeywords = keywords[language] || keywords['en'];
  return new RegExp(`(${langKeywords.join('|')})`, 'i');
}

/**
 * Check if OCR is available (Tesseract.js can be loaded)
 */
export async function isOCRAvailable(): Promise<boolean> {
  try {
    await import('tesseract.js');
    return true;
  } catch {
    return false;
  }
}

/**
 * Download language data for offline OCR (optional enhancement)
 * Downloads Tesseract language data for specified languages
 */
export async function downloadLanguageData(languageCode: string): Promise<boolean> {
  try {
    const tesseractCode = getTesseractCode(languageCode);
    console.log(`[OCR] Downloading language data for ${tesseractCode}...`);

    // Tesseract.js automatically downloads language data when needed
    // This function is a placeholder for future enhancements
    return true;
  } catch (error) {
    console.error('[OCR] Language data download failed:', error);
    return false;
  }
}

