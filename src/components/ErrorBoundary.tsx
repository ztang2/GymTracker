import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, typography, borderRadius } from '../constants/theme';
import { captureException } from '../utils/sentry';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Fallback colors for class component (can't use hooks)
const FALLBACK_COLORS = {
  background: '#0D0B1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#A59FBF',
  purple: '#8B5CF6',
  gradientPurplePink: ['#A855F7', '#EC4899'] as const,
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report to Sentry with component stack context
    captureException(error, {
      componentStack: errorInfo.componentStack ?? 'unknown',
    });
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.container, { backgroundColor: FALLBACK_COLORS.background }]}>
          <View style={styles.content}>
            {/* Icon/Title */}
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>⚠️</Text>
            </View>

            <Text style={[styles.title, { color: FALLBACK_COLORS.textPrimary }]}>
              Oops! Something went wrong
            </Text>

            <Text style={[styles.message, { color: FALLBACK_COLORS.textSecondary }]}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            {/* Error Details (Dev Mode Only) */}
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetailsContainer}>
                <Text style={[styles.errorDetailsTitle, { color: FALLBACK_COLORS.textPrimary }]}>
                  Error Details (Dev Mode):
                </Text>
                <Text style={[styles.errorDetailsText, { color: FALLBACK_COLORS.textSecondary }]}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={[styles.errorDetailsText, { color: FALLBACK_COLORS.textSecondary }]}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            {/* Try Again Button */}
            <TouchableOpacity
              style={[styles.buttonContainer, { shadowColor: FALLBACK_COLORS.purple }]}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={FALLBACK_COLORS.gradientPurplePink}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconText: {
    fontSize: 72,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    marginBottom: spacing.xxxl,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorDetailsContainer: {
    width: '100%',
    maxHeight: 200,
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.md,
  },
  errorDetailsTitle: {
    ...typography.callout,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  errorDetailsText: {
    ...typography.caption,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  buttonContainer: {
    width: '100%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.headline,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
