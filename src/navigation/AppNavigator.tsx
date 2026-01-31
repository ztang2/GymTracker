import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, ActivityIndicator } from 'react-native';
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
  HomeScreen,
  WorkoutDetailScreen,
  WorkoutScreen,
  ActiveWorkoutScreen,
  ExerciseSelectionScreen,
  ExerciseListScreen,
  ExerciseDetailScreen,
  CalendarScreen,
  ProgressScreen,
  ExerciseProgressScreen,
  ProfileScreen,
  GoalSettingScreen,
  AchievementsScreen,
  TemplateListScreen,
} from '../screens';
import { useAuth, useTheme } from '../contexts';

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
    </AuthStack.Navigator>
  );
}

function HomeNavigator() {
  const { colors } = useTheme();
  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: {
      color: colors.textPrimary,
    },
  };
  
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
    </HomeStack.Navigator>
  );
}

function CalendarNavigator() {
  const { colors } = useTheme();
  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: {
      color: colors.textPrimary,
    },
  };
  
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
  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: {
      color: colors.textPrimary,
    },
  };
  
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
  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: {
      color: colors.textPrimary,
    },
  };
  
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
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="CalendarTab"
          component={CalendarNavigator}
          options={{ tabBarLabel: 'Calendar' }}
        />
        <Tab.Screen
          name="ProgressTab"
          component={ProgressNavigator}
          options={{ tabBarLabel: 'Progress' }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileNavigator}
          options={{ tabBarLabel: 'Profile' }}
        />
      </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
