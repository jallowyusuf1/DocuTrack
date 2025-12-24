/**
 * OCR Utility - Extract text from document images
 * Uses Tesseract.js for client-side OCR processing
 */

interface OCRResult {
  text: string;
  confidence: number;
  fields?: {
    documentNumber?: string;
    expirationDate?: string;
    issueDate?: string;
    name?: string;
  };
}

/**
 * Extract text from an image file using OCR
 */
export async function extractTextFromImage(file: File): Promise<OCRResult> {
  try {
    // Dynamically import Tesseract to avoid loading it if not needed
    const Tesseract = await import('tesseract.js');
    
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        // Log progress if needed
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // Perform OCR
    const { data } = await worker.recognize(file);
    
    // Terminate worker
    await worker.terminate();

    // Extract structured fields from OCR text
    const fields = extractFieldsFromText(data.text);

    return {
      text: data.text,
      confidence: data.confidence || 0,
      fields,
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract text from image. Please try again or enter details manually.');
  }
}

/**
 * Extract structured fields from OCR text
 * Attempts to identify document number, dates, and names
 */
function extractFieldsFromText(text: string): OCRResult['fields'] {
  const fields: OCRResult['fields'] = {};
  
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

  // Try to identify expiration date (usually the latest date or contains "exp", "expiry", "valid until")
  const expiryKeywords = /(exp|expiry|expires|valid until|valid thru)/i;
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

  // Extract issue date (usually earlier date or contains "issue", "issued")
  const issueKeywords = /(issue|issued|date of issue)/i;
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

  // Extract name (usually appears near "name", "full name", "holder", etc.)
  const nameKeywords = /(name|full name|holder|bearer)/i;
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

