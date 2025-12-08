/**
 * Sentry Error Tracking Setup
 * 
 * To use Sentry:
 * 1. Sign up at https://sentry.io
 * 2. Create a project and get your DSN
 * 3. Add VITE_SENTRY_DSN to your .env file
 * 4. Sentry will auto-initialize when DSN is provided
 */

// Lazy import Sentry to avoid React hook issues if not configured
let Sentry: any = null;
let sentryLoaded = false;

async function loadSentry() {
  if (sentryLoaded) return Sentry;
  try {
    Sentry = await import('@sentry/react');
    sentryLoaded = true;
    return Sentry;
  } catch (e) {
    console.warn('Sentry not available');
    return null;
  }
}

// Initialize Sentry (auto-initializes when DSN is available)
export async function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    if (import.meta.env.MODE === 'development') {
      console.warn('Sentry DSN not found. Error tracking disabled. Add VITE_SENTRY_DSN to .env to enable.');
    }
    return;
  }

  try {
    const SentryModule = await loadSentry();
    if (!SentryModule) return;

    SentryModule.init({
      dsn,
      environment: import.meta.env.MODE,
      integrations: [
        SentryModule.browserTracingIntegration(),
        SentryModule.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers.Authorization;
            delete event.request.headers.authorization;
          }
        }
        return event;
      },
    });
    
    if (import.meta.env.MODE === 'development') {
      console.log('✅ Sentry initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

// Export error logging function
export async function logError(error: unknown, context?: string, extra?: Record<string, unknown>) {
  // Log to console in development
  if (import.meta.env.MODE === 'development') {
    console.error(`[${context || 'Error'}]`, error, extra);
  }

  // Send to Sentry if initialized
  try {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (dsn && typeof window !== 'undefined') {
      const SentryModule = await loadSentry();
      if (SentryModule) {
        SentryModule.captureException(error, {
          tags: { context: context || 'unknown' },
          extra,
        });
      }
    }
  } catch (e) {
    // Silently fail if Sentry not available
  }
}

// Export user context setter
export async function setUserContext(userId: string, email?: string) {
  try {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (dsn && typeof window !== 'undefined') {
      const SentryModule = await loadSentry();
      if (SentryModule) {
        SentryModule.setUser({
          id: userId,
          email,
        });
      }
    }
  } catch (e) {
    // Silently fail if Sentry not available
  }
}

// Export clear user context
export async function clearUserContext() {
  try {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (dsn && typeof window !== 'undefined') {
      const SentryModule = await loadSentry();
      if (SentryModule) {
        SentryModule.setUser(null);
      }
    }
  } catch (e) {
    // Silently fail if Sentry not available
  }
}
