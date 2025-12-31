/**
 * Field Extraction Utilities
 * Extract structured data from OCR text
 */

export interface ExtractedField {
  value: string;
  confidence: number;
}

export interface ExtractedFields {
  documentNumber?: ExtractedField;
  expirationDate?: ExtractedField;
  issueDate?: ExtractedField;
  firstName?: ExtractedField;
  lastName?: ExtractedField;
  fullName?: ExtractedField;
  dateOfBirth?: ExtractedField;
  nationality?: ExtractedField;
  [key: string]: ExtractedField | undefined;
}

/**
 * Parse date string to ISO format (YYYY-MM-DD)
 */
function parseDate(dateStr: string): string | null {
  // Try various date formats
  const patterns = [
    // MM/DD/YYYY or DD/MM/YYYY
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
    // DD MMM YYYY
    /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})$/i,
  ];

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      if (pattern === patterns[0]) {
        // MM/DD/YYYY or DD/MM/YYYY - assume MM/DD/YYYY for US documents
        const [, part1, part2, year] = match;
        const month = parseInt(part1, 10);
        const day = parseInt(part2, 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
      } else if (pattern === patterns[1]) {
        // YYYY-MM-DD
        const [, year, month, day] = match;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else if (pattern === patterns[2]) {
        // DD MMM YYYY
        const [, day, monthName, year] = match;
        const month = monthNames.indexOf(monthName.toLowerCase()) + 1;
        if (month > 0) {
          return `${year}-${month.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    }
  }

  return null;
}

/**
 * Extract dates from text
 */
export function extractDates(text: string): Array<{ raw: string; parsed: string; confidence: number }> {
  const dates: Array<{ raw: string; parsed: string; confidence: number }> = [];
  
  const patterns = [
    // MM/DD/YYYY or DD/MM/YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
    // YYYY-MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,
    // DD MMM YYYY
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const parsed = parseDate(match[0]);
      if (parsed) {
        dates.push({
          raw: match[0],
          parsed,
          confidence: 90,
        });
      }
    }
  }

  return dates;
}

/**
 * Extract document number based on document type
 */
export function extractDocumentNumber(text: string, documentType?: string): ExtractedField | null {
  const patterns: Record<string, RegExp> = {
    passport: /P[0-9]{8,9}/i,
    driver_license: /[A-Z]{1,2}[0-9]{6,8}/i,
    social_security_card: /\d{3}-\d{2}-\d{4}/,
    national_id: /[A-Z0-9]{8,12}/i,
    visa: /[A-Z0-9]{8,12}/i,
  };

  // Try document-specific pattern first
  if (documentType) {
    const pattern = patterns[documentType.toLowerCase()];
    if (pattern) {
      const match = text.match(pattern);
      if (match) {
        return {
          value: match[0],
          confidence: 85,
        };
      }
    }
  }

  // Try generic patterns
  const genericPatterns = [
    /\b[A-Z]{1,2}[0-9]{6,10}\b/i, // Alphanumeric codes
    /\b[0-9]{8,12}\b/, // Long numeric codes
  ];

  for (const pattern of genericPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        value: match[0],
        confidence: 70,
      };
    }
  }

  return null;
}

/**
 * Extract name from text
 */
export function extractName(text: string): { fullName?: ExtractedField; firstName?: ExtractedField; lastName?: ExtractedField } {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Look for capitalized words (likely names)
  const namePattern = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/;
  
  for (const line of lines) {
    const match = line.match(namePattern);
    if (match && line.split(/\s+/).length >= 2) {
      const parts = line.split(/\s+/);
      const fullName = line;
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');

      return {
        fullName: {
          value: fullName,
          confidence: 85,
        },
        firstName: {
          value: firstName,
          confidence: 85,
        },
        lastName: {
          value: lastName,
          confidence: 85,
        },
      };
    }
  }

  return {};
}

/**
 * Extract country from text
 */
export function extractCountry(text: string): ExtractedField | null {
  const countries = [
    'United States', 'USA', 'US',
    'Canada', 'CAN', 'CA',
    'Mexico', 'MEX', 'MX',
    'United Kingdom', 'UK', 'GB',
    'France', 'FRA', 'FR',
    'Germany', 'DEU', 'DE',
    'Spain', 'ESP', 'ES',
    'Italy', 'ITA', 'IT',
    'Japan', 'JPN', 'JP',
    'China', 'CHN', 'CN',
    'India', 'IND', 'IN',
    'Australia', 'AUS', 'AU',
    'Brazil', 'BRA', 'BR',
    'Russia', 'RUS', 'RU',
  ];

  const upperText = text.toUpperCase();

  for (const country of countries) {
    if (upperText.includes(country.toUpperCase())) {
      return {
        value: country,
        confidence: 90,
      };
    }
  }

  return null;
}

/**
 * Main function to extract all fields from OCR text
 */
export function extractFields(text: string, documentType?: string): ExtractedFields {
  const fields: ExtractedFields = {};

  // Extract dates
  const dates = extractDates(text);
  if (dates.length > 0) {
    // Assume first date is issue date, last is expiration date
    if (dates.length >= 1) {
      fields.issueDate = {
        value: dates[0].parsed,
        confidence: dates[0].confidence,
      };
    }
    if (dates.length >= 2) {
      fields.expirationDate = {
        value: dates[dates.length - 1].parsed,
        confidence: dates[dates.length - 1].confidence,
      };
    }
    // Look for date of birth patterns
    const dobPatterns = [/DOB[:\s]+([0-9\/\-]+)/i, /Date of Birth[:\s]+([0-9\/\-]+)/i];
    for (const pattern of dobPatterns) {
      const match = text.match(pattern);
      if (match) {
        const parsed = parseDate(match[1]);
        if (parsed) {
          fields.dateOfBirth = {
            value: parsed,
            confidence: 90,
          };
          break;
        }
      }
    }
  }

  // Extract document number
  const docNumber = extractDocumentNumber(text, documentType);
  if (docNumber) {
    fields.documentNumber = docNumber;
  }

  // Extract name
  const nameInfo = extractName(text);
  if (nameInfo.fullName) {
    fields.fullName = nameInfo.fullName;
  }
  if (nameInfo.firstName) {
    fields.firstName = nameInfo.firstName;
  }
  if (nameInfo.lastName) {
    fields.lastName = nameInfo.lastName;
  }

  // Extract country/nationality
  const country = extractCountry(text);
  if (country) {
    fields.nationality = country;
  }

  return fields;
}


