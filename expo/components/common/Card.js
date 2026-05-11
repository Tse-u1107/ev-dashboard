import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../theme';

export default function Card({ children, style, variant = 'default' }) {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  default: {},
  outlined: {
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: colors.background,
  },
});
