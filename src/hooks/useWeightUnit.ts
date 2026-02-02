import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WeightUnit = 'kg' | 'lbs';

const STORAGE_KEY = '@liftarc_weight_unit';
const KG_TO_LBS = 2.20462;

interface UseWeightUnitReturn {
  unit: WeightUnit;
  setUnit: (unit: WeightUnit) => Promise<void>;
  convert: (valueKg: number) => number;
  toKg: (displayValue: number) => number;
  formatWeight: (valueKg: number) => string;
}

/**
 * Hook for managing weight unit preference (kg/lbs).
 * All values are stored in kg in the DB; this hook handles display conversion.
 */
export const useWeightUnit = (): UseWeightUnitReturn => {
  const [unit, setUnitState] = useState<WeightUnit>('kg');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'kg' || stored === 'lbs') {
          setUnitState(stored);
        }
      } catch {
        // Default to kg on error
      }
    })();
  }, []);

  const setUnit = useCallback(async (newUnit: WeightUnit) => {
    setUnitState(newUnit);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newUnit);
    } catch {
      // Silently fail
    }
  }, []);

  const convert = useCallback(
    (valueKg: number): number => {
      if (unit === 'lbs') {
        return Math.round(valueKg * KG_TO_LBS * 10) / 10;
      }
      return valueKg;
    },
    [unit]
  );

  const toKg = useCallback(
    (displayValue: number): number => {
      if (unit === 'lbs') {
        return Math.round((displayValue / KG_TO_LBS) * 10) / 10;
      }
      return displayValue;
    },
    [unit]
  );

  const formatWeight = useCallback(
    (valueKg: number): string => {
      const converted = convert(valueKg);
      return `${converted} ${unit}`;
    },
    [unit, convert]
  );

  return { unit, setUnit, convert, toKg, formatWeight };
};
