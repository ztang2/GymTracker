import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { AuthProvider, ThemeProvider, useTheme } from './src/contexts';
import { setupNotificationChannel } from './src/services';
import { initSentry, Sentry } from './src/utils/sentry';
import { startAnalytics } from './src/utils/analytics';

// Initialize Sentry as early as possible
initSentry();

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

function App() {
  // Set up Android notification channel on app startup and start analytics
  useEffect(() => {
    setupNotificationChannel();
    startAnalytics();
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

// Wrap the root component with Sentry for automatic performance & error tracking
export default Sentry.wrap(App);
