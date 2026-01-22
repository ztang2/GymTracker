# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GymTracker is a React Native mobile application built with Expo for tracking gym workouts across iOS, Android, and web platforms. The app uses Supabase as a backend for data persistence and includes visualization capabilities for workout progress.

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
  - react-native-chart-kit for data visualization
  - react-native-calendars for workout scheduling
  - react-native-svg for custom graphics

### Project Structure

The codebase follows a feature-based organization:

```
src/
├── components/   # Reusable UI components (buttons, cards, inputs, etc.)
├── screens/      # Full-screen components (Home, Workout, Stats, etc.)
└── services/     # Business logic, API clients, and data services
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

## Current Implementation Status

### Navigation Structure
The app uses React Navigation with a bottom tab navigator containing three main sections:

**Home Tab** (HomeStack):
- `HomeScreen` - Displays recent workout sessions
- `WorkoutDetailScreen` - Shows details of a specific workout session

**Workout Tab** (WorkoutStack):
- `WorkoutScreen` - Start/manage active workout sessions
- `ExerciseSelectionScreen` - Add exercises to the current workout

**Exercises Tab** (ExercisesStack):
- `ExerciseListScreen` - Browse and search exercise library
- `ExerciseDetailScreen` - View details and history of a specific exercise

### Services Implemented
- `workoutService.ts` - Workout session management (CRUD operations)
- `exerciseService.ts` - Exercise library and tracking
- `supabase.ts` - Supabase client configuration
- `seedData.ts` - Sample data for initial setup
- `types.ts` - Shared TypeScript types

### Environment Configuration
The app uses `.env` file for Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

These are loaded via `dotenv/config` in `app.config.js` and exposed through `expo-constants`.

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
