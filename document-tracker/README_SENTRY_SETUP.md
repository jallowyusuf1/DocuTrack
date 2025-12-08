# Sentry Error Tracking Setup

## Quick Start

1. **Sign up for Sentry:**
   - Go to https://sentry.io
   - Create a free account
   - Create a new project (select React)

2. **Get your DSN:**
   - After creating project, copy your DSN
   - It looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

3. **Configure Environment Variable:**
   - Copy `.env.example` to `.env`
   - Add your Sentry DSN:
     ```
     VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
     ```

4. **Enable Sentry:**
   - Open `src/utils/sentry.ts`
   - Uncomment the initialization code
   - Uncomment the `initSentry()` call in `src/main.tsx`

5. **Test:**
   - The app will automatically log errors to Sentry
   - Check your Sentry dashboard for errors

## Features

- **Error Tracking**: Automatically captures JavaScript errors
- **Performance Monitoring**: Tracks page load times
- **Session Replay**: Records user sessions (with privacy settings)
- **User Context**: Associates errors with user IDs
- **Source Maps**: Maps minified code back to source (for production)

## Configuration

The Sentry setup includes:
- **Environment detection**: Automatically detects dev/prod
- **Sample rates**: 10% in production, 100% in development
- **Privacy**: Masks all text and media in replays
- **Filtering**: Removes sensitive data (cookies, auth headers)

## Usage

Errors are automatically logged. You can also manually log:

```typescript
import { logError } from './utils/errorHandler';

try {
  // Your code
} catch (error) {
  logError(error, 'ComponentName', { extra: 'data' });
}
```

## User Context

Set user context when user logs in:

```typescript
import { setUserContext } from './utils/sentry';

setUserContext(userId, userEmail);
```

Clear when user logs out:

```typescript
import { clearUserContext } from './utils/sentry';

clearUserContext();
```

## Production Setup

1. **Build with source maps:**
   ```bash
   npm run build
   ```

2. **Upload source maps to Sentry:**
   - Install Sentry CLI: `npm install -g @sentry/cli`
   - Configure: `sentry-cli login`
   - Upload: `sentry-cli sourcemaps inject ./dist && sentry-cli sourcemaps upload ./dist`

3. **Or use Vite plugin:**
   ```bash
   npm install --save-dev @sentry/vite-plugin
   ```
   Then configure in `vite.config.ts`

## Free Tier Limits

Sentry free tier includes:
- 5,000 errors/month
- 10,000 performance units/month
- 1,000 replay sessions/month

This is usually sufficient for small to medium apps.

