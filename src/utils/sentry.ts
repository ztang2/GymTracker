/**
 * Sentry crash reporting initialization and helpers.
 *
 * Set the SENTRY_DSN environment variable (in .env) to enable reporting.
 * Without a DSN, Sentry initialises in a no-op mode.
 */
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN: string = Constants.expoConfig?.extra?.sentryDsn ?? '';

export function initSentry(): void {
  Sentry.init({
    dsn: DSN,
    // Disable in development to avoid noise
    enabled: !__DEV__ && DSN.length > 0,
    // Capture 20% of transactions for performance monitoring
    tracesSampleRate: 0.2,
    // Attach screenshots on crash (native builds only)
    attachScreenshot: true,
    debug: false,
  });
}

/**
 * Set the authenticated user on the Sentry scope.
 * Call with `null` on logout to clear.
 */
export function setSentryUser(userId: string | null): void {
  if (userId) {
    Sentry.setUser({ id: userId });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Report a non-fatal exception to Sentry with optional extra context.
 */
export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

export { Sentry };
