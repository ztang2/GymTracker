import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import type { ProfileScreenProps } from '../navigation/types';
import { UserProfileCard, SettingsMenuItem, XPProgressBar } from '../components';
import { getUserProfile, getLevelInfo, type LevelInfo } from '../services';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { useAuth } from '../contexts';


export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, signOut } = useAuth();

  // Get user display name from metadata or email
  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Fitness Enthusiast';
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        setLevelInfo(getLevelInfo(profile.total_xp));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleAchievements = () => {
    navigation.navigate('AchievementsScreen');
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Notification settings coming soon!');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy', 'Privacy settings coming soon!');
  };

  const handleAccount = () => {
    Alert.alert('Account', 'Account settings coming soon!');
  };

  const handleAbout = () => {
    Alert.alert(
      'About FitTrack',
      'FitTrack - Your personal gym workout tracker.\n\nVersion 1.0.0\n\nBuilt with React Native and Expo.'
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>

      {/* User Profile Card */}
      <View style={styles.section}>
        <UserProfileCard
          userName={userName}
          memberSince={memberSince}
          gradientColors={colors.gradientPurplePink}
        />
      </View>

      {/* XP Progress */}
      {levelInfo && (
        <View style={styles.section}>
          <XPProgressBar levelInfo={levelInfo} />
        </View>
      )}

      {/* Achievements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <View style={styles.settingsCard}>
          <SettingsMenuItem
            title="Achievements"
            icon="ribbon"
            onPress={handleAchievements}
            showDivider={false}
          />
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsCard}>
          <SettingsMenuItem
            title="Notifications"
            icon="notifications"
            onPress={handleNotifications}
          />
          <SettingsMenuItem
            title="Privacy"
            icon="lock-closed"
            onPress={handlePrivacy}
          />
          <SettingsMenuItem
            title="Account"
            icon="person-circle"
            onPress={handleAccount}
          />
          <SettingsMenuItem
            title="About"
            icon="information-circle"
            onPress={handleAbout}
          />
          <SettingsMenuItem
            title="Sign Out"
            icon="log-out-outline"
            onPress={handleSignOut}
            showDivider={false}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.largeTitle,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.title2,
    marginBottom: spacing.lg,
  },
  settingsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
});
