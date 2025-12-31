/**
 * OCR Configuration
 * Manages API keys and configuration for OCR services
 */

export interface OCRConfig {
  microblinkApiKey: string | null;
  googleCloudVisionApiKey: string | null;
  isMicroblinkEnabled: boolean;
  isGoogleVisionEnabled: boolean;
  isTesseractEnabled: boolean;
}

/**
 * Get Microblink API key from environment
 */
export function getMicroblinkApiKey(): string | null {
  return import.meta.env.VITE_MICROBLINK_API_KEY || null;
}

/**
 * Get Google Cloud Vision API key from environment
 */
export function getGoogleCloudVisionApiKey(): string | null {
  return import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY || null;
}

/**
 * Check if Microblink is configured
 */
export function isMicroblinkConfigured(): boolean {
  const apiKey = getMicroblinkApiKey();
  return apiKey !== null && apiKey.trim() !== '' && apiKey !== 'your_microblink_api_key';
}

/**
 * Check if Google Cloud Vision is configured
 */
export function isGoogleVisionConfigured(): boolean {
  const apiKey = getGoogleCloudVisionApiKey();
  return apiKey !== null && apiKey.trim() !== '' && apiKey !== 'your_google_cloud_vision_api_key';
}

/**
 * Check if Tesseract.js is available (always true, it's a client-side library)
 */
export function isTesseractAvailable(): boolean {
  return true; // Tesseract.js is always available as it's bundled
}

/**
 * Get OCR configuration
 */
export function getOCRConfig(): OCRConfig {
  return {
    microblinkApiKey: getMicroblinkApiKey(),
    googleCloudVisionApiKey: getGoogleCloudVisionApiKey(),
    isMicroblinkEnabled: isMicroblinkConfigured(),
    isGoogleVisionEnabled: isGoogleVisionConfigured(),
    isTesseractEnabled: isTesseractAvailable(),
  };
}

/**
 * Validate OCR configuration on initialization
 */
export function validateOCRConfig(): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const config = getOCRConfig();

  // Microblink is optional (primary for ID documents)
  if (!config.isMicroblinkEnabled) {
    warnings.push('Microblink API key not configured. Will use Google Vision or Tesseract as fallback.');
  }

  // Google Cloud Vision is optional, so missing key is just a warning
  if (!config.isGoogleVisionEnabled) {
    warnings.push('Google Cloud Vision API key not configured. Tesseract.js will be used as fallback.');
  }

  // Tesseract should always be available
  if (!config.isTesseractEnabled) {
    errors.push('Tesseract.js is not available. OCR functionality will not work.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate on module load
const validation = validateOCRConfig();
if (validation.warnings.length > 0) {
  console.warn('⚠️ OCR Configuration Warnings:', validation.warnings);
}
if (!validation.isValid) {
  console.error('❌ OCR Configuration Errors:', validation.errors);
}

