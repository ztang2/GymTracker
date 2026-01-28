# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FitTrack** (formerly GymTracker) is a React Native mobile application built with Expo for tracking gym workouts across iOS, Android, and web platforms. The app features a modern dark theme with glassmorphism UI, uses Supabase as a backend for data persistence, and includes comprehensive visualization capabilities for workout progress and analytics.

## Development Commands

### Running the Application
```bash
npm start              # Start Expo development server
npm run android        # Run on Android device/emulator
npm run ios            # Run on iOS device/simulator
npm run web            # Run in web browser
```

**Web Setup (First Time Only):**
The web platform requires additional dependencies. If you encounter an error about missing dependencies when running `npm run web`, install them:

```bash
npx expo install react-dom react-native-web
```

After installation, the web version will be accessible at `http://localhost:8081` (or another port if 8081 is in use). The dev server will automatically open your browser or you can manually navigate to the URL shown in the terminal.

### Building for Production
This project uses EAS (Expo Application Services) for builds. Three build profiles are configured:

```bash
# Development build (APK for Android with dev client)
eas build --profile development

# Preview build (APK for internal testing)
eas build --profile preview

# Production build (app-bundle for store submission)
eas build --profile production
```

## Architecture

### Technology Stack
- **Framework:** React Native 0.81.5 with Expo ~54.0.32
- **Language:** TypeScript with strict mode enabled
- **Backend:** Supabase (PostgreSQL) via @supabase/supabase-js
- **UI Libraries:**
  - expo-linear-gradient for gradient components
  - react-native-chart-kit for data visualization
  - react-native-svg for custom graphics and contribution calendar
  - expo-notifications for local push notifications (rest timer alerts)
  - expo-device for device capability detection

### Project Structure

The codebase follows a feature-based organization:

```
src/
├── components/   # Reusable UI components (cards, charts, calendars, etc.)
├── constants/    # Theme, colors, typography, and design tokens
├── navigation/   # Navigation configuration and types
├── screens/      # Full-screen components (Home, Workout, Stats, etc.)
├── services/     # Business logic, API clients, and data services
└── utils/        # Utility functions (date formatting, calculations, etc.)
```

**Key Files:**
- `index.ts` - Entry point that registers the root component with Expo
- `App.tsx` - Root component where app initialization and top-level providers go
- `app.config.js` - Expo configuration (app name, icons, platform settings, environment variables)
- `eas.json` - Build and deployment configuration for EAS
- `.env` - Environment variables for Supabase credentials (not committed to git)

### Module Organization

Each directory (`components/`, `screens/`, `services/`) has an `index.ts` file for barrel exports. When creating new modules, export them through the index file:

```typescript
// In src/components/Button.tsx
export default function Button() { ... }

// In src/components/index.ts
export { default as Button } from './Button';
```

### Configuration Notes

- **New Architecture Enabled:** The app uses React Native's new architecture (`newArchEnabled: true`)
- **Orientation:** Locked to portrait mode
- **TypeScript:** Strict mode is enabled in `tsconfig.json`
- **Android:** Edge-to-edge display is enabled; predictive back gesture is disabled

### Supabase Integration

When implementing Supabase features:
1. Create the Supabase client in `src/services/supabase.ts`
2. Export the client through `src/services/index.ts`
3. Use environment variables or Expo's Constants for API keys (never commit credentials)

### Database Schema

The app uses the following Supabase tables:

**Core Tables:**
- `exercises` - Exercise library (id, name, category, description, muscle_groups)
- `workout_sessions` - Workout sessions (id, user_id, started_at, ended_at, duration_minutes, notes)
- `workout_exercises` - Exercises in a workout (id, workout_session_id, exercise_id, order_index)
- `exercise_sets` - Individual sets (id, workout_exercise_id, set_number, weight, reps, completed)

**Gamification Tables:**
- `user_profiles` - User XP and levels (id, user_id, display_name, avatar_url, total_xp, current_level)
- `badges` - Badge definitions (id, name, description, icon_name, category, requirement_type, requirement_value, xp_reward, rarity)
- `user_badges` - Earned badges (id, user_id, badge_id, earned_at)
- `personal_records` - PR tracking (id, user_id, exercise_id, record_type, value, achieved_at, workout_session_id, previous_value)

**Goal & Template Tables:**
- `user_goals` - User goals (id, user_id, goal_type, target_value, period_type, start_date, end_date, is_active)
- `workout_templates` - Saved templates (id, user_id, name, description, estimated_duration)
- `template_exercises` - Exercises in templates (id, template_id, exercise_id, order_index, target_sets, target_reps)

**Settings:**
- `user_settings` - User preferences stored in Supabase (currently using AsyncStorage locally)

The SQL migration file is located at `supabase/migrations/001_gamification_tables.sql`.

## Current Implementation Status

### Navigation Structure (FitTrack UI)
The app uses React Navigation with a bottom tab navigator containing four main sections. The navigation has been redesigned to the **FitTrack UI** with a modern, streamlined interface:

**🏠 Home Tab** (HomeStack):
- `HomeScreen` - FitTrack dashboard with XP progress bar, weekly stats cards, Quick Start buttons (New Workout, Set Goal), and recent workouts list
- `ActiveWorkoutScreen` - **Core workout logging screen** with duration timer, exercise cards, set tracking, haptic feedback, previous weights display, customizable rest timer, workout summary modal
- `WorkoutDetailScreen` - Shows details of a specific workout session
- `WorkoutScreen` - Legacy workout screen (replaced by ActiveWorkoutScreen)
- `ExerciseSelectionScreen` - Add exercises to the current workout
- `ExerciseListScreen` - Browse and search exercise library
- `ExerciseDetailScreen` - View details and history of a specific exercise
- `GoalSettingScreen` - Set weekly/monthly fitness goals with suggested targets
- `AchievementsScreen` - View all badges with progress and unlock status
- `TemplateListScreen` - Manage saved workout templates

**📅 Calendar Tab** (CalendarStack):
- `CalendarScreen` - Monthly calendar view with glassmorphism design, showing workout days with glowing teal rings, today highlighted in pink, multiple workout indicators, month navigation, workout day legend, and current streak card with orange gradient

**📈 Progress Tab** (ProgressStack):
- `ProgressScreen` - Simplified progress dashboard with "This Week" daily progress bars (Mon-Sun), "Monthly Goals" card (Workout Days, Total Volume), key metrics grid, and time range selector
- `ExerciseProgressScreen` - Detailed progress tracking for individual exercises

**👤 Profile Tab** (ProfileStack):
- `ProfileScreen` - User profile card with XP/level display, settings menu (Achievements, Notifications, Privacy, Account, About)
- `AchievementsScreen` - View all badges with progress (also accessible from Home)

### Services Implemented

**Core Services:**
- `workoutService.ts` - Workout session management (CRUD operations)
- `workoutLogger.ts` - Active workout state management, local exercise/set types, and Supabase save logic with transaction-like sequencing
- `exerciseService.ts` - Exercise library and tracking
- `statsService.ts` - Analytics, statistics, streaks, progress tracking, and `getLastPerformance()` for previous weights
- `notificationService.ts` - Local push notifications for rest timer alerts (expo-notifications wrapper)
- `supabase.ts` - Supabase client configuration
- `seedData.ts` - Sample data for initial setup
- `types.ts` - Shared TypeScript types and interfaces

**Gamification Services:**
- `gamificationService.ts` - XP rewards, level calculation, badge management
  - `awardXP(userId, amount)` - Awards XP and recalculates level
  - `calculateWorkoutXP(setCount, streakDays)` - Calculates XP earned from workout
  - `checkAndAwardBadges(userId)` - Checks eligibility and awards new badges
  - `getUserProfile(userId)` - Gets or creates user profile
  - `getBadgesWithStatus(userId)` - Gets all badges with unlock progress
  - `getLevelInfo(totalXP)` - Calculates level, tier name, and progress to next level

- `prService.ts` - Personal Records tracking
  - `detectPRsFromWorkout(userId, exercises)` - Detects new PRs from workout data
  - `getUserPRs(userId, exerciseId?)` - Gets user's personal records
  - Tracks max weight, max reps, and estimated 1RM (Brzycki formula)

- `goalService.ts` - User goal management
  - `createGoal()`, `updateGoal()`, `deleteGoal()` - Goal CRUD
  - `getGoalsWithProgress(userId)` - Gets goals with calculated progress
  - `getSuggestedGoals(userId)` - Suggests goals based on workout history

- `templateService.ts` - Workout template management
  - `createTemplateFromWorkout()` - Saves workout as reusable template
  - `getUserTemplates(userId)` - Gets user's saved templates
  - `getTemplateById(id)` - Gets template with exercises for starting workout

- `settingsService.ts` - Local user settings (AsyncStorage)
  - `getRestTimerSeconds()` / `setRestTimerSeconds()` - Rest timer duration preference
  - `isHapticFeedbackEnabled()` / `setHapticFeedbackEnabled()` - Haptic feedback toggle
  - `REST_TIMER_OPTIONS` - Available rest timer durations (60, 90, 120, 180 seconds)

### Components Library
The app includes a comprehensive set of reusable components:

**FitTrack UI Components (New):**
- `ActionButton` - Rounded square gradient/solid buttons for Quick Start actions (New Workout, Set Goal)
- `WorkoutHistoryCard` - Recent workout cards with colored circular icons, exercise names, date, and duration
- `MonthCalendar` - Custom calendar with glassmorphism design, glowing teal rings for workout days, pink circle for today, multiple workout dots, semi-transparent background with subtle borders
- `DailyProgressBar` - Weekly progress visualization showing Mon-Sun bars with purple-pink gradient for completed days
- `GoalProgressCard` - Monthly goals card displaying progress bars for Workout Days and Total Volume goals
- `UserProfileCard` - User profile with gradient background, circular avatar (initials if no image), name, and member since date
- `SettingsMenuItem` - Settings menu items with icons, titles, chevrons, and dividers

**Statistics Components:**
- `StatCard` - Gradient and solid metric display cards
- `TimeRangeSelector` - Time period filter (Week/Month/3M/Year/All)
- `ContributionCalendar` - GitHub-style workout heat map with streaks
- `ProgressBar` - Animated progress bars with gradient support
- `WorkoutTrendChart` - Line charts for workout frequency trends
- `CategoryChart` - Pie/Bar charts for exercise category distribution
- `ExerciseFrequencyList` - Ranked list of most frequent exercises

**Gamification Components:**
- `XPProgressBar` - Animated XP bar showing current level, tier, and progress to next level
- `LevelBadge` - Compact level indicator with tier color
- `BadgeCard` - Badge display card with rarity glow, progress bar for locked badges
- `BadgeUnlockedModal` - Celebration modal when earning new badges
- `PRBadge` - Trophy icon indicator for personal records
- `PRCelebrationModal` - Celebration modal when setting new PRs
- `WorkoutSummaryModal` - Post-workout summary showing duration, sets, volume, XP earned, and new badges/PRs
- `SaveAsTemplateModal` - Modal for saving current workout as a reusable template

**Utility Components:**
- `LoadingState` - Loading indicator with dark theme
- `EmptyState` - Empty state with title, message, and call-to-action button

### Environment Configuration
The app uses `.env` file for Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

These are loaded via `dotenv/config` in `app.config.js` and exposed through `expo-constants`.

### FitTrack UI Design System
The app uses a comprehensive dark theme with **glassmorphism/liquid glass aesthetics** defined in `src/constants/theme.ts`:

**Color Palette:**
- **Backgrounds:** Pure black (#000000) for main screens, semi-transparent dark gray (rgba(26, 26, 26, 0.6)) for glass cards
- **Text:** White primary (#ffffff), gray-400 (#9ca3af) secondary, gray-500 (#6b7280) tertiary
- **Accents:** Purple (#A855F7), Pink (#EC4899), Teal (#14B8A6), Green (#10B981), Orange (#F97316)
- **Gradients:** Purple-to-pink, teal-to-green, and orange gradients for cards and buttons

**Glassmorphism Features:**
- Semi-transparent backgrounds with rgba() for depth
- Subtle 1px borders with low opacity white (rgba(255, 255, 255, 0.08))
- Glowing ring effects on calendar workout indicators
- Soft shadows for elevation and depth
- Frosted glass aesthetic for cards and containers

**Key Design Elements:**
- **Calendar:** Glowing teal rings for workout days (not solid fills), pink solid circle for today with shadow glow, small dots for multiple workouts per day
- **Cards:** Semi-transparent backgrounds with subtle borders and shadows
- **Buttons:** Glass-effect navigation buttons with subtle backgrounds
- **Gradients:** Vibrant gradients with enhanced shadows (orange streak card with glow)
- **Typography:** Enhanced letter-spacing and font weights for better hierarchy

**Design Tokens:**
- Typography system with 10 predefined styles
- Spacing scale from xs (4px) to xxxl (32px)
- Border radius values from sm (8px) to full (9999px)
- Shadow definitions for elevation (including colored glows)

**Utility Functions:**
- `getCategoryColor(category)` - Returns vibrant color for exercise categories
- `getLevelTier(level)` - Returns tier name, color, and level range for gamification
- All colors are exported as readonly tuples for type safety with LinearGradient

**Gamification Colors:**
```typescript
// Badge rarity colors
export const rarityColors = {
  common: '#9CA3AF',      // Gray
  uncommon: '#10B981',    // Green
  rare: '#3B82F6',        // Blue
  epic: '#8B5CF6',        // Purple
  legendary: '#F59E0B',   // Gold
};

// XP progress bar gradient
export const xpGradient = ['#8B5CF6', '#EC4899']; // Purple to Pink
```

**Visual Hierarchy:**
- Tab bar icons: Solid when active (pink), outline when inactive
- Active tab color: Pink (#EC4899)
- Card stacking: Multiple layers with different opacity levels
- Glow effects: Used sparingly for emphasis (today indicator, streak card)

## Gamification System

The app includes a comprehensive gamification system to increase user engagement and motivation.

### XP Rewards

XP (Experience Points) are earned through various activities:

| Action | XP Reward |
|--------|-----------|
| Complete a workout | 100 XP |
| Complete a set | 5 XP |
| Streak day bonus | 25 XP/day (max 7 days = 175 XP) |
| Personal record | 50 XP |
| Badge unlock | 25 XP |

**XP Calculation Formula:**
```typescript
// Level from XP: level = (1 + sqrt(1 + 4*xp/50)) / 2
// XP for level: xp = 50 * (level^2 - level)

// Examples:
// Level 1: 0 XP
// Level 2: 100 XP
// Level 5: 1,000 XP
// Level 10: 4,500 XP
// Level 20: 19,000 XP
```

### Level Tiers

Users progress through named tiers as they level up:

| Level Range | Tier Name | Color |
|-------------|-----------|-------|
| 1-4 | Novice | Gray (#9CA3AF) |
| 5-9 | Beginner | Green (#10B981) |
| 10-19 | Intermediate | Blue (#3B82F6) |
| 20-34 | Advanced | Purple (#8B5CF6) |
| 35-49 | Expert | Pink (#EC4899) |
| 50+ | Legend | Gold (#F59E0B) |

### Badges

The app includes 20+ badges across different categories:

**Categories:**
- `milestone` - Workout count milestones (1st workout, 10 workouts, 100 workouts)
- `streak` - Consecutive day streaks (3-day, 7-day, 30-day, 100-day)
- `volume` - Total weight lifted (1,000kg, 10,000kg, 100,000kg)
- `strength` - Specific lift achievements
- `consistency` - Weekly workout consistency

**Rarity Tiers:**
| Rarity | Color | Example Badges |
|--------|-------|----------------|
| Common | Gray (#9CA3AF) | First Rep, Getting Started |
| Uncommon | Green (#10B981) | On Fire (7-day streak), Centurion (100 workouts) |
| Rare | Blue (#3B82F6) | Iron Will (30-day streak), Volume King |
| Epic | Purple (#8B5CF6) | Dedicated (365 workouts) |
| Legendary | Gold (#F59E0B) | Unstoppable (100-day streak), Legend |

### Personal Records (PRs)

The app tracks three types of PRs per exercise:

1. **Max Weight** - Heaviest weight lifted at any rep count
2. **Max Reps** - Most reps performed at any weight
3. **Estimated 1RM** - Calculated using Brzycki formula: `weight × (36 / (37 - reps))`

PRs are automatically detected when saving a workout and displayed with a trophy icon.

### Screen Refresh Behavior

The Home screen uses `useFocusEffect` to refresh data (including XP) every time it comes into focus, ensuring the XP bar updates immediately after completing a workout.

```typescript
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  useCallback(() => {
    loadData(); // Refreshes profile, workouts, and stats
  }, [])
);
```

## Stats & Analytics Features

The Stats tab provides comprehensive workout analytics and progress tracking:

### Contribution Calendar
- GitHub-style heat map showing daily workout frequency
- Color-coded intensity (0 workouts = dark gray, 1-3+ workouts = teal to dark green)
- Current streak and longest streak tracking
- Automatically adjusts to show last 26 weeks of data
- Today's date highlighted with pink border

### Workout Statistics
The dashboard displays key metrics in a grid of gradient cards:
- **Total Workouts** - All-time workout count
- **This Week** - Workouts in the last 7 days
- **Total Volume** - Sum of all reps × weight (kg)
- **Average Duration** - Mean workout duration in minutes
- **This Month** - Workouts in the last 30 days
- **Total Time** - Cumulative workout time

### Analytics & Trends
- **Workout Frequency Chart** - Line chart showing workouts per week over time
- **Category Distribution** - Pie chart showing exercise category breakdown
- **Top Exercises** - Ranked list of most frequently performed exercises

### Time Range Filtering
All statistics can be filtered by:
- Week (last 7 days)
- Month (last 30 days)
- 3 Months (last 90 days)
- Year (last 365 days)
- All Time (entire workout history)

### Exercise Progress Tracking
Individual exercise detail screens show:
- Max weight progression over time
- Total volume and reps
- Workout frequency (times per week)
- Personal records and averages
- Progress charts with customizable time ranges

### Data Calculations
The `statsService.ts` provides functions for:
- Streak calculations (consecutive workout days)
- Volume aggregation by category
- Exercise frequency ranking
- Weekly trend analysis
- Progress tracking per exercise

**Note:** All calculations are performed client-side using data fetched from Supabase. For large datasets (100+ workouts), consider implementing server-side aggregation using Supabase RPC functions for better performance.

### Date Utilities
The `src/utils/dateUtils.ts` module provides helper functions for date manipulation:
- `formatDate()` - Format dates to various string formats (YYYY-MM-DD, MMM DD, etc.)
- `getWeekNumber()` - Calculate ISO week number for a given date
- `getDateRange()` - Generate array of dates between start and end
- `getWeekStart()` / `getMonthStart()` - Get start of week/month
- `isSameDay()` / `isToday()` - Date comparison helpers
- `getLastNWeeks()` / `getLastNMonths()` - Calculate date ranges for time periods
- `formatWeekIdentifier()` - Format week as YYYY-WW for grouping

All date functions work with ISO date strings (YYYY-MM-DD) and are timezone-aware.

## Active Workout Logger

The Active Workout Logger (`ActiveWorkoutScreen`) is the core feature for logging workouts in real-time.

### Features

**UI Layout:**
- **Header:** Duration timer (MM:SS) counting up from workout start
- **Main Content:** Scrollable list of Exercise Cards
- **Footer:** Sticky "Add Exercise" and "Finish Workout" buttons
- **Tab Bar Hidden:** Automatically hides bottom navigation to prevent accidental navigation away

**Add Exercise Modal:**
- Fetches exercises from Supabase (`exercises` table)
- Search bar with real-time filtering
- Category filter chips (Chest, Back, Legs, Shoulders, Arms, Core, Cardio)
- Tap to add exercise to workout

**Exercise Card:**
- Displays exercise name and category
- Set rows with Weight (kg) and Reps inputs
- Checkbox to mark set as completed
- "Add Set" button to add more sets
- Remove exercise/set functionality

**Rest Timer (Auto-Start):**
- Automatically starts 90-second countdown when a set is marked complete
- Toast notification at bottom of screen
- "Skip" button to dismiss early
- **Vibration alert** when timer reaches 0

**Local Notifications (Native Only):**
- System notification sent when rest timer ends
- Works even when app is backgrounded or user is in another app
- Includes vibration pattern
- Requires notification permissions (requested on screen mount)

### Timer Accuracy

Both timers use **timestamp-based calculations** for accuracy:

```typescript
// Duration timer - always accurate even after backgrounding
const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);

// Rest timer - calculates remaining from end timestamp
const remaining = Math.ceil((restEndTime - Date.now()) / 1000);
```

**Why timestamps?** Traditional `setInterval` counters drift when:
- App is backgrounded (OS pauses JavaScript execution)
- Browser tab is inactive (browsers throttle intervals)
- Device goes to sleep

Using `Date.now()` calculations ensures the timer shows correct time when the user returns.

**AppState Listener:** Both timers listen for app state changes and update immediately when the app returns to foreground.

### Save Workflow

When "Finish Workout" is tapped:

1. **Validation:** Checks for at least one completed set with reps > 0
2. **Confirmation:** Shows alert asking user to confirm
3. **Cancel Notifications:** Cancels any pending rest timer notifications
4. **Save Sequence:**
   - Insert into `workout_sessions` → get session ID
   - Insert into `workout_exercises` using session ID
   - Insert into `exercise_sets` for each exercise
5. **Success:** Shows success alert, navigates back to Home
6. **Error Handling:** Rolls back on failure, shows error message

### Cross-Platform Alerts

The screen uses a custom `showAlert()` helper that works on all platforms:
- **iOS/Android:** Uses native `Alert.alert()`
- **Web:** Uses `window.confirm()` for confirmation dialogs

### Notification Service

The `notificationService.ts` provides:

```typescript
// Request permissions (call on screen mount)
requestNotificationPermissions(): Promise<boolean>

// Schedule rest timer notification
scheduleRestTimerNotification(seconds: number): Promise<string | null>

// Cancel a specific notification
cancelNotification(identifier: string | null): Promise<void>

// Cancel all notifications (cleanup on unmount)
cancelAllNotifications(): Promise<void>

// Set up Android notification channel (call on app startup)
setupNotificationChannel(): Promise<void>
```

**Platform Behavior:**
| Platform | Notifications | Timers |
|----------|---------------|--------|
| iOS | Yes (with permission) | Accurate |
| Android | Yes (with permission + channel) | Accurate |
| Web | No (graceful degradation) | Accurate |
| Emulator/Simulator | May not work | Accurate |

## Database Seeding

The project includes utility scripts for populating the database with sample data for testing and development:

### Seed Scripts

**`seedWorkouts.ts`** - Populates the database with sample workout data:
- Seeds 49 exercises across 7 categories (if not already present)
- Creates 20 workout sessions spread over the past 30 days
- Adds 4-6 exercises per workout with 3-4 sets each
- Generates realistic workout data (45-75 minute durations, 20-70kg weights, 8-12 reps)
- **Idempotent:** Skips seeding if data already exists

**`clearAndSeedWorkouts.ts`** - Clears existing workout data and seeds fresh data:
- Deletes all exercise sets, workout exercises, and workout sessions for test user
- Creates fresh workout data with the same pattern as seedWorkouts.ts
- Useful for resetting the database to a clean state with new sample data

### Running Seed Scripts

```bash
# Seed data (only if database is empty)
npx tsx seedWorkouts.ts

# Clear and reseed (removes existing data)
npx tsx clearAndSeedWorkouts.ts
```

**Note:** Both scripts use the test user ID `'test-user-123'` and require a valid `.env` file with Supabase credentials.

### Data Generated

After running the seed scripts, you'll have:
- 49 exercises in the library (Chest, Back, Legs, Shoulders, Arms, Core, Cardio)
- 20 workout sessions over the past 30 days
- ~100 exercises performed across all workouts
- ~350 total sets completed
- Realistic data to populate the calendar, progress charts, and statistics

This provides a complete dataset to showcase all FitTrack UI features including:
- Calendar with workout day indicators
- Weekly progress bars
- Monthly goal tracking
- Recent workouts list
- Statistics and analytics

## Development Best Practices

### Working with the FitTrack UI Theme

When creating new screens or components:

1. **Always import design tokens from the theme:**
   ```typescript
   import { colors, typography, spacing, borderRadius } from '../constants/theme';
   ```

2. **Use theme colors instead of hardcoded values:**
   ```typescript
   // ✅ Good
   backgroundColor: colors.background
   color: colors.textPrimary

   // ❌ Bad
   backgroundColor: '#000000'
   color: '#ffffff'
   ```

3. **For glassmorphism effects, use semi-transparent backgrounds:**
   ```typescript
   // ✅ Glassmorphism card
   backgroundColor: 'rgba(26, 26, 26, 0.6)', // Semi-transparent
   borderWidth: 1,
   borderColor: 'rgba(255, 255, 255, 0.08)', // Subtle border
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 4 },
   shadowOpacity: 0.3,
   shadowRadius: 12,
   ```

4. **For gradients, use readonly tuple type:**
   ```typescript
   interface Props {
     gradientColors?: readonly [string, string, ...string[]];
   }

   // Usage
   <LinearGradient colors={colors.gradientPurplePink} />
   ```

5. **Category colors:**
   ```typescript
   import { getCategoryColor } from '../constants/theme';

   const categoryColor = getCategoryColor('Chest'); // Returns '#F97316' (orange)
   ```

6. **Glowing effects for emphasis:**
   ```typescript
   // Glowing ring (e.g., calendar workout indicators)
   borderWidth: 2,
   borderColor: colors.teal,
   shadowColor: colors.teal,
   shadowOffset: { width: 0, height: 0 },
   shadowOpacity: 0.6,
   shadowRadius: 8,
   ```

### TypeScript Considerations

1. **LinearGradient requires readonly tuples:**
   The `colors` prop in `expo-linear-gradient` expects `readonly [ColorValue, ColorValue, ...ColorValue[]]`. Always define gradient arrays as readonly tuples in the theme file.

2. **Chart library props:**
   `react-native-chart-kit` BarChart requires `yAxisLabel` and `yAxisSuffix` props (can be empty strings).

3. **Navigation types:**
   All navigation param lists are strongly typed. Use the exported prop types from `src/navigation/types.ts`.

### Performance Optimization

1. **Stats calculations:**
   - Use `useMemo` for expensive calculations
   - Use `useCallback` for event handlers
   - Consider pagination for large datasets

2. **Chart rendering:**
   - Limit data points to 10-15 for readability
   - Use `React.memo` for chart components
   - Aggregate data before passing to charts

### Navigation & Safe Area Insets

The bottom tab navigation is configured to respect device safe areas, ensuring the tab bar appears above system UI elements (Android navigation buttons, iOS home indicator) on all devices.

**Implementation:**
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

// Tab bar style configuration
tabBarStyle: {
  paddingBottom: insets.bottom + 4,  // Add safe area inset to padding
  height: 60 + insets.bottom,        // Add safe area inset to height
}
```

**How it works:**
- The `useSafeAreaInsets()` hook automatically detects device-specific safe areas
- **Android phones with navigation buttons:** `insets.bottom` returns the navigation bar height (24-48px), pushing the tab bar above the buttons
- **Android phones with gesture navigation:** `insets.bottom` is 0 or minimal, keeping the tab bar at the natural bottom
- **iOS devices:** `insets.bottom` accounts for the home indicator area
- **Tablets and other form factors:** Automatically adjusts accordingly

**Key points:**
1. Always wrap your app with `SafeAreaProvider` in `App.tsx`
2. Use `useSafeAreaInsets()` for any bottom navigation, modals, or floating UI elements
3. The adjustment is automatic - no platform-specific code required
4. This ensures consistent UX across all Android, iOS, and tablet devices

See `src/navigation/AppNavigator.tsx` for the complete implementation.

## Troubleshooting

### Port Conflicts
If you encounter "Port 8081 is being used by another process" errors:

**Solution 1 - Specify a different port:**
```bash
npx expo start --port 8082
# or for web specifically
npx expo start --web --port 8082
```

**Solution 2 - Find and kill the process:**
```bash
# Windows
netstat -ano | findstr :8081
taskkill //F //PID <process_id>

# Mac/Linux
lsof -i :8081
kill -9 <process_id>
```

**Note:** Ports 8081, 8082, and 8083 are commonly used by Metro bundler. If these are occupied, incrementally try higher ports (8084, 8085, etc.).

### Metro Bundler Cache Issues
If the Metro bundler appears stuck during startup with "Bundler cache is empty, rebuilding":

**This is normal behavior on first run.** The initial cache build can take 1-2 minutes. Subsequent runs will be much faster.

If Metro continues to hang:

**Solution 1 - Clear cache and restart:**
```bash
npx expo start --clear
```

**Solution 2 - Clear all caches:**
```bash
# Clear Metro bundler cache
npx react-native start --reset-cache

# Clear npm cache if needed
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install
```

### TypeScript Errors
Before running the app, verify there are no TypeScript compilation errors:
```bash
npx tsc --noEmit
```

### Dependency Version Warnings
You may see warnings like:
```
react-native-svg@15.15.1 - expected version: 15.12.1
```

**These are usually safe to ignore** unless you encounter specific functionality issues. If needed, align versions:
```bash
npx expo install react-native-svg@15.12.1
```

### First-Time Setup Checklist
1. Install dependencies: `npm install`
2. Create `.env` file with Supabase credentials
3. Verify TypeScript compilation: `npx tsc --noEmit`
4. Start dev server: `npm start` or `npm run web`
5. If port conflicts occur, use `--port` flag with an alternative port

### Common Recursive Issues

**Issue: Multiple server instances running simultaneously**
- **Symptom:** Port conflicts (8081, 8082, 8083 all occupied)
- **Cause:** Previous server instances not properly terminated
- **Fix:** Kill all running processes before starting a new one:
  ```bash
  # List all node processes
  tasklist | findstr node

  # Kill specific PIDs or use task manager
  taskkill //F //PID <pid>
  ```

**Issue: Metro bundler stuck in loading state**
- **Symptom:** Server starts but bundling never completes, shows "Waiting on http://localhost:XXXX" indefinitely
- **Cause:** Corrupted cache or compilation errors not displayed
- **Fix:**
  1. Stop the server (Ctrl+C)
  2. Check for TypeScript errors: `npx tsc --noEmit`
  3. Clear cache: `npx expo start --clear`
  4. If still stuck, delete `node_modules/.cache` directory

## FitTrack UI Implementation Status

### ✅ Completed Features

**Navigation (4 Tabs):**
- 🏠 Home Tab - FitTrack dashboard with Quick Start and recent workouts
- 📅 Calendar Tab - Monthly calendar with glassmorphism design
- 📈 Progress Tab - Weekly progress bars and monthly goals
- 👤 Profile Tab - User profile and settings

**FitTrack UI Components:**
- All 7 new components fully implemented and exported
- Glassmorphism styling applied throughout
- Responsive design for all screen sizes

**Calendar Features:**
- Custom MonthCalendar component with liquid glass aesthetic
- Glowing teal rings for workout days (not solid fills)
- Pink solid circle for today with shadow glow
- Multiple workout indicators (small dots)
- Semi-transparent card with subtle borders
- Month navigation with glass buttons
- Enhanced legend with pill-shaped items
- Orange gradient streak card with target icon

**Home Screen:**
- Weekly stats cards (Workouts, Minutes)
- Quick Start buttons (New Workout, Set Goal)
- Recent workouts list with cycling accent colors
- Pull-to-refresh functionality
- Loading and empty states

**Progress Screen:**
- This Week daily progress bars (Mon-Sun)
- Monthly Goals card (Workout Days, Total Volume)
- Key metrics grid
- Time range selector
- Simplified from original StatsScreen

**Profile Screen:**
- User profile card with gradient background
- Settings menu (Notifications, Privacy, Account, About)
- Alert placeholders for future features

**Active Workout Logger:**
- Full-screen workout logging experience (hides tab bar)
- Duration timer with timestamp-based accuracy
- Exercise cards with weight/reps inputs
- Set completion checkboxes
- Customizable rest timer (60/90/120/180 seconds) - long press to change
- Rest timer toast with skip button
- Local notifications for rest timer (native platforms)
- Vibration alerts when rest ends
- Haptic feedback on set completion (expo-haptics)
- Previous weights display ("Last: 60kg x 10 (Jan 15)")
- Workout completion summary modal with stats
- Save to Supabase with proper transaction sequencing
- Cross-platform alert dialogs (native + web)

**Gamification System:**
- XP rewards (100 XP per workout, 5 XP per set, streak bonuses)
- Level system (1-100+) with tier names (Novice to Legend)
- XP progress bar on Home screen
- 20+ achievement badges with rarity tiers (Common to Legendary)
- Badge unlock celebration modal
- Achievements screen with progress tracking
- Personal Records (PR) tracking (max weight, max reps, estimated 1RM)
- PR celebration modal when new records are set

**Goal Setting:**
- Goal setting screen with weekly/monthly targets
- Goal types: workout days, total workouts, volume, streak days
- Suggested goals based on workout history
- Progress tracking with visual progress bars

**Workout Templates:**
- Save workout as template
- Template list screen
- Start workout from template
- Pre-populated exercises from templates

**Data & Services:**
- All existing services remain functional
- Seed scripts for sample data
- Statistics calculations working
- New `workoutLogger.ts` for active workout state management
- New `notificationService.ts` for local push notifications
- New `settingsService.ts` for local settings (AsyncStorage)
- New `gamificationService.ts` for XP, levels, badges
- New `goalService.ts` for user goals
- New `prService.ts` for personal records
- New `templateService.ts` for workout templates

### 🚧 Future Enhancements

**Planned Features:**
- Real user authentication and profile management
- Remote push notifications (local notifications already implemented)
- Social features (workout sharing, friends, leaderboards)
- Export workout data
- Dark/light theme toggle
- Customizable color schemes
- Body metrics tracking (weight, measurements)

**Performance Optimizations:**
- Server-side aggregation for large datasets
- Pagination for workout history
- Caching strategies
- Image optimization

### 📝 Notes for Developers

1. **Hot Reload:** The app supports hot reloading - changes to components will automatically refresh in the browser
2. **Type Safety:** All TypeScript errors must be resolved before committing (`npx tsc --noEmit`)
3. **Glassmorphism:** When adding new cards/components, use the glassmorphism pattern (semi-transparent backgrounds, subtle borders, shadows)
4. **Icons:** Use Ionicons from `@expo/vector-icons` for consistency
5. **Testing:** Test with both empty database and seeded data to ensure proper loading/empty states
6. **Backward Compatibility:** Old screens (original StatsScreen) are preserved but not used in navigation

### Web Platform Considerations

When running on web (`npm run web`), some features behave differently:

**Alerts:**
- `Alert.alert()` doesn't work on web
- Use the `showAlert()` helper in `ActiveWorkoutScreen` which falls back to `window.confirm()`

**Notifications:**
- `expo-notifications` is not supported on web
- The notification service gracefully returns `null`/`false` on web
- Rest timer still works, just without system notifications

**Vibration:**
- `Vibration.vibrate()` is not supported on web
- Wrapped in `Platform.OS !== 'web'` checks

**Input Behavior:**
- `selectTextOnFocus` may behave differently across browsers
- Test on multiple browsers (Chrome, Firefox, Safari) for input handling
