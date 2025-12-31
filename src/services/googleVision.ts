/**
 * Google Cloud Vision API Service
 *
 * Provides OCR and document text detection using Google Cloud Vision API
 * More accurate than Tesseract.js for complex documents
 */

interface VisionAPIResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string;
      locale?: string;
      boundingPoly?: {
        vertices: Array<{ x: number; y: number }>;
      };
    }>;
    fullTextAnnotation?: {
      text: string;
      pages: Array<{
        property?: {
          detectedLanguages: Array<{
            languageCode: string;
            confidence: number;
          }>;
        };
      }>;
    };
    error?: {
      code: number;
      message: string;
      status: string;
    };
  }>;
}

interface OCRResult {
  text: string;
  confidence: number;
  detectedLanguage?: string;
  languageConfidence?: number;
  fullResponse?: any;
}

/**
 * Convert File to base64 string for Vision API
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (data:image/png;base64,)
      const base64String = base64.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Perform OCR using Google Cloud Vision API
 *
 * @param file - Image file containing text to extract
 * @param languageHints - Optional array of language codes (e.g., ['en', 'es'])
 * @returns Extracted text with confidence and detected language
 */
export async function performVisionOCR(
  file: File,
  languageHints?: string[]
): Promise<OCRResult> {
  const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    throw new Error('Google Cloud Vision API key not configured. Please add VITE_GOOGLE_CLOUD_VISION_API_KEY to your .env file.');
  }

  try {
    // Convert image to base64
    const base64Image = await fileToBase64(file);

    // Prepare request body
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION', // Best for documents
              maxResults: 1,
            },
          ],
          imageContext: languageHints
            ? {
                languageHints,
              }
            : undefined,
        },
      ],
    };

    // Call Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Vision API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data: VisionAPIResponse = await response.json();
    const result = data.responses[0];

    // Check for API errors
    if (result.error) {
      throw new Error(`Vision API error: ${result.error.message}`);
    }

    // Extract text and metadata
    const fullText = result.fullTextAnnotation?.text || '';
    const detectedLanguages = result.fullTextAnnotation?.pages[0]?.property?.detectedLanguages || [];

    const primaryLanguage = detectedLanguages[0];

    return {
      text: fullText,
      confidence: primaryLanguage?.confidence ? Math.round(primaryLanguage.confidence * 100) : 95,
      detectedLanguage: primaryLanguage?.languageCode,
      languageConfidence: primaryLanguage?.confidence,
      fullResponse: result,
    };
  } catch (error) {
    console.error('Google Vision OCR error:', error);
    throw error;
  }
}

/**
 * Extract structured data from specific document types (passports, IDs, etc.)
 * Uses Vision API's document understanding capabilities
 */
export async function performDocumentAnalysis(
  file: File,
  documentType?: 'passport' | 'id_card' | 'driver_license'
): Promise<OCRResult & { fields?: Record<string, string> }> {
  const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    throw new Error('Google Cloud Vision API key not configured.');
  }

  try {
    const base64Image = await fileToBase64(file);

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1,
            },
            {
              type: 'LABEL_DETECTION', // Helps identify document type
              maxResults: 5,
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data: VisionAPIResponse = await response.json();
    const result = data.responses[0];

    if (result.error) {
      throw new Error(`Vision API error: ${result.error.message}`);
    }

    const fullText = result.fullTextAnnotation?.text || '';
    const detectedLanguages = result.fullTextAnnotation?.pages[0]?.property?.detectedLanguages || [];
    const primaryLanguage = detectedLanguages[0];

    // TODO: Implement field extraction based on document type
    // This would parse the text to extract specific fields like:
    // - Document number
    // - Expiration date
    // - Name
    // - Date of birth
    // etc.

    return {
      text: fullText,
      confidence: primaryLanguage?.confidence ? Math.round(primaryLanguage.confidence * 100) : 95,
      detectedLanguage: primaryLanguage?.languageCode,
      languageConfidence: primaryLanguage?.confidence,
      fullResponse: result,
      fields: {}, // TODO: Implement field extraction
    };
  } catch (error) {
    console.error('Google Vision document analysis error:', error);
    throw error;
  }
}

/**
 * Detect language of text in an image
 */
export async function detectLanguage(file: File): Promise<{
  languageCode: string;
  confidence: number;
  name?: string;
}> {
  const result = await performVisionOCR(file);

  return {
    languageCode: result.detectedLanguage || 'unknown',
    confidence: result.languageConfidence || 0,
  };
}

/**
 * Check if Vision API is configured and available
 */
export function isVisionAPIConfigured(): boolean {
  return !!import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;
}
