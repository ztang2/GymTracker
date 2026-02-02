import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AchievementsScreenProps } from '../navigation/types';
import {
  getBadgesWithStatus,
  getUserProfile,
  getLevelInfo,
  checkAndAwardBadges,
  type BadgeWithStatus,
  type LevelInfo,
  type BadgeCategory,
  type Badge,
} from '../services';
import {
  LoadingState,
  XPProgressBar,
  BadgeCard,
  LevelBadge,
} from '../components';
import { typography, spacing, borderRadius, badgeCategoryIcons, rarityColors, rarityGradients } from '../constants/theme';
import { useAuth, useTheme } from '../contexts';
import { colorGlow } from '../utils';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = spacing.xl * 2;
const GRID_GAP = spacing.md;
const COLUMNS = 3;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

// Category display config
const CATEGORY_CONFIG: { key: BadgeCategory; label: string; icon: string }[] = [
  { key: 'milestone', label: 'Milestones', icon: 'ribbon' },
  { key: 'streak', label: 'Streaks', icon: 'flame' },
  { key: 'strength', label: 'Strength', icon: 'trophy' },
  { key: 'volume', label: 'Volume', icon: 'barbell' },
  { key: 'consistency', label: 'Consistency', icon: 'calendar' },
  { key: 'variety', label: 'Variety', icon: 'grid' },
  { key: 'dedication', label: 'Dedication', icon: 'time' },
];

export default function AchievementsScreen({ navigation }: AchievementsScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [badges, setBadges] = useState<BadgeWithStatus[]>([]);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newlyEarned, setNewlyEarned] = useState<Badge[]>([]);

  // Animation for congratulations card
  const congratsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (newlyEarned.length > 0) {
      Animated.spring(congratsAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [newlyEarned]);

  const loadData = async () => {
    if (!user) return;
    try {
      // Check for newly earned badges
      const newBadges = await checkAndAwardBadges(user.id);
      if (newBadges.length > 0) {
        setNewlyEarned(newBadges);
      }

      const [badgesData, profile] = await Promise.all([
        getBadgesWithStatus(user.id),
        getUserProfile(user.id),
      ]);

      setBadges(badgesData);
      if (profile) {
        setLevelInfo(getLevelInfo(profile.total_xp));
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const dismissCongrats = () => {
    Animated.timing(congratsAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setNewlyEarned([]));
  };

  const filteredBadges = badges.filter((badge) => {
    if (filter === 'unlocked') return badge.isUnlocked;
    if (filter === 'locked') return !badge.isUnlocked;
    return true;
  });

  // Group badges by category
  const groupedBadges = CATEGORY_CONFIG.reduce((acc, cat) => {
    const catBadges = filteredBadges.filter((b) => b.category === cat.key);
    if (catBadges.length > 0) {
      acc.push({ ...cat, badges: catBadges });
    }
    return acc;
  }, [] as (typeof CATEGORY_CONFIG[number] & { badges: BadgeWithStatus[] })[]);

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} accessibilityRole="header">Achievements</Text>
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
        >
          <Ionicons
            name={viewMode === 'grid' ? 'list' : 'grid'}
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Congratulations Card for newly earned badges */}
        {newlyEarned.length > 0 && (
          <Animated.View
            style={[
              styles.congratsCard,
              {
                opacity: congratsAnim,
                transform: [
                  {
                    translateY: congratsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                  {
                    scale: congratsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[`${colors.purple}40`, `${colors.teal}20`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.congratsGradient}
            >
              <View style={styles.congratsHeader}>
                <View style={styles.congratsIconRow}>
                  <Ionicons name="trophy" size={24} color={colors.orange} />
                  <Text style={styles.congratsTitle}>
                    🎉 Badge{newlyEarned.length > 1 ? 's' : ''} Unlocked!
                  </Text>
                </View>
                <TouchableOpacity onPress={dismissCongrats}>
                  <Ionicons name="close" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
              {newlyEarned.map((badge) => {
                const rarityColor = rarityColors[badge.rarity];
                return (
                  <View key={badge.id} style={styles.congratsBadgeRow}>
                    <View style={[styles.congratsBadgeIcon, { backgroundColor: `${rarityColor}30` }]}>
                      <Ionicons name={badge.icon_name as any} size={20} color={rarityColor} />
                    </View>
                    <View style={styles.congratsBadgeInfo}>
                      <Text style={styles.congratsBadgeName}>{badge.name}</Text>
                      <Text style={styles.congratsBadgeDesc}>{badge.description}</Text>
                    </View>
                    <Text style={styles.congratsXP}>+{badge.xp_reward} XP</Text>
                  </View>
                );
              })}
            </LinearGradient>
          </Animated.View>
        )}

        {/* XP Progress */}
        {levelInfo && (
          <View style={styles.section}>
            <XPProgressBar levelInfo={levelInfo} />
          </View>
        )}

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{badges.length - unlockedCount}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {badges.length > 0
                ? Math.round((unlockedCount / badges.length) * 100)
                : 0}%
            </Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {(['all', 'unlocked', 'locked'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${f} badges`}
              accessibilityState={{ selected: filter === f }}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Badges by Category */}
        {filteredBadges.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={filter === 'unlocked' ? 'ribbon-outline' : 'lock-closed-outline'}
              size={48}
              color={colors.textTertiary}
            />
            <Text style={styles.emptyText}>
              {filter === 'unlocked'
                ? 'No badges unlocked yet'
                : filter === 'locked'
                ? 'All badges unlocked!'
                : 'No badges available'}
            </Text>
          </View>
        ) : viewMode === 'grid' ? (
          groupedBadges.map((group) => (
            <View key={group.key} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Ionicons
                  name={group.icon as any}
                  size={18}
                  color={colors.purple}
                />
                <Text style={styles.categoryTitle}>{group.label}</Text>
                <Text style={styles.categoryCount}>
                  {group.badges.filter((b) => b.isUnlocked).length}/{group.badges.length}
                </Text>
              </View>
              <View style={styles.grid}>
                {group.badges.map((badge) => (
                  <GridBadgeCard key={badge.id} badge={badge} colors={colors} cardWidth={CARD_WIDTH} />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.section}>
            {filteredBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Grid badge card component
function GridBadgeCard({
  badge,
  colors,
  cardWidth,
}: {
  badge: BadgeWithStatus;
  colors: any;
  cardWidth: number;
}) {
  const styles = createGridStyles(colors, cardWidth);
  const rarityColor = rarityColors[badge.rarity];
  const rarityGradient = rarityGradients[badge.rarity];

  return (
    <View
      style={[styles.card, !badge.isUnlocked && styles.cardLocked]}
      accessibilityLabel={`${badge.name} badge${badge.isUnlocked ? ', earned' : `, locked, progress ${badge.currentValue} of ${badge.requirement_value}`}`}
    >
      {/* Icon */}
      <View style={styles.iconWrapper}>
        {badge.isUnlocked ? (
          <LinearGradient
            colors={rarityGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.iconCircle, colorGlow(rarityColor, 'sm')]}
          >
            <Ionicons name={badge.icon_name as any} size={24} color="#FFFFFF" />
          </LinearGradient>
        ) : (
          <View style={styles.iconCircleLocked}>
            <Ionicons name={badge.icon_name as any} size={24} color={colors.textMuted} />
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={10} color={colors.textTertiary} />
            </View>
          </View>
        )}
      </View>

      {/* Name */}
      <Text
        style={[styles.name, !badge.isUnlocked && styles.textLocked]}
        numberOfLines={1}
      >
        {badge.name}
      </Text>

      {/* Progress or Date */}
      {badge.isUnlocked ? (
        <Text style={styles.earnedDate}>
          {new Date(badge.earnedAt!).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      ) : (
        <View style={styles.progressWrapper}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(badge.progress * 100)}%`,
                  backgroundColor: rarityColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {badge.currentValue}/{badge.requirement_value}
          </Text>
        </View>
      )}
    </View>
  );
}

const createGridStyles = (colors: any, cardWidth: number) =>
  StyleSheet.create({
    card: {
      width: cardWidth,
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      gap: spacing.xs,
    },
    cardLocked: {
      opacity: 0.6,
    },
    iconWrapper: {
      marginBottom: spacing.xs,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircleLocked: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.backgroundElevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    lockOverlay: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    name: {
      ...typography.caption,
      color: colors.textPrimary,
      fontWeight: '600',
      textAlign: 'center',
    },
    textLocked: {
      color: colors.textTertiary,
    },
    earnedDate: {
      ...typography.caption2,
      color: colors.green,
    },
    progressWrapper: {
      width: '100%',
      gap: 2,
    },
    progressTrack: {
      height: 3,
      backgroundColor: colors.backgroundElevated,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    progressText: {
      ...typography.caption2,
      color: colors.textTertiary,
      textAlign: 'center',
      fontSize: 9,
    },
  });

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      ...typography.title2,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
    },
    section: {
      marginBottom: spacing.xl,
    },
    // Congrats card
    congratsCard: {
      marginBottom: spacing.xl,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
    },
    congratsGradient: {
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: `${colors.purple}40`,
    },
    congratsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    congratsIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    congratsTitle: {
      ...typography.headline,
      color: colors.textPrimary,
    },
    congratsBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    congratsBadgeIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    congratsBadgeInfo: {
      flex: 1,
    },
    congratsBadgeName: {
      ...typography.callout,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    congratsBadgeDesc: {
      ...typography.caption2,
      color: colors.textSecondary,
    },
    congratsXP: {
      ...typography.callout,
      color: colors.purple,
      fontWeight: '700',
    },
    // Stats
    statsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      alignItems: 'center',
    },
    statValue: {
      ...typography.title2,
      color: colors.purple,
    },
    statLabel: {
      ...typography.caption,
      color: colors.textTertiary,
      marginTop: spacing.xs,
    },
    // Filters
    filterRow: {
      flexDirection: 'row',
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      padding: spacing.xs,
      marginBottom: spacing.xl,
    },
    filterTab: {
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderRadius: borderRadius.sm,
    },
    filterTabActive: {
      backgroundColor: colors.purple,
      ...colorGlow(colors.purple, 'sm'),
    },
    filterText: {
      ...typography.callout,
      color: colors.textSecondary,
    },
    filterTextActive: {
      color: colors.textPrimary,
    },
    // Category sections
    categorySection: {
      marginBottom: spacing.xl,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    categoryTitle: {
      ...typography.headline,
      color: colors.textPrimary,
      flex: 1,
    },
    categoryCount: {
      ...typography.caption,
      color: colors.textTertiary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: GRID_GAP,
    },
    // Empty state
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
      gap: spacing.md,
    },
    emptyText: {
      ...typography.body,
      color: colors.textTertiary,
    },
  });
