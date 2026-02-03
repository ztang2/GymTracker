import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createSummaryStyles } from './styles';

interface SummaryActionButtonsProps {
  onShare: () => void;
  onSaveAsTemplate?: () => void;
  onClose: () => void;
}

export const SummaryActionButtons: React.FC<SummaryActionButtonsProps> = ({
  onShare,
  onSaveAsTemplate,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = createSummaryStyles(colors);

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={onShare}
        accessibilityRole="button"
        accessibilityLabel="Share workout summary"
      >
        <Ionicons name="share-social-outline" size={18} color={colors.teal} />
        <Text style={styles.shareButtonText}>Share Workout</Text>
      </TouchableOpacity>
      {onSaveAsTemplate && (
        <TouchableOpacity
          style={styles.saveTemplateButton}
          onPress={onSaveAsTemplate}
          accessibilityRole="button"
          accessibilityLabel="Save workout as template"
        >
          <Ionicons name="bookmark-outline" size={18} color={colors.purple} />
          <Text style={styles.saveTemplateButtonText}>Save as Template</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close workout summary"
      >
        <LinearGradient
          colors={colors.gradientTealGreen}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.closeGradient}
        >
          <Text style={styles.closeButtonText}>Done</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
