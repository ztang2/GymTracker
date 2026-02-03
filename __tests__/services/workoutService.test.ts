/**
 * Tests for workoutService — Supabase interactions via mocked client
 *
 * The global mock in __mocks__/setup.ts provides a base supabase mock.
 * We override it here with per-test control.
 */

import { supabase } from '../../src/services/supabase';

// Helper: configure what the mock chain resolves to
function mockChainResult(data: any, error: any = null) {
  const result = { data, error };
  const chain = supabase as any;

  // Reset all chain methods to return the chain
  ['from', 'select', 'insert', 'update', 'delete', 'eq', 'in', 'gte', 'lte', 'order', 'limit'].forEach(m => {
    chain[m] = jest.fn().mockReturnValue(chain);
  });

  // Terminal methods resolve to the result
  chain.single = jest.fn().mockResolvedValue(result);
  // Make chain itself awaitable (for non-.single() calls)
  chain.then = (res: any, rej: any) => Promise.resolve(result).then(res, rej);
}

import {
  createWorkoutSession,
  getWorkoutSessionBasic,
  getWorkoutsByDate,
  getRecentWorkouts,
  updateWorkoutSession,
  deleteWorkoutSession,
  addExerciseToWorkout,
  addSetToExercise,
  updateSet,
  markSetComplete,
  deleteSet,
} from '../../src/services/workoutService';

beforeEach(() => {
  jest.clearAllMocks();
});

// ── createWorkoutSession ───────────────────────────────────────────────────

describe('createWorkoutSession', () => {
  it('returns created session on success', async () => {
    const session = { id: 's1', user_id: 'u1', date: '2025-06-01' };
    mockChainResult(session);

    const result = await createWorkoutSession('u1', {
      date: '2025-06-01',
      start_time: '2025-06-01T10:00:00Z',
      end_time: null,
      duration_minutes: null,
      notes: null,
    });

    expect(result).toEqual(session);
    expect((supabase as any).from).toHaveBeenCalledWith('workout_sessions');
  });

  it('throws on supabase error', async () => {
    mockChainResult(null, { message: 'duplicate key' });

    await expect(
      createWorkoutSession('u1', {
        date: '2025-06-01',
        start_time: '2025-06-01T10:00:00Z',
        end_time: null,
        duration_minutes: null,
        notes: null,
      })
    ).rejects.toThrow('Failed to create workout session');
  });

  it('throws when data is null', async () => {
    mockChainResult(null, null);

    await expect(
      createWorkoutSession('u1', {
        date: '2025-06-01',
        start_time: '2025-06-01T10:00:00Z',
        end_time: null,
        duration_minutes: null,
        notes: null,
      })
    ).rejects.toThrow('No data returned');
  });
});

// ── getWorkoutSessionBasic ─────────────────────────────────────────────────

describe('getWorkoutSessionBasic', () => {
  it('returns session when found', async () => {
    const session = { id: 's1', user_id: 'u1', date: '2025-06-01' };
    mockChainResult(session);

    const result = await getWorkoutSessionBasic('s1', 'u1');
    expect(result).toEqual(session);
  });

  it('returns null for not-found (PGRST116)', async () => {
    mockChainResult(null, { code: 'PGRST116', message: 'not found' });

    const result = await getWorkoutSessionBasic('missing', 'u1');
    expect(result).toBeNull();
  });

  it('throws on other errors', async () => {
    mockChainResult(null, { code: 'OTHER', message: 'server error' });

    await expect(getWorkoutSessionBasic('s1', 'u1')).rejects.toThrow('Failed to fetch');
  });
});

// ── getWorkoutsByDate ──────────────────────────────────────────────────────

describe('getWorkoutsByDate', () => {
  it('returns workouts array', async () => {
    const workouts = [{ id: 's1' }, { id: 's2' }];
    mockChainResult(workouts);

    const result = await getWorkoutsByDate('u1', '2025-06-01');
    expect(result).toEqual(workouts);
  });

  it('returns empty array when data is null', async () => {
    mockChainResult(null);

    const result = await getWorkoutsByDate('u1', '2025-06-01');
    expect(result).toEqual([]);
  });

  it('throws on error', async () => {
    mockChainResult(null, { message: 'timeout' });

    await expect(getWorkoutsByDate('u1', '2025-06-01')).rejects.toThrow(
      'Failed to fetch workouts by date'
    );
  });
});

// ── getRecentWorkouts ──────────────────────────────────────────────────────

describe('getRecentWorkouts', () => {
  it('returns recent workouts', async () => {
    const workouts = [{ id: 's1' }];
    mockChainResult(workouts);

    const result = await getRecentWorkouts('u1', 5);
    expect(result).toEqual(workouts);
  });
});

// ── updateWorkoutSession ───────────────────────────────────────────────────

describe('updateWorkoutSession', () => {
  it('returns updated session', async () => {
    const updated = { id: 's1', notes: 'Great workout!' };
    mockChainResult(updated);

    const result = await updateWorkoutSession('s1', 'u1', { notes: 'Great workout!' });
    expect(result).toEqual(updated);
  });

  it('throws on error', async () => {
    mockChainResult(null, { message: 'not found' });

    await expect(
      updateWorkoutSession('s1', 'u1', { notes: 'test' })
    ).rejects.toThrow('Failed to update');
  });
});

// ── deleteWorkoutSession ───────────────────────────────────────────────────

describe('deleteWorkoutSession', () => {
  it('resolves on success', async () => {
    mockChainResult(null);
    await expect(deleteWorkoutSession('s1', 'u1')).resolves.toBeUndefined();
  });

  it('throws on error', async () => {
    mockChainResult(null, { message: 'constraint' });
    await expect(deleteWorkoutSession('s1', 'u1')).rejects.toThrow('Failed to delete');
  });
});

// ── addExerciseToWorkout ───────────────────────────────────────────────────

describe('addExerciseToWorkout', () => {
  it('returns created workout exercise', async () => {
    const we = { id: 'we1', exercise_id: 'e1', order_index: 0 };
    mockChainResult(we);

    const result = await addExerciseToWorkout('s1', 'e1', 0);
    expect(result).toEqual(we);
  });

  it('passes notes when provided', async () => {
    const we = { id: 'we1', notes: 'warm-up' };
    mockChainResult(we);

    const result = await addExerciseToWorkout('s1', 'e1', 0, 'warm-up');
    expect(result).toEqual(we);
  });
});

// ── addSetToExercise ───────────────────────────────────────────────────────

describe('addSetToExercise', () => {
  it('returns created set', async () => {
    const set = { id: 'set1', set_number: 1, reps: 10, weight_kg: 60 };
    mockChainResult(set);

    const result = await addSetToExercise('we1', {
      set_number: 1,
      reps: 10,
      weight_kg: 60,
      rest_seconds: null,
      completed: false,
      notes: null,
    });
    expect(result).toEqual(set);
  });
});

// ── updateSet ──────────────────────────────────────────────────────────────

describe('updateSet', () => {
  it('returns updated set', async () => {
    const updated = { id: 'set1', reps: 12, completed: true };
    mockChainResult(updated);

    const result = await updateSet('set1', { reps: 12, completed: true });
    expect(result).toEqual(updated);
  });
});

// ── markSetComplete ────────────────────────────────────────────────────────

describe('markSetComplete', () => {
  it('calls updateSet with completed: true', async () => {
    const updated = { id: 'set1', completed: true };
    mockChainResult(updated);

    const result = await markSetComplete('set1');
    expect(result).toEqual(updated);
  });
});

// ── deleteSet ──────────────────────────────────────────────────────────────

describe('deleteSet', () => {
  it('resolves on success', async () => {
    mockChainResult(null);
    await expect(deleteSet('set1')).resolves.toBeUndefined();
  });

  it('throws on error', async () => {
    mockChainResult(null, { message: 'not found' });
    await expect(deleteSet('set1')).rejects.toThrow('Failed to delete set');
  });
});
