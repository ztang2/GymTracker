# LiftArc Performance Report

**Date:** 2026-02-02  
**Scope:** List rendering, memory leaks, bundle size, render optimization

---

## 1. List Rendering Optimization

### FlatList/SectionList Audit

| Component | List Type | `keyExtractor` | `removeClippedSubviews` | Virtualization Props |
|---|---|---|---|---|
| ExerciseSelectionModal | FlatList | ✅ already | ✅ **added** | ✅ **added** `initialNumToRender=15`, `maxToRenderPerBatch=10`, `windowSize=5` |
| ExerciseSelectionScreen | SectionList | ✅ already | ✅ **added** | ✅ **added** same |
| ExerciseListScreen | SectionList | ✅ already | ✅ **added** | ✅ **added** same |
| ExerciseFrequencyList | FlatList | ✅ already | N/A (scrollEnabled=false) | N/A (embedded list) |
| HomeScreen | ScrollView + `.map()` | N/A (capped at 15 items) | N/A | N/A — small list, no need for virtualization |
| TemplateListScreen | ScrollView + `.map()` | N/A | N/A | Low item count; OK as-is |
| AchievementsScreen | ScrollView + `.map()` | N/A | N/A | Grid layout with flexWrap; FlatList `numColumns` would be an alternative but adds complexity for small gain |

**Note:** `getItemLayout` was not added because list items have variable heights (exercise cards with dynamic set counts, badge cards with progress bars). Fixed-height estimation would cause layout jumps.

### React.memo Applied

| Component | Rationale |
|---|---|
| `ExerciseListItem` | ✅ **added** — rendered in lists with 100+ items |
| `RecentWorkoutCard` | ✅ **added** — rendered in home screen list |
| `WorkoutHistoryCard` | ✅ **added** — rendered in workout history |
| `BadgeCard` | ✅ **added** — rendered in badge lists (30+ items) |
| `SetRow` | ✅ **added** — frequently re-rendered during active workout (weight/rep editing) |
| `GridBadgeCard` | ✅ **added** — rendered in 3-column grid with 30+ badges |

---

## 2. Memory Leak Prevention

### `useRestTimer` — ✅ Already Clean
- `restTimerRef` interval is cleared in the `useEffect` cleanup
- `AppState.addEventListener` subscription is removed in cleanup
- Notification cleanup runs on unmount (`cancelAllNotifications`)

### `useWorkoutTimer` — ✅ Already Clean
- `setInterval` is cleared in `useEffect` return
- `AppState.addEventListener` subscription is removed in cleanup

### `AuthContext` — ✅ Already Clean
- Auth state subscription calls `subscription.unsubscribe()` in cleanup
- Init effect uses `mounted` flag to prevent state updates after unmount

### `useNetworkState` — ✅ Already Clean
- `NetInfo.addEventListener` returns unsubscribe function, called in cleanup

### `useEntranceAnimation` — ⚠️ Minor (No Change)
- Animation `Animated.timing` doesn't need explicit cleanup (native driver handles it)
- No interval or subscription to leak

### `GradientIcon` (HomeScreen) — ✅ Already Clean
- `Animated.loop` is stopped via `pulse.stop()` in cleanup

### `useActiveWorkout` — ✅ Already Clean
- `useLayoutEffect` restores tab bar style on unmount
- No direct timers (delegates to `useRestTimer`/`useWorkoutTimer`)

**Verdict:** No memory leaks found. All hooks have proper cleanup.

---

## 3. Bundle Size

### Web Bundle Output
```
Main JS:  4.96 MB  (_expo/static/js/web/index-*.js)
SeedData: 26.2 kB  (_expo/static/js/web/seedData-*.js)  ← LAZY CHUNK
```

### seedData Lazy Loading — ✅ Fixed
**Before:** `SEED_EXERCISES` (817 lines, 125 exercises) was eagerly imported via `services/index.ts` barrel export, included in main bundle for every screen.

**After:** Wrapped in async lazy loader:
```ts
export const seedExercises = async (): Promise<void> => {
  const mod = await import('./seedData');
  return mod.seedExercises();
};
```
Result: seedData is now a separate chunk, loaded only when `seedExercises()` is called (on login).

### Import Analysis
- **@expo/vector-icons:** Only `Ionicons` is used — tree-shaking handles this correctly
- **expo-linear-gradient:** Lightweight, single-purpose — fine
- **@supabase/supabase-js:** Necessary, no alternative
- **No lodash or moment.js** — good, using native `Date` and array methods

---

## 4. Render Optimization

### Inline Objects/Functions in JSX

**HomeScreen:** `accentColors` array is defined per render but is cheap (4 strings). Not worth memoizing.

**ExerciseCard:** Uses `useRef` for highlight animation — already efficient. `createExerciseCardStyles(colors)` is called per render inside `SetRow` and `ExerciseCardHeader`, but since these are now wrapped in `React.memo`, they only re-render when props change.

**AchievementsScreen:** `createStyles(colors)` and `createGridStyles(colors, cardWidth)` are called per render. The `colors` object is stable from context, so re-renders are infrequent. `GridBadgeCard` is now memoized to prevent unnecessary grid re-renders.

**ActiveWorkoutScreen:** Already uses `useMemo` for styles: `useMemo(() => createStyles(colors), [colors])`.

### StyleSheet.create in Closures
Several components use `createStyles(colors)` pattern (dynamic theme styles). This recreates StyleSheet objects on each render, but:
- The cost is minimal (StyleSheet.create is fast)
- Theme changes are rare (only on toggle)
- Memoizing would add complexity for marginal gain

**No additional useMemo/useCallback added** — the components that re-render frequently (SetRow, ExerciseCard) benefit more from `React.memo` wrapping than from internal memoization.

---

## Summary of Changes

| File | Change |
|---|---|
| `services/index.ts` | Lazy-load seedData via dynamic `import()` |
| `components/ExerciseListItem.tsx` | Wrapped with `React.memo` |
| `components/RecentWorkoutCard.tsx` | Wrapped with `React.memo` |
| `components/WorkoutHistoryCard.tsx` | Wrapped with `React.memo` |
| `components/BadgeCard.tsx` | Wrapped with `React.memo` |
| `components/exercise-card/SetRow.tsx` | Wrapped with `React.memo` |
| `screens/AchievementsScreen.tsx` | Wrapped `GridBadgeCard` with `React.memo` |
| `components/ExerciseSelectionModal.tsx` | Added `removeClippedSubviews`, `initialNumToRender`, `maxToRenderPerBatch`, `windowSize` |
| `screens/ExerciseSelectionScreen.tsx` | Added same FlatList optimization props to SectionList |
| `screens/ExerciseListScreen.tsx` | Added same FlatList optimization props to SectionList |

### Pre-existing Issues (Not Introduced by This PR)
- `NotificationSettingsScreen` import error in AppNavigator
- Jest test failures due to Sentry ESM import (needs `transformIgnorePatterns` config)
