/**
 * Centralized error handling utilities for service layer
 */
import { captureException } from './sentry';

// ============================================================================
// ERROR CODES
// ============================================================================

export type ErrorCode =
  | 'NETWORK'
  | 'AUTH'
  | 'NOT_FOUND'
  | 'PERMISSION'
  | 'VALIDATION'
  | 'UNKNOWN';

// ============================================================================
// APP ERROR CLASS
// ============================================================================

/**
 * Typed application error with structured metadata
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly context: string;
  readonly isUserFacing: boolean;

  constructor(
    message: string,
    code: ErrorCode,
    context: string,
    isUserFacing: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.isUserFacing = isUserFacing;
  }
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

/**
 * Classify a raw error into an ErrorCode based on known patterns
 */
function classifyError(error: unknown): ErrorCode {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;

    // Supabase not-found
    if (err.code === 'PGRST116') return 'NOT_FOUND';

    // Auth-related
    if (
      err.code === 'PGRST301' ||
      err.code === '42501' ||
      (typeof err.message === 'string' && /auth|token|jwt/i.test(err.message))
    ) {
      return 'AUTH';
    }

    // Permission
    if (
      err.code === '42501' ||
      (typeof err.message === 'string' && /permission|forbidden/i.test(err.message))
    ) {
      return 'PERMISSION';
    }

    // Network
    if (
      typeof err.message === 'string' &&
      /network|fetch|timeout|ECONNREFUSED/i.test(err.message)
    ) {
      return 'NETWORK';
    }

    // Validation
    if (
      err.code === '23505' || // unique violation
      err.code === '23503' || // FK violation
      err.code === '23502' || // not-null violation
      (typeof err.message === 'string' && /validation|invalid|constraint/i.test(err.message))
    ) {
      return 'VALIDATION';
    }
  }

  return 'UNKNOWN';
}

/**
 * Handle a service-layer error: log consistently and return a typed AppError
 *
 * @param error - The raw error caught in the service
 * @param context - Human-readable context, e.g. "getUserProfile"
 * @returns AppError with classified code
 */
export function handleServiceError(error: unknown, context: string): AppError {
  const code = classifyError(error);
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : String(error);

  const appError = new AppError(rawMessage, code, context);

  // Consistent logging format
  console.error(`[${context}] ${code}: ${rawMessage}`);

  // Report non-user-facing errors to Sentry for observability
  if (!appError.isUserFacing) {
    captureException(error instanceof Error ? error : appError, {
      errorCode: code,
      context,
    });
  }

  return appError;
}

// ============================================================================
// USER MESSAGE HELPER
// ============================================================================

const USER_MESSAGES: Record<ErrorCode, string> = {
  NETWORK: 'Unable to connect. Please check your internet connection and try again.',
  AUTH: 'Your session has expired. Please sign in again.',
  NOT_FOUND: 'The requested item could not be found.',
  PERMISSION: 'You don\'t have permission to perform this action.',
  VALIDATION: 'The provided data is invalid. Please check your input.',
  UNKNOWN: 'Something went wrong. Please try again later.',
};

/**
 * Get a user-friendly message from an error.
 * If the error is an AppError with isUserFacing=true, returns its message directly.
 * Otherwise returns a generic message based on the error code.
 */
export function getUserMessage(error: unknown): string {
  if (error instanceof AppError) {
    if (error.isUserFacing) return error.message;
    return USER_MESSAGES[error.code];
  }
  return USER_MESSAGES.UNKNOWN;
}
