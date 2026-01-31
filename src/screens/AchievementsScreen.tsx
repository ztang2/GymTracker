import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AchievementsScreenProps } from '../navigation/types';
import {
  getBadgesWithStatus,
  getUserProfile,
  getLevelInfo,
  type BadgeWithStatus,
  type LevelInfo,
} from '../services';
import {
  LoadingState,
  XPProgressBar,
  BadgeCard,
  LevelBadge,
} from '../components';
import { typography, spacing, borderRadius } from '../constants/theme';
import { useAuth , useTheme } from '../contexts';


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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    try {
      const [badgesData, profile] = await Promise.all([
        getBadgesWithStatus(user?.id),
        getUserProfile(user?.id),
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

  const filteredBadges = badges.filter((badge) => {
    if (filter === 'unlocked') return badge.isUnlocked;
    if (filter === 'locked') return !badge.isUnlocked;
    return true;
  });

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Achievements</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
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

        {/* Badges List */}
        <View style={styles.section}>
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
          ) : (
            filteredBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
  },
  filterText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textPrimary,
  },
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
