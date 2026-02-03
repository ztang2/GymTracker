/**
 * Tests for exerciseStatsService — pure logic functions
 */

import {
  formatSetsForDisplay,
  calculateFrequencyPerWeek,
} from '../../src/services/exerciseStatsService';

// ── formatSetsForDisplay ───────────────────────────────────────────────────

describe('formatSetsForDisplay', () => {
  it('returns "No completed sets" when all sets are incomplete', () => {
    const sets = [
      { setNumber: 1, weight: 60, reps: 10, completed: false },
      { setNumber: 2, weight: 60, reps: 10, completed: false },
    ];
    expect(formatSetsForDisplay(sets)).toBe('No completed sets');
  });

  it('returns "No completed sets" for empty array', () => {
    expect(formatSetsForDisplay([])).toBe('No completed sets');
  });

  it('groups identical sets correctly', () => {
    const sets = [
      { setNumber: 1, weight: 60, reps: 10, completed: true },
      { setNumber: 2, weight: 60, reps: 10, completed: true },
      { setNumber: 3, weight: 60, reps: 10, completed: true },
    ];
    expect(formatSetsForDisplay(sets)).toBe('3 × 10 @ 60kg');
  });

  it('handles multiple weight/rep combos', () => {
    const sets = [
      { setNumber: 1, weight: 60, reps: 10, completed: true },
      { setNumber: 2, weight: 60, reps: 10, completed: true },
      { setNumber: 3, weight: 65, reps: 8, completed: true },
    ];
    const result = formatSetsForDisplay(sets);
    expect(result).toContain('2 × 10 @ 60kg');
    expect(result).toContain('1 × 8 @ 65kg');
  });

  it('only counts completed sets', () => {
    const sets = [
      { setNumber: 1, weight: 60, reps: 10, completed: true },
      { setNumber: 2, weight: 60, reps: 10, completed: false },
    ];
    expect(formatSetsForDisplay(sets)).toBe('1 × 10 @ 60kg');
  });

  it('handles zero-weight bodyweight exercises', () => {
    const sets = [
      { setNumber: 1, weight: 0, reps: 20, completed: true },
      { setNumber: 2, weight: 0, reps: 20, completed: true },
    ];
    expect(formatSetsForDisplay(sets)).toBe('2 × 20 @ 0kg');
  });
});

// ── calculateFrequencyPerWeek ──────────────────────────────────────────────

describe('calculateFrequencyPerWeek', () => {
  it('returns 0 for 0 performances', () => {
    expect(calculateFrequencyPerWeek(0, '2025-01-01', '2025-01-31')).toBe(0);
  });

  it('returns timesPerformed when range is ≤1 day (Math.max(1, ...) guard)', () => {
    // Same day → daysDiff rounds to 0, but Math.max(1, 0/7) = 1 week
    const freq = calculateFrequencyPerWeek(3, '2025-06-01', '2025-06-01');
    expect(freq).toBe(3); // 3 / max(1, 0/7) = 3/1 = 3
  });

  it('calculates correctly for exactly 7 days (1 week)', () => {
    const freq = calculateFrequencyPerWeek(2, '2025-01-01', '2025-01-08');
    expect(freq).toBe(2); // 2 / max(1, 7/7) = 2/1 = 2
  });

  it('calculates correctly for 14 days (2 weeks)', () => {
    const freq = calculateFrequencyPerWeek(4, '2025-01-01', '2025-01-15');
    expect(freq).toBe(2); // 4 / max(1, 14/7) = 4/2 = 2
  });

  it('handles partial weeks', () => {
    // 10 days → 10/7 ≈ 1.43 weeks → 5/1.43 ≈ 3.5
    const freq = calculateFrequencyPerWeek(5, '2025-01-01', '2025-01-11');
    expect(freq).toBeCloseTo(5 / (10 / 7), 5);
  });

  it('handles large date ranges', () => {
    // ~365 days → 52.14 weeks → 52/52.14 ≈ 1
    const freq = calculateFrequencyPerWeek(52, '2024-01-01', '2024-12-31');
    expect(freq).toBeCloseTo(1, 0);
  });

  it('division by zero guard: single day produces finite result', () => {
    const freq = calculateFrequencyPerWeek(1, '2025-03-15', '2025-03-15');
    expect(Number.isFinite(freq)).toBe(true);
    expect(freq).toBeGreaterThan(0);
  });
});
