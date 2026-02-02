import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { typography, borderRadius, spacing } from '../constants/theme';

interface UserProfileCardProps {
  userName: string;
  userAvatar?: string | null; // URL to avatar image
  memberSince: string; // e.g., "Jan 2026"
  gradientColors?: readonly [string, string, ...string[]];
  onAvatarPress?: () => void;
  avatarLoading?: boolean;
}

export default function UserProfileCard({
  userName,
  userAvatar,
  memberSince,
  gradientColors,
  onAvatarPress,
  avatarLoading,
}: UserProfileCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const gradColors = gradientColors || colors.gradientPurplePink;
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
      colors={gradColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
      accessibilityLabel={`User profile: ${userName}, member since ${memberSince}`}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={onAvatarPress}
          disabled={!onAvatarPress || avatarLoading}
          activeOpacity={0.7}
          accessibilityLabel="Change profile picture"
          accessibilityRole="button"
        >
          {avatarLoading ? (
            <View style={styles.avatarPlaceholder}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          ) : userAvatar ? (
            <Image 
              source={{ uri: userAvatar }} 
              style={styles.avatar}
              accessibilityLabel={`${userName}'s profile picture`}
            />
          ) : (
            <View style={styles.avatarPlaceholder} accessible={false}>
              <Text style={styles.initialsText}>{getInitials(userName)}</Text>
            </View>
          )}
          {onAvatarPress && !avatarLoading && (
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* User info */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{userName}</Text>
          <Text style={styles.memberText}>Member since {memberSince}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  initialsText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',  // Always white on gradient backgrounds
  },
  infoContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  nameText: {
    ...typography.title,
    fontWeight: '700',
    color: '#FFFFFF',  // Always white on gradient backgrounds
  },
  memberText: {
    ...typography.callout,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
