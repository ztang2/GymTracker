import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../contexts';
import { Ionicons } from '@expo/vector-icons';
import { colorGlow } from '../../utils';
import type { ThemeColors } from '../../constants/theme';
import { createExerciseCardStyles } from './styles';

interface SetRowProps {
  set: { id: string; weight: number; reps: number; completed: boolean };
  index: number;
  unit: string;
  convert: (kg: number) => number;
  toKg: (display: number) => number;
  canRemove: boolean;
  onUpdateSet: (setId: string, field: 'weight' | 'reps', value: string) => void;
  onToggleComplete: (setId: string) => void;
  onRemoveSet: (setId: string) => void;
}

/**
 * WeightInput: Uses local state to avoid round-trip conversion issues.
 * User types in display unit freely. Conversion to kg happens only on blur.
 */
const WeightInput: React.FC<{
  set: { id: string; weight: number; completed: boolean };
  index: number;
  unit: string;
  convert: (kg: number) => number;
  toKg: (display: number) => number;
  onUpdateSet: (setId: string, field: 'weight' | 'reps', value: string) => void;
  colors: ThemeColors;
  styles: ReturnType<typeof createExerciseCardStyles>;
}> = ({ set, index, unit, convert, toKg, onUpdateSet, colors, styles }) => {
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const lastSyncedWeight = useRef(set.weight);

  useEffect(() => {
    if (!isFocused && set.weight !== lastSyncedWeight.current) {
      lastSyncedWeight.current = set.weight;
      if (set.weight > 0) {
        const displayed = convert(set.weight);
        setLocalValue(displayed % 1 === 0 ? displayed.toString() : displayed.toFixed(1));
      } else {
        setLocalValue('');
      }
    }
  }, [set.weight, isFocused, convert]);

  useEffect(() => {
    if (set.weight > 0 && localValue === '') {
      const displayed = convert(set.weight);
      setLocalValue(displayed % 1 === 0 ? displayed.toString() : displayed.toFixed(1));
      lastSyncedWeight.current = set.weight;
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={[styles.setInput, set.completed && styles.setInputCompleted]}
        value={localValue}
        onChangeText={(value) => {
          const cleaned = value.replace(/[^0-9.]/g, '');
          setLocalValue(cleaned);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          const displayVal = parseFloat(localValue) || 0;
          const kgVal = toKg(displayVal);
          const roundedKg = Math.round(kgVal * 10) / 10;
          lastSyncedWeight.current = roundedKg;
          onUpdateSet(set.id, 'weight', roundedKg > 0 ? roundedKg.toString() : '0');
          if (displayVal > 0) {
            setLocalValue(displayVal % 1 === 0 ? displayVal.toString() : displayVal.toFixed(1));
          } else {
            setLocalValue('');
          }
        }}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={colors.textMuted}
        editable={!set.completed}
        selectTextOnFocus
        accessibilityLabel={`Set ${index + 1} weight in ${unit}`}
        accessibilityHint={`Enter the weight for this set in ${unit}`}
      />
    </View>
  );
};

const SetRowInner: React.FC<SetRowProps> = ({
  set,
  index,
  unit,
  convert,
  toKg,
  canRemove,
  onUpdateSet,
  onToggleComplete,
  onRemoveSet,
}) => {
  const { colors } = useTheme();
  const styles = createExerciseCardStyles(colors);

  return (
    <View style={styles.setRow}>
      <Text style={[styles.setNumber, { flex: 0.5 }]}>{index + 1}</Text>
      <WeightInput
        set={set}
        index={index}
        unit={unit}
        convert={convert}
        toKg={toKg}
        onUpdateSet={onUpdateSet}
        colors={colors}
        styles={styles}
      />
      <View style={{ flex: 1 }}>
        <TextInput
          style={[styles.setInput, set.completed && styles.setInputCompleted]}
          value={set.reps > 0 ? set.reps.toString() : ''}
          onChangeText={(value) => onUpdateSet(set.id, 'reps', value)}
          keyboardType="numeric"
          placeholder="—"
          placeholderTextColor={colors.textMuted}
          editable={!set.completed}
          selectTextOnFocus
          accessibilityLabel={`Set ${index + 1} repetitions`}
          accessibilityHint="Enter the number of reps for this set"
        />
      </View>
      <View style={styles.setActions}>
        <TouchableOpacity
          style={[styles.checkbox, set.completed && styles.checkboxChecked]}
          onPress={() => onToggleComplete(set.id)}
          accessibilityRole="checkbox"
          accessibilityLabel={`Mark set ${index + 1} as ${set.completed ? 'incomplete' : 'complete'}`}
          accessibilityState={{ checked: set.completed }}
        >
          {set.completed && (
            <Ionicons name="checkmark" size={16} color={colors.textPrimary} />
          )}
        </TouchableOpacity>
        {canRemove && (
          <TouchableOpacity
            onPress={() => onRemoveSet(set.id)}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            accessibilityRole="button"
            accessibilityLabel={`Remove set ${index + 1}`}
          >
            <Ionicons name="close" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const SetRow = React.memo(SetRowInner);
