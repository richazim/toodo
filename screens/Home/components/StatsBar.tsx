import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '../theme/theme';

interface StatsBarProps {
  total: number;
  completed: number;
  withAudio: number;
}

export function StatsBar({ total, completed, withAudio }: StatsBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.value}>{total}</Text>
        <Text style={styles.label}>tasks</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={[styles.value, { color: Colors.success }]}>{completed}</Text>
        <Text style={styles.label}>done</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Ionicons name="mic" size={12} color={Colors.accent} style={{ marginBottom: 2 }} />
        <Text style={[styles.value, { color: Colors.accent }]}>{withAudio}</Text>
        <Text style={styles.label}>audio</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.pctText}>{pct}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  stat: {
    alignItems: 'center',
    minWidth: 36,
  },
  value: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  progressContainer: {
    flex: 1,
    gap: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  pctText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'right',
  },
});
