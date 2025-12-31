/**
 * Comprehensive OCR Service
 * Multi-service OCR with fallback strategy:
 * 1. Microblink BlinkID (primary for ID documents)
 * 2. Google Cloud Vision (secondary for generic documents)
 * 3. Tesseract.js (tertiary/offline fallback)
 */

import { getOCRConfig } from '../config/ocr';
import { assessImageQuality } from '../utils/imageQuality';
import { preprocessImage } from '../utils/imagePreprocessing';
import { performVisionOCR } from './googleVision';
import type { OCRResult, DocumentType } from '../types';

interface OCROptions {
  language?: string;
  documentType?: DocumentType;
  progressCallback?: (progress: number) => void;
  preferredService?: 'microblink' | 'google' | 'tesseract' | 'auto';
}

interface RetryConfig {
  maxRetries: number;
  delay: number; // in milliseconds
  backoff: number; // multiplier for exponential backoff
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delay: 1000,
  backoff: 2,
};

/**
 * Convert File to base64
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64String = base64.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on 429 if we've exhausted retries
      if (error.status === 429 && attempt < config.maxRetries) {
        const retryAfter = error.retryAfter || config.delay * Math.pow(config.backoff, attempt);
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        continue;
      }
      
      // Don't retry client errors (4xx) except 429
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }
      
      // Retry on network/server errors
      if (attempt < config.maxRetries) {
        const delay = config.delay * Math.pow(config.backoff, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All retries exhausted');
}

/**
 * OCR with Microblink BlinkID
 */
async function ocrWithMicroblink(
  file: File,
  progressCallback?: (progress: number) => void
): Promise<OCRResult> {
  const config = getOCRConfig();
  
  if (!config.isMicroblinkEnabled || !config.microblinkApiKey) {
    throw new Error('Microblink API key not configured');
  }

  progressCallback?.(10);

  return retryWithBackoff(async () => {
    const base64Image = await fileToBase64(file);
    progressCallback?.(30);

    const response = await fetch('https://api.microblink.com/v1/recognizers/blinkid', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.microblinkApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64Image,
        returnFullDocumentImage: false,
        returnFaceImage: false,
        returnSignatureImage: false,
      }),
    });

    progressCallback?.(60);

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const error: any = new Error('Rate limit exceeded');
      error.status = 429;
      error.retryAfter = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
      throw error;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Microblink API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    progressCallback?.(90);

    const result = data.result;
    if (!result) {
      throw new Error('No result from Microblink API');
    }

    // Extract fields with confidence scores
    const fields: OCRResult['fields'] = {};
    
    if (result.documentNumber?.value && result.documentNumber.confidence > 70) {
      fields.documentNumber = {
        value: result.documentNumber.value,
        confidence: result.documentNumber.confidence,
      };
    }

    if (result.firstName?.value && result.firstName.confidence > 70) {
      fields.firstName = {
        value: result.firstName.value,
        confidence: result.firstName.confidence,
      };
    }

    if (result.lastName?.value && result.lastName.confidence > 70) {
      fields.lastName = {
        value: result.lastName.value,
        confidence: result.lastName.confidence,
      };
    }

    if (result.fullName?.value && result.fullName.confidence > 70) {
      fields.fullName = {
        value: result.fullName.value,
        confidence: result.fullName.confidence,
      };
    }

    if (result.dateOfBirth?.value && result.dateOfBirth.confidence > 70) {
      fields.dateOfBirth = {
        value: result.dateOfBirth.value,
        confidence: result.dateOfBirth.confidence,
      };
    }

    if (result.dateOfExpiry?.value && result.dateOfExpiry.confidence > 70) {
      fields.expirationDate = {
        value: result.dateOfExpiry.value,
        confidence: result.dateOfExpiry.confidence,
      };
    }

    if (result.dateOfIssue?.value && result.dateOfIssue.confidence > 70) {
      fields.issueDate = {
        value: result.dateOfIssue.value,
        confidence: result.dateOfIssue.confidence,
      };
    }

    if (result.nationality?.value && result.nationality.confidence > 70) {
      fields.nationality = {
        value: result.nationality.value,
        confidence: result.nationality.confidence,
      };
    }

    // Calculate overall confidence
    const confidences = Object.values(fields)
      .filter(f => f)
      .map(f => (f as { confidence: number }).confidence);
    const avgConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

    progressCallback?.(100);

    return {
      text: result.fullTextAnnotation?.text || '',
      confidence: Math.round(avgConfidence),
      source: 'microblink',
      language: result.locale || 'en',
      fields,
      detectedDocumentType: result.classInfo?.type
        ? {
            type: mapMicroblinkDocumentType(result.classInfo.type),
            confidence: result.classInfo.confidence || 90,
          }
        : undefined,
    };
  });
}

/**
 * Map Microblink document type to our DocumentType
 */
function mapMicroblinkDocumentType(type: string): DocumentType {
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes('passport')) return 'passport';
  if (typeLower.includes('driver') || typeLower.includes('license')) return 'driver_license';
  if (typeLower.includes('id') || typeLower.includes('identity')) return 'national_id';
  if (typeLower.includes('visa')) return 'visa';
  
  return 'other';
}

/**
 * OCR with Google Cloud Vision
 */
async function ocrWithGoogle(
  file: File,
  language?: string,
  progressCallback?: (progress: number) => void
): Promise<OCRResult> {
  progressCallback?.(20);

  return retryWithBackoff(async () => {
    const languageHints = language ? [language] : undefined;
    const result = await performVisionOCR(file, languageHints);
    progressCallback?.(80);

    // Extract fields from text (enhanced extraction)
    const fields = extractFieldsFromText(result.text, language || 'en');

    progressCallback?.(100);

    return {
      text: result.text,
      confidence: result.confidence,
      source: 'google',
      language: result.detectedLanguage || language,
      fields,
      detectedDocumentType: detectDocumentType(result.text),
    };
  });
}

/**
 * OCR with Tesseract.js
 */
async function ocrWithTesseract(
  file: File,
  language: string = 'en',
  progressCallback?: (progress: number) => void
): Promise<OCRResult> {
  progressCallback?.(10);

  const { getTesseractCode } = await import('../constants/languages');
  const tesseractLang = getTesseractCode(language);

  const Tesseract = await import('tesseract.js');
  progressCallback?.(20);

  const worker = await Tesseract.createWorker(tesseractLang, 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        const progress = 20 + Math.round(m.progress * 70); // 20-90%
        progressCallback?.(progress);
      }
    },
  });

  const { data } = await worker.recognize(file);
  await worker.terminate();

  // Extract fields from text
  const fields = extractFieldsFromText(data.text, language);

  progressCallback?.(100);

  return {
    text: data.text,
    confidence: data.confidence || 0,
    source: 'tesseract',
    language,
    fields,
    detectedDocumentType: detectDocumentType(data.text),
  };
}

/**
 * Extract structured fields from OCR text
 */
function extractFieldsFromText(text: string, language: string = 'en'): OCRResult['fields'] {
  const fields: OCRResult['fields'] = {};
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // Extract document number
  const docNumberPatterns = [
    /\b([A-Z]{1,2}\d{6,12})\b/g, // Passport format
    /\b([A-Z]\d{7,8})\b/g, // Driver license
    /\b(\d{3}-\d{2}-\d{4})\b/g, // SSN
    /\b([A-Z0-9]{8,15})\b/g, // Generic document number
  ];

  for (const pattern of docNumberPatterns) {
    const match = text.match(pattern);
    if (match) {
      fields.documentNumber = {
        value: match[0],
        confidence: 85,
      };
      break;
    }
  }

  // Extract dates
  const dates = extractDates(text);
  
  // Extract expiration date
  const expiryKeywords = getExpiryKeywords(language);
  const expirySection = cleanText.split('\n').find(line => expiryKeywords.test(line));
  
  if (expirySection && dates.length > 0) {
    const dateInSection = expirySection.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);
    if (dateInSection) {
      fields.expirationDate = {
        value: normalizeDate(dateInSection[1]),
        confidence: 85,
      };
    }
  } else if (dates.length > 0) {
    fields.expirationDate = {
      value: normalizeDate(dates[dates.length - 1].raw),
      confidence: 75,
    };
  }

  // Extract issue date
  const issueKeywords = getIssueKeywords(language);
  const issueSection = cleanText.split('\n').find(line => issueKeywords.test(line));
  
  if (issueSection && dates.length > 0) {
    const dateInSection = issueSection.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);
    if (dateInSection) {
      fields.issueDate = {
        value: normalizeDate(dateInSection[1]),
        confidence: 85,
      };
    }
  } else if (dates.length > 1) {
    fields.issueDate = {
      value: normalizeDate(dates[0].raw),
      confidence: 75,
    };
  }

  // Extract date of birth
  const dobKeywords = /(?:date of birth|dob|birth date|born)/i;
  const dobSection = cleanText.split('\n').find(line => dobKeywords.test(line));
  if (dobSection && dates.length > 0) {
    const dateInSection = dobSection.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);
    if (dateInSection) {
      fields.dateOfBirth = {
        value: normalizeDate(dateInSection[1]),
        confidence: 85,
      };
    }
  }

  // Extract names
  const nameKeywords = getNameKeywords(language);
  const nameSection = cleanText.split('\n').find(line => nameKeywords.test(line));
  
  if (nameSection) {
    const nameMatch = nameSection.match(/(?:name|full name|holder|bearer)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);
    if (nameMatch && nameMatch[1]) {
      const fullName = nameMatch[1].trim();
      const parts = fullName.split(' ');
      if (parts.length >= 2) {
        fields.firstName = {
          value: parts[0],
          confidence: 80,
        };
        fields.lastName = {
          value: parts.slice(1).join(' '),
          confidence: 80,
        };
      }
      fields.fullName = {
        value: fullName,
        confidence: 85,
      };
    }
  }

  // Extract nationality/country
  const country = extractCountry(text);
  if (country) {
    fields.nationality = {
      value: country,
      confidence: 90,
    };
  }

  return fields;
}

/**
 * Extract dates from text
 */
function extractDates(text: string): Array<{ raw: string; parsed: string }> {
  const patterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g, // MM/DD/YYYY or DD/MM/YYYY
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g, // YYYY-MM-DD
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/gi, // DD MMM YYYY
  ];

  const dates: Array<{ raw: string; parsed: string }> = [];

  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[0]) {
        dates.push({
          raw: match[0],
          parsed: normalizeDate(match[0]),
        });
      }
    }
  });

  return dates;
}

/**
 * Normalize date string to YYYY-MM-DD format
 */
function normalizeDate(dateStr: string): string {
  try {
    const cleaned = dateStr.replace(/[^\d\/\-]/g, '');
    const parts = cleaned.split(/[\/\-]/);

    if (parts.length === 3) {
      let year: number, month: number, day: number;

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
        if (year < 100) year += 2000;
      } else {
        // MM/DD/YYYY (US format)
        month = parseInt(parts[0]);
        day = parseInt(parts[1]);
        year = parseInt(parts[2]);
        if (year < 100) year += 2000;
      }

      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  } catch (error) {
    console.warn('Date normalization failed:', error);
  }

  return dateStr;
}

/**
 * Detect document type from text
 */
function detectDocumentType(text: string): OCRResult['detectedDocumentType'] {
  const lowerText = text.toLowerCase();
  
  const keywords: Record<string, string[]> = {
    passport: ['passport', 'travel document', 'nationality', 'surname', 'passeport', 'pasaporte'],
    driver_license: ['driver license', 'driving license', 'class', 'endorsement', 'restrictions', 'permis de conduire'],
    national_id: ['identity card', 'national id', 'citizen', 'carte d\'identité', 'cédula'],
    birth_certificate: ['birth certificate', 'date of birth', 'place of birth', 'father', 'mother'],
    insurance: ['insurance', 'policy number', 'group number', 'member id'],
    visa: ['visa', 'visa type', 'port of entry', 'valid until'],
  };

  const scores: Record<string, number> = {};

  for (const [type, words] of Object.entries(keywords)) {
    scores[type] = 0;
    words.forEach(word => {
      if (lowerText.includes(word)) {
        scores[type]++;
      }
    });
  }

  const detected = Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  );

  const confidence = scores[detected] > 0
    ? Math.min(95, (scores[detected] / keywords[detected].length) * 100)
    : 50;

  return {
    type: detected as DocumentType,
    confidence: Math.round(confidence),
  };
}

/**
 * Extract country from text
 */
function extractCountry(text: string): string | null {
  const countries = [
    'United States', 'USA', 'US', 'Canada', 'CAN', 'CA',
    'Mexico', 'MEX', 'MX', 'United Kingdom', 'UK', 'GB',
    'France', 'FR', 'Germany', 'DE', 'Spain', 'ES',
    'Italy', 'IT', 'Japan', 'JP', 'China', 'CN',
    'Australia', 'AU', 'Brazil', 'BR', 'India', 'IN',
  ];

  for (const country of countries) {
    if (text.includes(country)) {
      return country;
    }
  }

  return null;
}

/**
 * Language-aware keyword patterns
 */
function getExpiryKeywords(language: string): RegExp {
  const keywords: Record<string, string[]> = {
    en: ['exp', 'expiry', 'expires', 'valid until', 'valid thru', 'expiration'],
    es: ['exp', 'caduca', 'caducidad', 'válido hasta', 'vence'],
    fr: ['exp', 'expire', 'expiration', 'valable jusqu'],
    de: ['gültig bis', 'ablauf', 'verfällt'],
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
  };

  const langKeywords = keywords[language] || keywords['en'];
  return new RegExp(`(${langKeywords.join('|')})`, 'i');
}

function getNameKeywords(language: string): RegExp {
  const keywords: Record<string, string[]> = {
    en: ['name', 'full name', 'holder', 'bearer', 'surname'],
    es: ['nombre', 'apellidos', 'titular'],
    fr: ['nom', 'prénom', 'titulaire'],
    de: ['name', 'nachname', 'vorname'],
  };

  const langKeywords = keywords[language] || keywords['en'];
  return new RegExp(`(${langKeywords.join('|')})`, 'i');
}

/**
 * Main OCR function with fallback strategy
 */
export async function performOCR(
  file: File,
  options: OCROptions = {}
): Promise<OCRResult> {
  const {
    language = 'en',
    documentType,
    progressCallback,
    preferredService = 'auto',
  } = options;

  let progress = 0;

  const updateProgress = (value: number, message?: string) => {
    progress = value;
    progressCallback?.(value);
    if (message) {
      console.log(`[OCR] ${message} (${value}%)`);
    }
  };

  try {
    // Step 1: Assess image quality (0-10%)
    updateProgress(5, 'Assessing image quality...');
    const quality = await assessImageQuality(file);
    
    if (quality.score < 50) {
      throw new Error(`Image quality too low (${quality.score}/100): ${quality.issues.join(', ')}`);
    }

    // Step 2: Preprocess image (10-20%)
    updateProgress(10, 'Preprocessing image...');
    const enhanced = await preprocessImage(file, {
      deskew: true,
      enhanceContrast: true,
      denoise: true,
      binarize: false, // Don't binarize - can lose information
    });
    updateProgress(20, 'Image preprocessed');

    // Determine which service to use
    const config = getOCRConfig();
    const isIDDocument = documentType === 'passport' || 
                         documentType === 'driver_license' || 
                         documentType === 'national_id';

    // Try services in order based on preferred service and document type
    let result: OCRResult | null = null;

    // Strategy 1: Try Microblink for ID documents
    if ((preferredService === 'auto' && isIDDocument) || preferredService === 'microblink') {
      if (config.isMicroblinkEnabled) {
        try {
          updateProgress(25, 'Trying Microblink BlinkID...');
          result = await ocrWithMicroblink(enhanced, (p) => updateProgress(25 + (p * 0.2), 'Processing with Microblink...'));
          if (result.confidence > 80) {
            updateProgress(100, 'OCR complete (Microblink)');
            result.quality = quality;
            return result;
          }
        } catch (error: any) {
          console.warn('[OCR] Microblink failed:', error.message);
          // Continue to next service
        }
      }
    }

    // Strategy 2: Try Google Cloud Vision
    if ((preferredService === 'auto' || preferredService === 'google') && !result) {
      if (config.isGoogleVisionEnabled) {
        try {
          updateProgress(45, 'Trying Google Cloud Vision...');
          result = await ocrWithGoogle(enhanced, language, (p) => updateProgress(45 + (p * 0.2), 'Processing with Google Vision...'));
          if (result.confidence > 70) {
            updateProgress(100, 'OCR complete (Google Vision)');
            result.quality = quality;
            return result;
          }
        } catch (error: any) {
          console.warn('[OCR] Google Vision failed:', error.message);
          // Continue to fallback
        }
      }
    }

    // Strategy 3: Fallback to Tesseract.js (always available)
    if (!result || preferredService === 'tesseract') {
      try {
        updateProgress(65, 'Trying Tesseract.js (offline)...');
        result = await ocrWithTesseract(enhanced, language, (p) => updateProgress(65 + (p * 0.35), 'Processing with Tesseract...'));
        updateProgress(100, 'OCR complete (Tesseract)');
        result.quality = quality;
        return result;
      } catch (error: any) {
        console.error('[OCR] Tesseract failed:', error);
        throw new Error('All OCR services failed. Please try again or enter details manually.');
      }
    }

    if (!result) {
      throw new Error('No OCR service available');
    }

    result.quality = quality;
    return result;

  } catch (error: any) {
    console.error('[OCR] Failed:', error);
    throw error;
  }
}
