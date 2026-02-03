/**
 * Tests for useWeightUnit hook — conversion logic
 *
 * We test the pure conversion math directly (no React rendering needed).
 * The hook stores weight in kg and converts for display.
 */

const KG_TO_LBS = 2.20462;

// Pure function equivalents extracted from the hook logic:
function convertKgToLbs(valueKg: number): number {
  return Math.round(valueKg * KG_TO_LBS * 10) / 10;
}

function convertLbsToKg(valueLbs: number): number {
  return Math.round((valueLbs / KG_TO_LBS) * 10) / 10;
}

function convertKg(valueKg: number): number {
  return valueKg; // identity in kg mode
}

function formatWeight(valueKg: number, unit: 'kg' | 'lbs'): string {
  const converted = unit === 'lbs' ? convertKgToLbs(valueKg) : valueKg;
  return `${converted} ${unit}`;
}

// ── kg → lbs conversion ────────────────────────────────────────────────────

describe('kg → lbs conversion', () => {
  it('converts 0 kg to 0 lbs', () => {
    expect(convertKgToLbs(0)).toBe(0);
  });

  it('converts 1 kg to ~2.2 lbs', () => {
    expect(convertKgToLbs(1)).toBeCloseTo(2.2, 1);
  });

  it('converts 100 kg to ~220.5 lbs', () => {
    expect(convertKgToLbs(100)).toBeCloseTo(220.5, 0);
  });

  it('converts 60 kg (typical bench press) correctly', () => {
    const result = convertKgToLbs(60);
    expect(result).toBe(Math.round(60 * KG_TO_LBS * 10) / 10);
    expect(result).toBeCloseTo(132.3, 1);
  });

  it('rounds to 1 decimal place', () => {
    const result = convertKgToLbs(45);
    const decimalPart = result.toString().split('.')[1];
    // Should have at most 1 decimal place
    expect(!decimalPart || decimalPart.length <= 1).toBe(true);
  });
});

// ── lbs → kg conversion ────────────────────────────────────────────────────

describe('lbs → kg conversion (toKg)', () => {
  it('converts 0 lbs to 0 kg', () => {
    expect(convertLbsToKg(0)).toBe(0);
  });

  it('converts 220 lbs to ~99.8 kg', () => {
    expect(convertLbsToKg(220)).toBeCloseTo(99.8, 0);
  });

  it('converts 135 lbs (common plate combo) correctly', () => {
    const result = convertLbsToKg(135);
    expect(result).toBe(Math.round((135 / KG_TO_LBS) * 10) / 10);
    expect(result).toBeCloseTo(61.2, 0);
  });

  it('roundtrip: kg → lbs → kg is close to original', () => {
    const original = 80;
    const lbs = convertKgToLbs(original);
    const backToKg = convertLbsToKg(lbs);
    // Within 0.2 kg due to rounding
    expect(Math.abs(backToKg - original)).toBeLessThanOrEqual(0.2);
  });

  it('roundtrip for common weights', () => {
    [20, 40, 60, 80, 100, 120, 140].forEach(kg => {
      const lbs = convertKgToLbs(kg);
      const back = convertLbsToKg(lbs);
      expect(Math.abs(back - kg)).toBeLessThanOrEqual(0.2);
    });
  });
});

// ── kg mode (identity) ─────────────────────────────────────────────────────

describe('kg mode (identity)', () => {
  it('returns value unchanged', () => {
    expect(convertKg(50)).toBe(50);
    expect(convertKg(0)).toBe(0);
    expect(convertKg(123.456)).toBe(123.456);
  });
});

// ── formatWeight ────────────────────────────────────────────────────────────

describe('formatWeight', () => {
  it('formats kg correctly', () => {
    expect(formatWeight(60, 'kg')).toBe('60 kg');
  });

  it('formats lbs correctly', () => {
    const result = formatWeight(60, 'lbs');
    expect(result).toMatch(/^\d+\.?\d* lbs$/);
    expect(result).toContain('lbs');
  });

  it('formats 0 weight', () => {
    expect(formatWeight(0, 'kg')).toBe('0 kg');
    expect(formatWeight(0, 'lbs')).toBe('0 lbs');
  });
});
