/**
 * Error handling utilities for graceful degradation
 */

/**
 * Check if error is a "table not found" error
 */
export function isTableNotFound(error: any): boolean {
  if (!error) return false;
  
  const errorCode = error.code || error.error?.code;
  const errorMessage = error.message || error.error?.message || '';
  
  // Supabase/PostgREST error codes
  const notFoundCodes = [
    'PGRST116', // Relation not found
    'PGRST205', // Not found
    '42P01',    // PostgreSQL: relation does not exist
  ];
  
  if (notFoundCodes.includes(errorCode)) return true;
  
  // Check error message
  const notFoundMessages = [
    'not found',
    'Could not find',
    'relation',
    'does not exist',
    'Table',
    'table',
  ];
  
  return notFoundMessages.some(msg => 
    errorMessage.toLowerCase().includes(msg.toLowerCase())
  );
}

/**
 * Check if error is a network/connection error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.error?.message || '';
  const networkErrors = [
    'network',
    'fetch',
    'connection',
    'timeout',
    'ECONNREFUSED',
    'ENOTFOUND',
  ];
  
  return networkErrors.some(msg => 
    errorMessage.toLowerCase().includes(msg.toLowerCase())
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: any): string {
  if (!error) return 'An unexpected error occurred';
  
  if (isTableNotFound(error)) {
    return 'This feature is not available. Please contact support.';
  }
  
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }
  
  const message = error.message || error.error?.message || 'An error occurred';
  
  // Don't expose technical errors to users
  if (message.includes('PGRST') || message.includes('relation')) {
    return 'A database error occurred. Please try again later.';
  }
  
  return message;
}

/**
 * Safe async wrapper that returns default value on error
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  defaultValue: T,
  logError = true
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (logError) {
      console.error('Safe async error:', error);
    }
    return defaultValue;
  }
}

/**
 * Handle service errors gracefully - returns default value or throws user-friendly error
 */
export function handleServiceError<T>(
  error: any,
  defaultValue: T,
  contextMessage?: string
): T {
  if (isTableNotFound(error)) {
    console.warn(contextMessage || 'Table not found, returning default value');
    return defaultValue;
  }
  
  if (isNetworkError(error)) {
    console.warn(contextMessage || 'Network error', error);
    return defaultValue;
  }
  
  // For other errors, log and return default
  console.error(contextMessage || 'Service error', error);
  return defaultValue;
}

