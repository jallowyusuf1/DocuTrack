/**
 * User-friendly error messages
 * Never show technical errors to users
 */
export const errorMessages = {
  network: {
    title: 'Connection Lost',
    message: 'Check your internet connection and try again.',
    action: 'Retry',
  },
  auth: {
    title: 'Session Expired',
    message: 'Please log in again to continue.',
    action: 'Log In',
  },
  permission: {
    title: 'Permission Denied',
    message: 'Camera access is required. Please enable it in your device settings.',
    action: 'Open Settings',
  },
  storage: {
    title: 'Storage Full',
    message: 'Free up space or delete old documents to continue.',
    action: 'Manage Storage',
  },
  upload: {
    title: 'Upload Failed',
    message: 'File may be too large or in an unsupported format. Try a smaller image.',
    action: 'Try Again',
  },
  notFound: {
    title: 'Not Found',
    message: 'This document may have been deleted or moved.',
    action: 'Go Back',
  },
  generic: {
    title: 'Something Went Wrong',
    message: 'Please try again. If the problem persists, contact support.',
    action: 'Try Again',
  },
} as const;

export type ErrorType = keyof typeof errorMessages;

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: unknown): typeof errorMessages.generic {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return errorMessages.network;
    }
    if (message.includes('auth') || message.includes('session') || message.includes('token')) {
      return errorMessages.auth;
    }
    if (message.includes('permission') || message.includes('camera') || message.includes('access')) {
      return errorMessages.permission;
    }
    if (message.includes('storage') || message.includes('quota') || message.includes('space')) {
      return errorMessages.storage;
    }
    if (message.includes('upload') || message.includes('file')) {
      return errorMessages.upload;
    }
    if (message.includes('not found') || message.includes('404')) {
      return errorMessages.notFound;
    }
  }
  
  return errorMessages.generic;
}

/**
 * Log error for debugging (never shown to user)
 */
export function logError(error: unknown, context?: string) {
  // Log to console in development
  if (import.meta.env.MODE === 'development') {
    console.error(`[${context || 'Error'}]`, error);
  }

  // Import and use Sentry logging (async, non-blocking)
  import('./sentry').then(({ logError: sentryLogError }) => {
    sentryLogError(error, context).catch(() => {
      // Silently fail if Sentry not available
    });
  }).catch(() => {
    // Silently fail if Sentry module not available
  });
}
