export { supabase } from './supabase';
// seedData is lazy-loaded to avoid bundling 800+ lines of exercise data eagerly.
// Use: const { seedExercises } = await import('./seedData');
// Re-export the function with a lazy wrapper for backward compatibility.
export const seedExercises = async (): Promise<void> => {
  const mod = await import('./seedData');
  return mod.seedExercises();
};
export const getSeedExercises = async () => {
  const mod = await import('./seedData');
  return mod.SEED_EXERCISES;
};
export * from './authService';
export * from './exerciseService';
export * from './workoutService';
export * from './workoutLogger';
export * from './statsService';
export * from './notificationService';
export * from './settingsService';
export * from './goalService';
export * from './gamificationService';
export * from './prService';
export * from './templateService';
export * from './exerciseStatsService';
export * from './exportService';
export * from './avatarService';
export * from './offlineQueue';
export * from './types';
