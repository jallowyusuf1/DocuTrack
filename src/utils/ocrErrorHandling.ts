/**
 * OCR Error Handling Utilities
 * Centralized error handling with retry logic
 */

export interface OCRError {
  message: string;
  code: 'network' | 'rate_limit' | 'api_error' | 'processing' | 'unknown';
  retryable: boolean;
  retryAfter?: number; // seconds
}

/**
 * Detect error type from response or error object
 */
export function classifyOCRError(error: unknown): OCRError {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
      return {
        message: 'Network error. Please check your internet connection.',
        code: 'network',
        retryable: true,
      };
    }

    // Rate limit errors
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return {
        message: 'Rate limit exceeded. Please try again in a moment.',
        code: 'rate_limit',
        retryable: true,
        retryAfter: 60, // Default 60 seconds
      };
    }

    // API errors
    if (error.message.includes('API') || error.message.includes('key') || error.message.includes('unauthorized')) {
      return {
        message: 'API error. Please check your API key configuration.',
        code: 'api_error',
        retryable: false,
      };
    }

    // Processing errors
    if (error.message.includes('processing') || error.message.includes('timeout')) {
      return {
        message: 'Processing timeout. The image may be too large or complex.',
        code: 'processing',
        retryable: true,
      };
    }
  }

  // Default unknown error
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    code: 'unknown',
    retryable: true,
  };
}

/**
 * Extract retry-after header from response
 */
export function getRetryAfter(response: Response): number | undefined {
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) {
      return seconds;
    }
  }
  return undefined;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorInfo = classifyOCRError(error);

      // Don't retry if error is not retryable
      if (!errorInfo.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = errorInfo.retryAfter
        ? errorInfo.retryAfter * 1000
        : initialDelay * Math.pow(2, attempt);

      console.warn(`OCR retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Handle OCR error and return user-friendly message
 */
export function handleOCRError(error: unknown): string {
  const errorInfo = classifyOCRError(error);
  return errorInfo.message;
}



