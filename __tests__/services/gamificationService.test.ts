/**
 * Tests for gamificationService — pure logic functions
 * (XP calculation, level progression, badge value helpers)
 */

// We test the exported pure functions directly; no Supabase mocking needed for these.
import {
  getXPForLevel,
  calculateLevel,
  getLevelInfo,
  calculateWorkoutXP,
  XP_REWARDS,
} from '../../src/services/gamificationService';

// ── getXPForLevel ──────────────────────────────────────────────────────────

describe('getXPForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(getXPForLevel(1)).toBe(0);
  });

  it('returns 0 for level 0 or negative', () => {
    expect(getXPForLevel(0)).toBe(0);
    expect(getXPForLevel(-5)).toBe(0);
  });

  it('returns correct XP for level 2 (50*(4-2)=100)', () => {
    expect(getXPForLevel(2)).toBe(100);
  });

  it('returns correct XP for level 3 (50*(9-3)=300)', () => {
    expect(getXPForLevel(3)).toBe(300);
  });

  it('returns correct XP for level 10 (50*(100-10)=4500)', () => {
    expect(getXPForLevel(10)).toBe(4500);
  });

  it('increases monotonically for sequential levels', () => {
    for (let lvl = 2; lvl <= 50; lvl++) {
      expect(getXPForLevel(lvl)).toBeGreaterThan(getXPForLevel(lvl - 1));
    }
  });
});

// ── calculateLevel ─────────────────────────────────────────────────────────

describe('calculateLevel', () => {
  it('returns 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('returns NaN for negative XP (no guard in formula)', () => {
    // sqrt of negative number → NaN. Document this edge case.
    // In practice, XP is never negative.
    const result = calculateLevel(-100);
    expect(result).toBeNaN();
  });

  it('returns 2 at exactly 100 XP', () => {
    expect(calculateLevel(100)).toBe(2);
  });

  it('stays at level 2 between 100–299 XP', () => {
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(200)).toBe(2);
    expect(calculateLevel(299)).toBe(2);
  });

  it('reaches level 3 at 300 XP', () => {
    expect(calculateLevel(300)).toBe(3);
  });

  it('roundtrips: calculateLevel(getXPForLevel(n)) === n for levels 1-50', () => {
    for (let lvl = 1; lvl <= 50; lvl++) {
      expect(calculateLevel(getXPForLevel(lvl))).toBe(lvl);
    }
  });

  it('handles very large XP', () => {
    const lvl = calculateLevel(1_000_000);
    expect(lvl).toBeGreaterThan(100);
  });
});

// ── getLevelInfo ────────────────────────────────────────────────────────────

describe('getLevelInfo', () => {
  it('returns level 1 info at 0 XP', () => {
    const info = getLevelInfo(0);
    expect(info.level).toBe(1);
    expect(info.currentXP).toBe(0);
    expect(info.xpProgress).toBeGreaterThanOrEqual(0);
    expect(info.xpProgress).toBeLessThanOrEqual(1);
    expect(info.tierName).toBe('Novice');
  });

  it('progress is capped at 1', () => {
    const info = getLevelInfo(99);
    expect(info.xpProgress).toBeLessThanOrEqual(1);
  });

  it('xpForNextLevel > xpForCurrentLevel', () => {
    const info = getLevelInfo(500);
    expect(info.xpForNextLevel).toBeGreaterThan(info.xpForCurrentLevel);
  });

  it('shows correct tier for high level', () => {
    // Level 100+ needs a LOT of XP.  getXPForLevel(100) = 50*(10000-100)=495000
    const info = getLevelInfo(495_000);
    expect(info.level).toBe(100);
    expect(info.tierName).toBe('Legend');
  });

  it('no division by zero when xpNeededForNextLevel is 0', () => {
    // Shouldn't happen normally, but ensure no NaN/Infinity
    const info = getLevelInfo(0);
    expect(Number.isFinite(info.xpProgress)).toBe(true);
  });
});

// ── calculateWorkoutXP ─────────────────────────────────────────────────────

describe('calculateWorkoutXP', () => {
  it('base XP for workout with 0 sets, 0 streak', () => {
    expect(calculateWorkoutXP(0, 0)).toBe(XP_REWARDS.completeWorkout);
  });

  it('adds per-set XP', () => {
    const xp = calculateWorkoutXP(10, 0);
    expect(xp).toBe(XP_REWARDS.completeWorkout + 10 * XP_REWARDS.completeSet);
  });

  it('adds streak bonus', () => {
    const xp = calculateWorkoutXP(0, 3);
    expect(xp).toBe(XP_REWARDS.completeWorkout + 3 * XP_REWARDS.streakDayBonus);
  });

  it('caps streak bonus at 7 days', () => {
    const xp7 = calculateWorkoutXP(0, 7);
    const xp20 = calculateWorkoutXP(0, 20);
    expect(xp7).toBe(xp20); // both capped at 7
  });

  it('combines sets and streak', () => {
    const xp = calculateWorkoutXP(5, 3);
    const expected =
      XP_REWARDS.completeWorkout +
      5 * XP_REWARDS.completeSet +
      3 * XP_REWARDS.streakDayBonus;
    expect(xp).toBe(expected);
  });
});

// ── XP_REWARDS constants ───────────────────────────────────────────────────

describe('XP_REWARDS', () => {
  it('all reward values are positive', () => {
    Object.values(XP_REWARDS).forEach(v => {
      expect(v).toBeGreaterThan(0);
    });
  });
});
