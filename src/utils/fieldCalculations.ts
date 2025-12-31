// Field calculation utilities

/**
 * Calculate days until expiry date
 */
export const calculateDaysUntilExpiry = (expiryDate: string | null | undefined): number | null => {
  if (!expiryDate) return null;

  try {
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch {
    return null;
  }
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (
  dateOfBirth: string | null | undefined,
  referenceDate?: string
): number | null => {
  if (!dateOfBirth) return null;

  try {
    const birth = new Date(dateOfBirth);
    const reference = referenceDate ? new Date(referenceDate) : new Date();

    let age = reference.getFullYear() - birth.getFullYear();
    const monthDiff = reference.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  } catch {
    return null;
  }
};

/**
 * Calculate validity period between issue and expiry dates
 */
export const calculateValidityPeriod = (
  issueDate: string | null | undefined,
  expiryDate: string | null | undefined
): { years: number; months: number; days: number } | null => {
  if (!issueDate || !expiryDate) return null;

  try {
    const issue = new Date(issueDate);
    const expiry = new Date(expiryDate);

    const diffTime = expiry.getTime() - issue.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;

    return { years, months, days };
  } catch {
    return null;
  }
};

/**
 * Parse MRZ (Machine Readable Zone) code
 * Basic implementation - can be enhanced
 */
export const parseMRZ = (mrzCode: string): Record<string, string> | null => {
  if (!mrzCode || mrzCode.length < 44) return null;

  try {
    const lines = mrzCode.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 2) return null;

    const result: Record<string, string> = {};

    // Passport MRZ typically has 2 lines of 44 characters each
    // Line 1: Document type, issuing country, name
    // Line 2: Document number, date of birth, expiry date, nationality, etc.

    if (lines.length >= 2) {
      const line1 = lines[0].trim();
      const line2 = lines[1].trim();

      // Extract document type (first 2 chars of line 1)
      if (line1.length >= 2) {
        result.document_type = line1.substring(0, 2);
      }

      // Extract issuing country (chars 2-5 of line 1)
      if (line1.length >= 5) {
        result.issuing_country = line1.substring(2, 5);
      }

      // Extract document number (first 9 chars of line 2, remove filler chars)
      if (line2.length >= 9) {
        result.document_number = line2.substring(0, 9).replace(/</g, '').trim();
      }

      // Extract date of birth (chars 13-19 of line 2, format: YYMMDD)
      if (line2.length >= 19) {
        const dobStr = line2.substring(13, 19);
        if (dobStr.match(/^\d{6}$/)) {
          const year = parseInt(dobStr.substring(0, 2));
          const month = dobStr.substring(2, 4);
          const day = dobStr.substring(4, 6);
          // Assume 1900s for years 00-30, 2000s for 31-99
          const fullYear = year <= 30 ? 2000 + year : 1900 + year;
          result.date_of_birth = `${fullYear}-${month}-${day}`;
        }
      }

      // Extract expiry date (chars 21-27 of line 2, format: YYMMDD)
      if (line2.length >= 27) {
        const expStr = line2.substring(21, 27);
        if (expStr.match(/^\d{6}$/)) {
          const year = parseInt(expStr.substring(0, 2));
          const month = expStr.substring(2, 4);
          const day = expStr.substring(4, 6);
          const fullYear = year <= 30 ? 2000 + year : 1900 + year;
          result.expiry_date = `${fullYear}-${month}-${day}`;
        }
      }

      // Extract nationality (chars 28-31 of line 2)
      if (line2.length >= 31) {
        result.nationality = line2.substring(28, 31);
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
};

/**
 * Format validity period as human-readable string
 */
export const formatValidityPeriod = (
  period: { years: number; months: number; days: number } | null
): string => {
  if (!period) return '';

  const parts: string[] = [];

  if (period.years > 0) {
    parts.push(`${period.years} ${period.years === 1 ? 'year' : 'years'}`);
  }

  if (period.months > 0) {
    parts.push(`${period.months} ${period.months === 1 ? 'month' : 'months'}`);
  }

  if (period.days > 0 && period.years === 0) {
    parts.push(`${period.days} ${period.days === 1 ? 'day' : 'days'}`);
  }

  return parts.length > 0 ? parts.join(', ') : '0 days';
};

/**
 * Get expiry status color
 */
export const getExpiryStatusColor = (daysUntilExpiry: number | null): string => {
  if (daysUntilExpiry === null) return '#6B7280'; // Gray
  if (daysUntilExpiry < 0) return '#EF4444'; // Red - expired
  if (daysUntilExpiry < 30) return '#EF4444'; // Red - urgent
  if (daysUntilExpiry < 90) return '#F59E0B'; // Orange - soon
  return '#10B981'; // Green - good
};

/**
 * Get expiry status message
 */
export const getExpiryStatusMessage = (daysUntilExpiry: number | null): string => {
  if (daysUntilExpiry === null) return 'No expiry date';
  if (daysUntilExpiry < 0) return 'Expired';
  if (daysUntilExpiry < 7) return 'Expires very soon';
  if (daysUntilExpiry < 30) return 'Expires soon';
  if (daysUntilExpiry < 90) return 'Expires in less than 3 months';
  return 'Valid';
};





