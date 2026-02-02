# Testing the Onboarding Flow

## Overview
The onboarding flow shows a 3-step welcome experience for new users after signup.

## Files Modified/Created
1. ✅ `src/screens/OnboardingScreen.tsx` - New onboarding screen
2. ✅ `src/navigation/types.ts` - Added OnboardingScreen type
3. ✅ `src/screens/index.ts` - Exported OnboardingScreen
4. ✅ `src/navigation/AppNavigator.tsx` - Integrated onboarding logic

## How to Test

### Test as a New User (Show Onboarding)
1. Clear AsyncStorage to simulate a new user:
   ```javascript
   // In your app's console or via React DevTools
   import AsyncStorage from '@react-native-async-storage/async-storage';
   await AsyncStorage.removeItem('@liftarc_onboarding_complete');
   ```

2. Or use this helper command in Metro console:
   ```javascript
   require('@react-native-async-storage/async-storage').default.removeItem('@liftarc_onboarding_complete');
   ```

3. Sign up with a new account or reload the app while logged in

4. You should see:
   - **Page 1:** Welcome screen with fitness goal selection
   - **Page 2:** Experience level selection  
   - **Page 3:** Summary and "Start Training" button

5. Complete the onboarding - you'll be taken to the Home screen

### Test as Returning User (Skip Onboarding)
1. Log out and log back in
2. Onboarding should NOT appear
3. You go directly to the Home screen

### Verify Data Persistence
After completing onboarding, check AsyncStorage:

```javascript
// Check onboarding completion
const completed = await AsyncStorage.getItem('@liftarc_onboarding_complete');
console.log('Onboarding completed:', completed); // Should be 'true'

// Check saved preferences
const prefs = await AsyncStorage.getItem('@liftarc_user_preferences');
console.log('User preferences:', JSON.parse(prefs));
// Should show: { goal: 'muscle', experience: 'beginner' } (or your selections)
```

## Features Implemented

✅ **3-Step Flow:**
- Welcome + Fitness Goal (Build Muscle / Lose Fat / Get Stronger / Stay Fit)
- Experience Level (Beginner / Intermediate / Advanced)
- Summary + Start Training

✅ **UX Features:**
- Horizontal pagination with dot indicators
- Smooth fade transitions
- Selectable cards with icons
- Gradient purple/pink buttons
- Dark theme support

✅ **Persistence:**
- AsyncStorage key: `@liftarc_onboarding_complete`
- User preferences: `@liftarc_user_preferences`

✅ **Navigation:**
- New users: Signup → Onboarding → Home
- Existing users: Login → Home (skip onboarding)
- Only shows ONCE per user

## TypeScript Status
✅ No TypeScript errors in OnboardingScreen implementation
⚠️ Pre-existing errors in codebase (DeleteAccountScreen, ExportDataScreen, etc.) are unrelated

## Styling
- Uses `useTheme()` hook for dynamic colors ✅
- Imports `spacing`, `typography`, `borderRadius` from constants ✅
- Uses `LinearGradient` for buttons ✅
- Matches app's dark theme with purple accents ✅

## Next Steps (Optional Enhancements)
- Add animation/lottie to welcome screen
- Add skip button for advanced users
- Save preferences to Supabase user profile
- Add more customization options (units, notification preferences, etc.)
