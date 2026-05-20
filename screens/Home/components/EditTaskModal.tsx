import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '../theme/theme';
import { Task } from '@/database/type';

interface EditTaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (id: number, title: string) => void;
}

export function EditTaskModal({ task, onClose, onSave }: EditTaskModalProps) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (task) setTitle(task.title);
  }, [task]);

  const handleSave = () => {
    if (!task || !title.trim()) return;
    onSave(task.id, title.trim());
    onClose();
  };

  return (
    <Modal
      visible={!!task}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Edit Task</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            autoFocus
            multiline
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={handleSave}
            placeholderTextColor={Colors.textMuted}
            placeholder="Task title…"
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !title.trim() && styles.disabled]}
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
  },
  saveText: {
    color: Colors.bg,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.4,
  },
});
