import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AudioPlayer } from './AudioPlayer';
import { Colors, Spacing, Radius, FontSize } from '../theme/theme';
import { Task } from '@/database/type';

interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TaskCard({ task, onToggle, onDelete, onEdit }: TaskCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const deleteThreshold = -90;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dy) < 30,
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) translateX.setValue(Math.max(gs.dx, -120));
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < deleteThreshold) {
          // Snap to show delete affordance
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Alert.alert('Delete task?', `"${task.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel', onPress: () => {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Animated.parallel([
            Animated.timing(translateX, { toValue: -400, duration: 200, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]).start(() => onDelete(task.id));
        },
      },
    ]);
  };

  return (
    <View style={styles.wrapper}>
      {/* Delete background */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[styles.card, { transform: [{ translateX }], opacity }]}
        {...panResponder.panHandlers}
      >
        {/* Completed accent line */}
        {task.completed && <View style={styles.completedBar} />}

        <View style={styles.row}>
          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => onToggle(task.id)}
            style={[styles.checkbox, task.completed && styles.checkboxDone]}
            activeOpacity={0.7}
          >
            {task.completed && (
              <Ionicons name="checkmark" size={13} color={Colors.bg} />
            )}
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.content}>
            <Text
              style={[styles.title, task.completed && styles.titleDone]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            <View style={styles.meta}>
              <Text style={styles.time}>{formatDate(task.created_at)}</Text>
              {task.audio_uri && (
                <View style={styles.badge}>
                  <Ionicons name="mic" size={9} color={Colors.accent} />
                  <Text style={styles.badgeText}>audio</Text>
                </View>
              )}
            </View>
          </View>

          {/* Edit button */}
          <TouchableOpacity
            onPress={() => onEdit(task)}
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={15} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Audio Player */}
        {task.audio_uri && (
          <View style={styles.audioSection}>
            <AudioPlayer uri={task.audio_uri} duration={task.audio_duration} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.sm,
  },
  deleteText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  completedBar: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    fontWeight: '500',
  },
  titleDone: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  editButton: {
    padding: 4,
  },
  audioSection: {
    marginTop: Spacing.sm,
    paddingLeft: 30,
  },
});
