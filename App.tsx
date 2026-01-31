import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { AuthProvider, ThemeProvider, useTheme } from './src/contexts';
import { setupNotificationChannel } from './src/services';

// Inner component that uses theme context
function AppContent() {
  const { isDark } = useTheme();
  
  return (
    <>
      <AppNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  // Set up Android notification channel on app startup
  useEffect(() => {
    setupNotificationChannel();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
