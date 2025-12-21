/**
 * Network utilities for detecting connectivity and handling network errors
 */

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return typeof window !== 'undefined' && navigator.onLine;
}

/**
 * Get detailed network status (if available)
 */
export function getNetworkStatus(): NetworkStatus {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  return {
    isOnline: isOnline(),
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  };
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;

  const errorMessage = error?.message?.toLowerCase() || '';
  const errorName = error?.name?.toLowerCase() || '';

  // Common network error patterns
  const networkErrorPatterns = [
    'network',
    'fetch',
    'failed to fetch',
    'networkerror',
    'network request failed',
    'timeout',
    'timed out',
    'connection',
    'not_resolved',
    'firm_name_not_resolved',
    'dns',
    'unreachable',
    'econnrefused',
    'enotfound',
  ];

  return networkErrorPatterns.some(pattern =>
    errorMessage.includes(pattern) || errorName.includes(pattern)
  );
}

/**
 * Sleep utility for retry delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exponential backoff retry with jitter
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: any) => boolean;
    onRetry?: (error: any, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = isNetworkError,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts
      if (attempt === maxRetries) {
        throw error;
      }

      // Don't retry if error shouldn't be retried
      if (!shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * 0.3 * exponentialDelay; // Add up to 30% jitter
      const delay = exponentialDelay + jitter;

      // Notify about retry
      if (onRetry) {
        onRetry(error, attempt + 1);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Check connectivity to Supabase
 */
export async function checkSupabaseConnectivity(supabaseUrl: string): Promise<boolean> {
  try {
    // Try to fetch the Supabase health endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Any response (even 401/404) means we can reach the server
    return true;
  } catch (error) {
    console.warn('Supabase connectivity check failed:', error);
    return false;
  }
}

/**
 * Get user-friendly error message for network errors
 */
export function getNetworkErrorMessage(error: any): string {
  if (!isOnline()) {
    return 'You appear to be offline. Please check your internet connection and try again.';
  }

  const errorMessage = error?.message?.toLowerCase() || '';

  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return 'The request took too long. Please check your internet connection and try again.';
  }

  if (errorMessage.includes('not_resolved') || errorMessage.includes('firm_name_not_resolved')) {
    return 'Unable to reach the server. Please check your DNS settings or try again in a moment.';
  }

  if (errorMessage.includes('failed to fetch') || errorMessage.includes('network')) {
    return 'Network connection failed. Please check your internet and try again.';
  }

  return 'A network error occurred. Please check your connection and try again.';
}

/**
 * Setup network status listeners
 */
export function setupNetworkListeners(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  const handleOnline = () => {
    console.log('Network: Online');
    onOnline?.();
  };

  const handleOffline = () => {
    console.log('Network: Offline');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
