import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, TransitionPresets, CardStyleInterpolators } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationState } from '@react-navigation/native';
import { trackScreen } from '../utils/analytics';
import type {
  AuthStackParamList,
  MainTabParamList,
  HomeStackParamList,
  CalendarStackParamList,
  ProgressStackParamList,
  ProfileStackParamList,
} from './types';
import {
  LoginScreen,
  SignUpScreen,
  ForgotPasswordScreen,
  OnboardingScreen,
  HomeScreen,
  WorkoutDetailScreen,
  WorkoutScreen,
  ActiveWorkoutScreen,
  ExerciseSelectionScreen,
  ExerciseListScreen,
  ExerciseDetailScreen,
  CreateExerciseScreen,
  CalendarScreen,
  ProgressScreen,
  ExerciseProgressScreen,
  ProfileScreen,
  GoalSettingScreen,
  AchievementsScreen,
  TemplateListScreen,
  ActiveWorkoutFromTemplateScreen,
  PrivacyPolicyScreen,
  DeleteAccountScreen,
  ExportDataScreen,
  NotificationSettingsScreen,
} from '../screens';
import { useAuth, useTheme } from '../contexts';
import { seedExercises } from '../services';
import {
  setupNotificationChannels,
  registerForPushNotifications,
  scheduleWorkoutReminders,
  addNotificationResponseListener,
  getLastNotificationResponse,
} from '../services/notificationService';
import { ErrorBoundary, OfflineBanner } from '../components';
import type { ThemeColors } from '../constants/theme';

const AuthStack = createStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const CalendarStack = createStackNavigator<CalendarStackParamList>();
const ProgressStack = createStackNavigator<ProgressStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStack.Screen name="SignUpScreen" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="OnboardingScreen" component={OnboardingScreen} />
    </AuthStack.Navigator>
  );
}

// Shared stack screen options with slide-from-right transition
const getStackScreenOptions = (colors: ThemeColors) => ({
  headerStyle: {
    backgroundColor: colors.background,
  },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: {
    color: colors.textPrimary,
  },
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
});

function HomeNavigator() {
  const { colors } = useTheme();
  const screenOptions = getStackScreenOptions(colors);
  
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen
        name="WorkoutDetailScreen"
        component={WorkoutDetailScreen}
        options={{ title: 'Workout Details' }}
      />
      <HomeStack.Screen
        name="WorkoutScreen"
        component={WorkoutScreen}
        options={{ title: 'New Workout' }}
      />
      <HomeStack.Screen
        name="ActiveWorkoutScreen"
        component={ActiveWorkoutScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="ExerciseSelectionScreen"
        component={ExerciseSelectionScreen}
        options={{ title: 'Add Exercise' }}
      />
      <HomeStack.Screen
        name="ExerciseListScreen"
        component={ExerciseListScreen}
        options={{ title: 'Exercise Library' }}
      />
      <HomeStack.Screen
        name="ExerciseDetailScreen"
        component={ExerciseDetailScreen}
        options={{ title: 'Exercise Details' }}
      />
      <HomeStack.Screen
        name="CreateExerciseScreen"
        component={CreateExerciseScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="GoalSettingScreen"
        component={GoalSettingScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="AchievementsScreen"
        component={AchievementsScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="TemplateListScreen"
        component={TemplateListScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="ActiveWorkoutFromTemplateScreen"
        component={ActiveWorkoutFromTemplateScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

function CalendarNavigator() {
  const { colors } = useTheme();
  const screenOptions = getStackScreenOptions(colors);
  
  return (
    <CalendarStack.Navigator screenOptions={screenOptions}>
      <CalendarStack.Screen
        name="CalendarScreen"
        component={CalendarScreen}
        options={{ headerShown: false }}
      />
    </CalendarStack.Navigator>
  );
}

function ProgressNavigator() {
  const { colors } = useTheme();
  const screenOptions = getStackScreenOptions(colors);
  
  return (
    <ProgressStack.Navigator screenOptions={screenOptions}>
      <ProgressStack.Screen
        name="ProgressScreen"
        component={ProgressScreen}
        options={{ headerShown: false }}
      />
      <ProgressStack.Screen
        name="ExerciseProgressScreen"
        component={ExerciseProgressScreen}
        options={{ title: 'Exercise Progress' }}
      />
    </ProgressStack.Navigator>
  );
}

function ProfileNavigator() {
  const { colors } = useTheme();
  const screenOptions = getStackScreenOptions(colors);
  
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="AchievementsScreen"
        component={AchievementsScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="NotificationSettingsScreen"
        component={NotificationSettingsScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="PrivacyPolicyScreen"
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="DeleteAccountScreen"
        component={DeleteAccountScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="ExportDataScreen"
        component={ExportDataScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );
}

function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  // On Android, ensure minimum spacing even if insets aren't detected (common in Expo Go)
  // On iOS, safe area insets are always reliable
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 20)
    : insets.bottom;

  // Active tab color: pink/coral in dark mode, purple in light mode
  const activeTabColor = isDark ? colors.pink : colors.purple;

  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          animation: 'fade' as const,
          tabBarActiveTintColor: activeTabColor,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
            borderTopColor: colors.tabBarBorder,
            paddingBottom: bottomInset + 4,
            paddingTop: 4,
            height: 60 + bottomInset,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'CalendarTab') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'ProgressTab') {
              iconName = focused ? 'trending-up' : 'trending-up-outline';
            } else if (route.name === 'ProfileTab') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeNavigator}
          options={{ 
            tabBarLabel: 'Home',
            tabBarAccessibilityLabel: 'Home tab',
          }}
        />
        <Tab.Screen
          name="CalendarTab"
          component={CalendarNavigator}
          options={{ 
            tabBarLabel: 'Calendar',
            tabBarAccessibilityLabel: 'Calendar tab',
          }}
        />
        <Tab.Screen
          name="ProgressTab"
          component={ProgressNavigator}
          options={{ 
            tabBarLabel: 'Progress',
            tabBarAccessibilityLabel: 'Progress tab',
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileNavigator}
          options={{ 
            tabBarLabel: 'Profile',
            tabBarAccessibilityLabel: 'Profile tab',
          }}
        />
      </Tab.Navigator>
  );
}

/**
 * Recursively extract the active route name from a navigation state.
 */
function getActiveRouteName(state: NavigationState | undefined): string | undefined {
  if (!state) return undefined;
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRouteName(route.state as NavigationState);
  }
  return route.name;
}

const navigationRef = createNavigationContainerRef();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const routeNameRef = useRef<string | undefined>(undefined);

  // Check onboarding status and seed exercises when user logs in
  useEffect(() => {
    checkOnboardingStatus();
    if (user) {
      seedExercises().catch((err) => console.warn('Exercise seed skipped:', err));
    }
  }, [user]);

  // Setup notifications when user is authenticated
  useEffect(() => {
    if (!user) return;

    // Setup Android notification channels
    setupNotificationChannels().catch(console.error);

    // Register for push notifications and store token
    registerForPushNotifications(user.id).catch(console.error);

    // Re-schedule any existing workout reminders (e.g., after app update)
    scheduleWorkoutReminders().catch(console.error);

    // Handle notification taps → navigate to relevant screen
    const cleanup = addNotificationResponseListener((screen) => {
      if (!screen) return;
      // Navigate based on the screen hint stored in the notification data
      try {
        if (screen === 'AchievementsScreen') {
          // Navigate to Profile tab → Achievements
          navigationRef.current?.navigate('ProfileTab' as never);
        } else if (screen === 'ProfileScreen') {
          navigationRef.current?.navigate('ProfileTab' as never);
        }
        // Default: just open the app (HomeScreen)
      } catch (err) {
        console.warn('Notification navigation failed:', err);
      }
    });

    return cleanup;
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('@liftarc_onboarding_complete');
      setOnboardingComplete(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingComplete(false);
    }
  };

  // Show loading screen while checking auth state or onboarding status
  if (loading || (user && onboardingComplete === null)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={(state) => {
          // Re-check onboarding status when navigation changes
          if (user) {
            checkOnboardingStatus();
          }

          // Track screen views for analytics
          const currentRouteName = getActiveRouteName(state as NavigationState | undefined);
          if (currentRouteName && currentRouteName !== routeNameRef.current) {
            trackScreen(currentRouteName);
          }
          routeNameRef.current = currentRouteName;
        }}
      >
        {user ? (
          onboardingComplete ? (
            <MainTabNavigator />
          ) : (
            <AuthStack.Navigator screenOptions={{ headerShown: false }}>
              <AuthStack.Screen name="OnboardingScreen" component={OnboardingScreen} />
            </AuthStack.Navigator>
          )
        ) : (
          <AuthNavigator />
        )}
        <OfflineBanner />
      </NavigationContainer>
    </ErrorBoundary>
  );
}
