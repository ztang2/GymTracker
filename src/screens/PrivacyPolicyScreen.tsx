import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '../contexts';
import { spacing, typography, borderRadius } from '../constants/theme';
import type { ProfileStackParamList } from '../navigation/types';

type Props = StackScreenProps<ProfileStackParamList, 'PrivacyPolicyScreen'>;

const PrivacyPolicyScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
          Last Updated: February 1, 2026
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Introduction
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Welcome to LiftArc! We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our fitness tracking application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Data Collection
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            LiftArc collects the following types of information:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • <Text style={styles.bold}>Account Information:</Text> Your email address and password (securely hashed) when you create an account
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • <Text style={styles.bold}>Workout Data:</Text> Exercise records, sets, reps, weights, workout duration, and notes you manually enter
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • <Text style={styles.bold}>Profile Information:</Text> Optional profile details like display name and preferences
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • <Text style={styles.bold}>Usage Data:</Text> App usage patterns and performance metrics to improve functionality
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Data Storage
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Your data is securely stored in the cloud using Supabase, a trusted database service. All data is encrypted in transit using industry-standard SSL/TLS protocols. Your workout data is stored in a secure database with access controls to protect your privacy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Data Usage
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We use your data exclusively for:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Providing you with personalized fitness tracking features
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Displaying your workout history, progress charts, and statistics
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Calculating achievements, badges, and XP progress
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Improving app performance and fixing bugs
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Your workout data is never sold, shared, or used for advertising purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Third-Party Services
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            LiftArc uses the following third-party services:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • <Text style={styles.bold}>Supabase:</Text> For secure data storage and authentication. Supabase complies with GDPR and other privacy regulations.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We do not share your personal workout data with any other third parties, advertisers, or data brokers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Data Retention
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Your workout data is retained as long as your account is active. You can delete individual workouts at any time within the app. If you wish to delete your entire account and all associated data, please contact our support team.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Your Rights
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            You have the right to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Access your personal data stored in the app
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Request corrections to inaccurate data
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Delete your workouts and exercises
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Request complete account deletion
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Export your workout data (contact support)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Security
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We take data security seriously. All connections to our servers are encrypted using SSL/TLS. Passwords are securely hashed using industry-standard algorithms. We regularly update our security practices to protect your information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Children's Privacy
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            LiftArc is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Changes to This Policy
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the "Last Updated" date at the top of this policy. Continued use of the app after changes constitutes acceptance of the updated policy.
          </Text>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            If you have any questions about this Privacy Policy or wish to exercise your rights regarding your data, please contact us at:
          </Text>
          <Text style={[styles.paragraph, { color: colors.purple }]}>
            support@liftarc.app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
    width: 40,
  },
  headerTitle: {
    ...typography.title2,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  lastUpdated: {
    ...typography.caption,
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: spacing.xl,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  bold: {
    fontWeight: '600',
  },
});

export default PrivacyPolicyScreen;
