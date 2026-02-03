import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { TABLES, type TableName } from '../constants/tables';

// ============================================================================
// TYPES
// ============================================================================

export type QueueAction = 'insert' | 'update' | 'delete';

export interface QueuedOperation {
  id: string;
  action: QueueAction;
  table: TableName;
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  failed?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = '@liftarc_offline_queue';
const MAX_RETRIES = 3;

// ============================================================================
// HELPERS
// ============================================================================

function generateId(): string {
  return `oq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function loadQueue(): Promise<QueuedOperation[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: QueuedOperation[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Add an operation to the offline queue.
 */
export async function enqueueOperation(
  action: QueueAction,
  table: TableName,
  payload: Record<string, unknown>,
): Promise<QueuedOperation> {
  const operation: QueuedOperation = {
    id: generateId(),
    action,
    table,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  const queue = await loadQueue();
  queue.push(operation);
  await saveQueue(queue);

  return operation;
}

/**
 * Return the number of pending (non-failed) operations.
 */
export async function getQueueSize(): Promise<number> {
  const queue = await loadQueue();
  return queue.filter((op) => !op.failed).length;
}

/**
 * Return all queued operations (including failed).
 */
export async function getQueue(): Promise<QueuedOperation[]> {
  return loadQueue();
}

/**
 * Process all pending operations in FIFO order.
 * Successfully processed operations are removed from the queue.
 * Failed operations are retried up to MAX_RETRIES then marked as failed.
 *
 * @returns Number of successfully processed operations
 */
export async function processQueue(): Promise<number> {
  const queue = await loadQueue();
  if (queue.length === 0) return 0;

  let processed = 0;
  const remaining: QueuedOperation[] = [];

  for (const op of queue) {
    // Skip already-failed operations
    if (op.failed) {
      remaining.push(op);
      continue;
    }

    try {
      await executeOperation(op);
      processed++;
      // Don't push to remaining — it's done
    } catch {
      op.retryCount++;
      if (op.retryCount >= MAX_RETRIES) {
        op.failed = true;
        console.warn(`[OfflineQueue] Operation ${op.id} permanently failed after ${MAX_RETRIES} retries`);
      }
      remaining.push(op);
    }
  }

  await saveQueue(remaining);
  return processed;
}

/**
 * Clear all failed operations from the queue.
 */
export async function clearFailed(): Promise<void> {
  const queue = await loadQueue();
  await saveQueue(queue.filter((op) => !op.failed));
}

/**
 * Clear the entire queue. Use with caution.
 */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

// ============================================================================
// EXECUTION
// ============================================================================

/**
 * Replay a full workout insert (session + exercises + sets) that was queued
 * while offline. Mirrors the logic in workoutLogger.saveWorkout.
 */
async function executeCompositeWorkoutInsert(
  payload: Record<string, unknown>,
): Promise<void> {
  const { _exercises, ...sessionFields } = payload as {
    _exercises: Array<{
      exercise_id: string;
      order_index: number;
      notes: string | null;
      _sets: Array<Record<string, unknown>>;
    }>;
    [key: string]: unknown;
  };

  // 1. Insert session
  const { data: sessionData, error: sessionError } = await supabase
    .from(TABLES.WORKOUT_SESSIONS)
    .insert(sessionFields)
    .select()
    .single();

  if (sessionError) throw sessionError;
  const sessionId = sessionData.id as string;

  // 2. Insert exercises
  const exerciseInserts = _exercises.map((ex) => ({
    workout_session_id: sessionId,
    exercise_id: ex.exercise_id,
    order_index: ex.order_index,
    notes: ex.notes,
  }));

  const { data: exerciseData, error: exerciseError } = await supabase
    .from(TABLES.WORKOUT_EXERCISES)
    .insert(exerciseInserts)
    .select();

  if (exerciseError) {
    await supabase.from(TABLES.WORKOUT_SESSIONS).delete().eq('id', sessionId);
    throw exerciseError;
  }

  // 3. Insert sets
  const setInserts: Array<Record<string, unknown>> = [];
  _exercises.forEach((ex, idx) => {
    const workoutExerciseId = (exerciseData as Array<{ id: string }>)[idx].id;
    ex._sets.forEach((set) => {
      setInserts.push({
        workout_exercise_id: workoutExerciseId,
        ...set,
      });
    });
  });

  if (setInserts.length > 0) {
    const { error: setsError } = await supabase
      .from(TABLES.EXERCISE_SETS)
      .insert(setInserts);

    if (setsError) {
      await supabase.from(TABLES.WORKOUT_EXERCISES).delete().eq('workout_session_id', sessionId);
      await supabase.from(TABLES.WORKOUT_SESSIONS).delete().eq('id', sessionId);
      throw setsError;
    }
  }
}

async function executeOperation(op: QueuedOperation): Promise<void> {
  const { action, table, payload } = op;

  switch (action) {
    case 'insert': {
      // Handle composite workout payloads with nested _exercises/_sets
      if (table === 'workout_sessions' && '_exercises' in payload) {
        await executeCompositeWorkoutInsert(payload);
        break;
      }
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
      break;
    }
    case 'update': {
      const { id, ...rest } = payload as { id: string; [key: string]: unknown };
      if (!id) throw new Error('Update operation requires an id in payload');
      const { error } = await supabase.from(table).update(rest).eq('id', id);
      if (error) throw error;
      break;
    }
    case 'delete': {
      const deleteId = payload.id as string | undefined;
      if (!deleteId) throw new Error('Delete operation requires an id in payload');
      const { error } = await supabase.from(table).delete().eq('id', deleteId);
      if (error) throw error;
      break;
    }
    default:
      throw new Error(`Unknown queue action: ${action}`);
  }
}
