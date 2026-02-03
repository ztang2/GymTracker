/**
 * Lightweight analytics tracker.
 *
 * Events are buffered in memory and periodically flushed to AsyncStorage.
 * This gives us a pluggable foundation — swap the `flush` implementation
 * for Mixpanel / Amplitude / PostHog when ready.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Types
// ============================================================================

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

// Well-known event names (extend as needed)
export type KnownEvent =
  | 'workout_completed'
  | 'exercise_added'
  | 'achievement_unlocked'
  | 'template_created'
  | 'screen_view'
  | string;

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = '@liftarc_analytics_events';
const FLUSH_INTERVAL_MS = 60_000; // 1 minute
const MAX_BUFFER_SIZE = 200; // flush early if buffer grows large

// ============================================================================
// Internal state
// ============================================================================

let buffer: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

// ============================================================================
// Public API
// ============================================================================

/**
 * Track a named event with optional properties.
 */
export function trackEvent(name: KnownEvent, properties?: Record<string, unknown>): void {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: Date.now(),
  };

  buffer.push(event);

  if (__DEV__) {
    console.log('[Analytics]', name, properties ?? '');
  }

  // Auto-flush when buffer gets large
  if (buffer.length >= MAX_BUFFER_SIZE) {
    flushEvents();
  }
}

/**
 * Convenience wrapper for screen view tracking.
 */
export function trackScreen(screenName: string): void {
  trackEvent('screen_view', { screen: screenName });
}

/**
 * Start the periodic flush timer. Call once at app startup.
 */
export function startAnalytics(): void {
  if (flushTimer) return;
  flushTimer = setInterval(flushEvents, FLUSH_INTERVAL_MS);
}

/**
 * Stop the flush timer and persist any remaining events.
 */
export async function stopAnalytics(): Promise<void> {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  await flushEvents();
}

/**
 * Flush the in-memory buffer to AsyncStorage.
 * In a future iteration this would POST to an analytics backend.
 */
export async function flushEvents(): Promise<void> {
  if (buffer.length === 0) return;

  const toFlush = [...buffer];
  buffer = [];

  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const stored: AnalyticsEvent[] = existing ? JSON.parse(existing) : [];

    // Keep a rolling window of the most recent 1 000 events on disk
    const merged = [...stored, ...toFlush].slice(-1000);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (err) {
    // Re-add events that failed to persist so they aren't lost
    buffer = [...toFlush, ...buffer];
    if (__DEV__) {
      console.warn('[Analytics] flush failed', err);
    }
  }
}

/**
 * Read all stored events (useful for debugging / export).
 */
export async function getStoredEvents(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all stored events.
 */
export async function clearStoredEvents(): Promise<void> {
  buffer = [];
  await AsyncStorage.removeItem(STORAGE_KEY);
}
