import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';

export default function StatusBadge({ status, label }) {
  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return { bg: colors.successLight, text: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning };
      case 'error':
        return { bg: colors.errorLight, text: colors.error };
      case 'info':
        return { bg: colors.infoLight, text: colors.info };
      default:
        return { bg: colors.borderLight, text: colors.textSecondary };
    }
  };

  const statusColors = getStatusColors();

  return (
    <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
      <View style={[styles.dot, { backgroundColor: statusColors.text }]} />
      <Text style={[styles.label, { color: statusColors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  label: {
    ...typography.smallBold,
  },
});
