import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import type {
  MainTabParamList,
  HomeStackParamList,
  WorkoutStackParamList,
  ExercisesStackParamList,
} from './types';
import {
  HomeScreen,
  WorkoutDetailScreen,
  WorkoutScreen,
  ExerciseSelectionScreen,
  ExerciseListScreen,
  ExerciseDetailScreen,
} from '../screens';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const WorkoutStack = createStackNavigator<WorkoutStackParamList>();
const ExercisesStack = createStackNavigator<ExercisesStackParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home' }} />
      <HomeStack.Screen
        name="WorkoutDetailScreen"
        component={WorkoutDetailScreen}
        options={{ title: 'Workout Details' }}
      />
    </HomeStack.Navigator>
  );
}

function WorkoutNavigator() {
  return (
    <WorkoutStack.Navigator>
      <WorkoutStack.Screen
        name="WorkoutScreen"
        component={WorkoutScreen}
        options={{ title: 'Workout' }}
      />
      <WorkoutStack.Screen
        name="ExerciseSelectionScreen"
        component={ExerciseSelectionScreen}
        options={{ title: 'Add Exercise' }}
      />
    </WorkoutStack.Navigator>
  );
}

function ExercisesNavigator() {
  return (
    <ExercisesStack.Navigator>
      <ExercisesStack.Screen
        name="ExerciseListScreen"
        component={ExerciseListScreen}
        options={{ title: 'Exercises' }}
      />
      <ExercisesStack.Screen
        name="ExerciseDetailScreen"
        component={ExerciseDetailScreen}
        options={{ title: 'Exercise Details' }}
      />
    </ExercisesStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#666',
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeNavigator}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="WorkoutTab"
          component={WorkoutNavigator}
          options={{ tabBarLabel: 'Workout' }}
        />
        <Tab.Screen
          name="ExercisesTab"
          component={ExercisesNavigator}
          options={{ tabBarLabel: 'Exercises' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
