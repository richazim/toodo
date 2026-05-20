import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioRecorder } from '@/hooks/useAudio';
import { Waveform } from './Waveform';
import { Colors, Spacing, Radius, FontSize } from '../theme/theme';

interface RecordTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, audioUri?: string, audioDuration?: number) => void;
}

type Mode = 'type' | 'record';

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function RecordTaskModal({ visible, onClose, onSave }: RecordTaskModalProps) {
  const [mode, setMode] = useState<Mode>('record');
  const [title, setTitle] = useState('');
  const [recordingResult, setRecordingResult] = useState<{
    uri: string;
    duration: number;
  } | null>(null);

  const recorder = useAudioRecorder();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Pulse animation for record button
  useEffect(() => {
    if (recorder.state === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [recorder.state]);

  const handleStartRecording = async () => {
    setRecordingResult(null);
    await recorder.startRecording();
  };

  const handleStopRecording = async () => {
    const result = await recorder.stopRecording();
    if (result) {
      setRecordingResult(result);
      if (!title) setTitle('Voice note');
    }
  };

  const handleSave = () => {
    const finalTitle = title.trim() || (recordingResult ? 'Voice note' : '');
    if (!finalTitle && !recordingResult) return;
    if (!finalTitle) {
      onSave('Voice note', recordingResult?.uri, recordingResult?.duration);
    } else {
      onSave(finalTitle, recordingResult?.uri, recordingResult?.duration);
    }
    handleClose();
  };

  const handleClose = () => {
    if (recorder.state === 'recording') {
      recorder.cancelRecording();
    }
    setTitle('');
    setRecordingResult(null);
    recorder.reset();
    setMode('record');
    onClose();
  };

  const canSave =
    title.trim().length > 0 || recordingResult !== null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          onPress={handleClose}
          activeOpacity={1}
        />

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Task</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Mode tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'record' && styles.tabActive]}
              onPress={() => setMode('record')}
            >
              <Ionicons
                name="mic-outline"
                size={14}
                color={mode === 'record' ? Colors.accent : Colors.textMuted}
              />
              <Text
                style={[styles.tabText, mode === 'record' && styles.tabTextActive]}
              >
                Voice
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'type' && styles.tabActive]}
              onPress={() => setMode('type')}
            >
              <Ionicons
                name="create-outline"
                size={14}
                color={mode === 'type' ? Colors.accent : Colors.textMuted}
              />
              <Text
                style={[styles.tabText, mode === 'type' && styles.tabTextActive]}
              >
                Type
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Record mode */}
            {mode === 'record' && (
              <View style={styles.recordSection}>
                {/* Waveform */}
                <View style={styles.waveformBox}>
                  <Waveform
                    isActive={recorder.state === 'recording'}
                    color={
                      recorder.state === 'recording'
                        ? Colors.recordActive
                        : recordingResult
                        ? Colors.success
                        : Colors.waveform
                    }
                    height={56}
                    barCount={32}
                  />
                </View>

                {/* Status text */}
                <Text style={styles.recordStatus}>
                  {recorder.state === 'idle' && !recordingResult &&
                    'Tap the button to record'}
                  {recorder.state === 'requesting' && 'Requesting permission…'}
                  {recorder.state === 'recording' &&
                    `Recording  ${formatDuration(recorder.duration)}`}
                  {recorder.state === 'stopped' && recordingResult &&
                    `Recorded  ${formatDuration(recordingResult.duration)}`}
                  {recorder.state === 'error' && (recorder.error ?? 'An error occurred')}
                </Text>

                {/* Record button */}
                {recorder.state !== 'recording' ? (
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <TouchableOpacity
                      style={[
                        styles.recordBtn,
                        recordingResult && styles.recordBtnDone,
                      ]}
                      onPress={handleStartRecording}
                      activeOpacity={0.8}
                    >
                      {recorder.state === 'requesting' ? (
                        <ActivityIndicator color={Colors.white} />
                      ) : (
                        <Ionicons
                          name={recordingResult ? 'refresh' : 'mic'}
                          size={32}
                          color={Colors.white}
                        />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ) : (
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <TouchableOpacity
                      style={styles.stopBtn}
                      onPress={handleStopRecording}
                      activeOpacity={0.8}
                    >
                      <View style={styles.stopIcon} />
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {recordingResult && (
                  <Text style={styles.reRecordHint}>Tap to re-record</Text>
                )}
              </View>
            )}

            {/* Title input — always visible */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                {mode === 'record' ? 'Add a label (optional)' : 'Task title'}
              </Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder={
                  mode === 'record'
                    ? 'e.g. Call dentist…'
                    : 'What needs to be done?'
                }
                placeholderTextColor={Colors.textMuted}
                autoFocus={mode === 'type'}
                returnKeyType="done"
                multiline={false}
                maxLength={200}
              />
            </View>
          </ScrollView>

          {/* Save button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!canSave}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={18} color={Colors.bg} />
              <Text style={styles.saveBtnText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 34,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: 4,
    gap: 4,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  tabActive: {
    backgroundColor: Colors.accentDim,
  },
  tabText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.accent,
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.lg,
  },
  recordSection: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  waveformBox: {
    width: '100%',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordStatus: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  recordBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.recordActive,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.recordActive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  recordBtnDone: {
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
  },
  stopBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.recordActive,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.recordActive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
  reRecordHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: -Spacing.sm,
  },
  inputSection: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.bg,
    letterSpacing: 0.3,
  },
});
