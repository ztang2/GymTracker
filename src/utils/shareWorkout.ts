import { Share, Platform } from 'react-native';
import type {
  WorkoutSummary,
  WorkoutSessionWithExercises,
  PRDetectionResult,
} from '../services/types';

// Format duration from seconds to human-readable
const formatDurationForShare = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} min`;
};

// Format duration from minutes
const formatMinutesForShare = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} min`;
};

// Format volume
const formatVolumeForShare = (kg: number): string => {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}K kg`;
  }
  return `${Math.round(kg).toLocaleString()} kg`;
};

// Format date nicely
const formatDateForShare = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format PR text
const formatPR = (pr: PRDetectionResult): string => {
  const value =
    pr.recordType === 'max_weight'
      ? `${pr.newValue} kg`
      : pr.recordType === 'max_reps'
      ? `${pr.newValue} reps`
      : `${pr.newValue.toFixed(1)} kg (1RM)`;
  return `🏆 New PR: ${pr.exerciseName} — ${value}`;
};

/**
 * Build share text from a WorkoutSummary (shown after completing a workout).
 * This uses summary stats since we don't have full exercise details here.
 */
export function buildShareTextFromSummary(summary: WorkoutSummary): string {
  const lines: string[] = [];

  lines.push('🏋️ LiftArc Workout Complete!');
  lines.push('');
  lines.push(
    `📅 ${formatDateForShare(new Date().toISOString())} | ⏱ ${formatDurationForShare(summary.duration)}`
  );
  lines.push('');
  lines.push(`💪 ${summary.exerciseCount} exercises | ${summary.setCount} sets | ${summary.totalReps} reps`);
  lines.push(`📊 Total Volume: ${formatVolumeForShare(summary.totalVolume)}`);

  if (summary.xpEarned > 0) {
    lines.push(`⭐ +${summary.xpEarned} XP earned`);
  }

  if (summary.newPRs.length > 0) {
    lines.push('');
    for (const pr of summary.newPRs) {
      lines.push(formatPR(pr));
    }
  }

  lines.push('');
  lines.push('#LiftArc #Workout #Fitness');

  return lines.join('\n');
}

/**
 * Build share text from a full WorkoutSessionWithExercises (for sharing past workouts).
 */
export function buildShareTextFromWorkout(workout: WorkoutSessionWithExercises): string {
  const lines: string[] = [];

  lines.push('🏋️ LiftArc Workout Complete!');
  lines.push('');

  const durationStr = workout.duration_minutes
    ? ` | ⏱ ${formatMinutesForShare(workout.duration_minutes)}`
    : '';
  lines.push(`📅 ${formatDateForShare(workout.date)}${durationStr}`);
  lines.push('');

  // Exercise details
  let totalVolume = 0;
  let totalSets = 0;

  for (const exercise of workout.exercises) {
    const completedSets = exercise.sets.filter((s) => s.completed);
    if (completedSets.length === 0) continue;

    totalSets += completedSets.length;

    // Group sets by weight×reps for compact display
    const setGroups: { weight: number; reps: number; count: number }[] = [];
    for (const set of completedSets) {
      const weight = set.weight_kg || 0;
      totalVolume += weight * set.reps;

      const existing = setGroups.find(
        (g) => g.weight === weight && g.reps === set.reps
      );
      if (existing) {
        existing.count++;
      } else {
        setGroups.push({ weight, reps: set.reps, count: 1 });
      }
    }

    const setDescriptions = setGroups.map((g) => {
      if (g.weight > 0) {
        return `${g.count}×${g.reps} @ ${g.weight}kg`;
      }
      return `${g.count}×${g.reps}`;
    });

    lines.push(`💪 ${exercise.exercise.name}: ${setDescriptions.join(', ')}`);
  }

  lines.push('');
  lines.push(`📊 Total Volume: ${formatVolumeForShare(totalVolume)}`);
  lines.push(`🔢 ${workout.exercises.length} exercises | ${totalSets} sets`);

  if (workout.notes) {
    lines.push(`📝 ${workout.notes}`);
  }

  lines.push('');
  lines.push('#LiftArc #Workout #Fitness');

  return lines.join('\n');
}

/**
 * Share workout text using the native Share API.
 */
export async function shareWorkoutText(text: string): Promise<void> {
  try {
    await Share.share(
      {
        message: text,
        ...(Platform.OS === 'ios' ? { title: 'LiftArc Workout' } : {}),
      },
      {
        dialogTitle: 'Share your workout',
      }
    );
  } catch (error: any) {
    // User cancelled - not an error
    if (error?.message !== 'User did not share') {
      console.error('Share failed:', error);
    }
  }
}
