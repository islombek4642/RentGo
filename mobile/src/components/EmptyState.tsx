import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SIZES } from '../constants/theme';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * EmptyState Component
 * Displays a friendly message with an illustration (icon) when lists are empty.
 */
const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon size={40} color={COLORS.primary} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    lineHeight: 20,
  },
  button: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary,
  },
});

export default EmptyState;
