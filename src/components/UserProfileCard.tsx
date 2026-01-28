import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius, spacing } from '../constants/theme';

interface UserProfileCardProps {
  userName: string;
  userAvatar?: string; // URL to avatar image
  memberSince: string; // e.g., "Jan 2026"
  gradientColors?: readonly [string, string, ...string[]];
}

export default function UserProfileCard({
  userName,
  userAvatar,
  memberSince,
  gradientColors = colors.gradientPurplePink,
}: UserProfileCardProps) {
  // Get initials from user name (first letter of first and last name)
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.initialsText}>{getInitials(userName)}</Text>
            </View>
          )}
        </View>

        {/* User info */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{userName}</Text>
          <Text style={styles.memberText}>Member since {memberSince}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  nameText: {
    ...typography.title,
    fontWeight: '700',
  },
  memberText: {
    ...typography.callout,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
